<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use PDO;
use RuntimeException;
use Throwable;

/**
 * Respaldo SQL portable cuando mysqldump/mariadb-dump no está disponible
 * en Windows/XAMPP. Solo se ejecuta sobre la base activa, con lecturas;
 * nunca altera el esquema ni los registros.
 *
 * Para no prometer una copia incompleta, se niega a exportar esquemas
 * con rutinas, eventos o triggers que no puede reconstruir.
 */
final class PortableMysqlBackup
{
    private function id(string $value): string
    {
        return chr(96).str_replace(chr(96), chr(96).chr(96), $value).chr(96);
    }

    private function write($file, string $data): void
    {
        $length = strlen($data);
        while ($length > 0) {
            $n = fwrite($file, $data);
            if ($n === false || $n === 0) {
                throw new RuntimeException('No se pudo escribir el respaldo SQL portable.');
            }
            $data = substr($data, $n);
            $length -= $n;
        }
    }

    private function assertNoPrograms(PDO $pdo, string $database): void
    {
        foreach ([
            ['ROUTINES', 'ROUTINE_SCHEMA'],
            ['TRIGGERS', 'TRIGGER_SCHEMA'],
            ['EVENTS', 'EVENT_SCHEMA'],
        ] as [$table, $column]) {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.'.$table.' WHERE '.$column.' = ?');
            $stmt->execute([$database]);
            $count = (int) $stmt->fetchColumn();
            $stmt->closeCursor();
            if ($count !== 0) {
                throw new RuntimeException(
                    'La base tiene procedimientos, eventos o disparadores; requiere mysqldump completo.'
                );
            }
        }
    }

    private function sqlValue(PDO $pdo, mixed $value, string $type): string
    {
        if ($value === null) {
            return 'NULL';
        }
        if (preg_match('/(?:blob|binary|bit|geometry|point|polygon|linestring)/i', $type)) {
            return '0x'.bin2hex((string) $value);
        }
        $quoted = $pdo->quote((string) $value);
        if ($quoted === false) {
            throw new RuntimeException('MySQL no pudo escapar un valor para el respaldo.');
        }
        return $quoted;
    }

    public function export(string $file, string $database, array $omitViews = []): void
    {
        $pdo = DB::connection()->getPdo();
        $active = (string) DB::connection()->getDatabaseName();
        if ($active !== $database) {
            throw new RuntimeException('La conexión cambió de base durante el respaldo.');
        }
        $this->assertNoPrograms($pdo, $database);

        $stmt = $pdo->query('SHOW FULL TABLES');
        $tables = [];
        $views = [];
        while (($row = $stmt->fetch(PDO::FETCH_NUM)) !== false) {
            if (strtoupper((string) ($row[1] ?? '')) === 'VIEW') {
                $views[] = (string) $row[0];
            } else {
                $tables[] = (string) $row[0];
            }
        }
        $stmt->closeCursor();
        if ($tables === []) {
            throw new RuntimeException('La base no tiene tablas para respaldar.');
        }

        $out = @fopen($file, 'xb');
        if ($out === false) {
            throw new RuntimeException('No se pudo crear el archivo de respaldo en storage/app/backups.');
        }
        $transaction = false;
        try {
            $this->write($out, "-- Copia portable Mallqui Gym (solo lectura del origen)\n");
            $this->write($out, "-- Restaurar únicamente tras verificar el nombre de la base.\n");
            $this->write($out, "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n");
            $this->write($out, "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\n\n");
            $this->write($out, 'CREATE DATABASE IF NOT EXISTS '.$this->id($database).";\n");
            $this->write($out, 'USE '.$this->id($database).";\n\n");

            $pdo->exec('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            // PDO::beginTransaction mantiene la transacción registrada
            // en el driver, para que commit y rollback funcionen en XAMPP.
            // REPEATABLE READ conserva el mismo snapshot entre tablas InnoDB.
            $pdo->beginTransaction();
            $transaction = true;
            foreach ($tables as $table) {
                $name = $this->id($table);
                $ddl = $pdo->query('SHOW CREATE TABLE '.$name)->fetch(PDO::FETCH_ASSOC);
                if (!is_array($ddl) || empty($ddl['Create Table'])) {
                    throw new RuntimeException('No se pudo obtener el esquema de una tabla.');
                }
                $this->write($out, 'DROP TABLE IF EXISTS '.$name.";\n");
                $this->write($out, (string) $ddl['Create Table'].";\n");

                $meta = $pdo->query('SHOW FULL COLUMNS FROM '.$name)->fetchAll(PDO::FETCH_ASSOC);
                $types = [];
                foreach ($meta as $column) {
                    if (str_contains(strtoupper((string) ($column['Extra'] ?? '')), 'GENERATED')) {
                        continue; // MySQL no permite insertar columnas calculadas.
                    }
                    $types[(string) $column['Field']] = (string) $column['Type'];
                }
                if ($types === []) {
                    throw new RuntimeException('La tabla no contiene columnas exportables.');
                }
                $columns = array_keys($types);
                $colSQL = implode(', ', array_map($this->id(...), $columns));
                $select = $pdo->query('SELECT '.$colSQL.' FROM '.$name);
                try {
                    while (($record = $select->fetch(PDO::FETCH_ASSOC)) !== false) {
                        $values = [];
                        foreach ($columns as $col) {
                            $values[] = $this->sqlValue($pdo, $record[$col] ?? null, $types[$col]);
                        }
                        $this->write(
                            $out,
                            'INSERT INTO '.$name.' ('.$colSQL.') VALUES ('.implode(', ', $values).");\n"
                        );
                    }
                } finally {
                    $select->closeCursor();
                }
                $this->write($out, "\n");
            }
            $pdo->commit();
            $transaction = false;

            foreach ($views as $view) {
                if (in_array($view, $omitViews, true)) {
                    continue; // Las vistas derivadas dañadas se reconstruyen con Laravel.
                }
                $name = $this->id($view);
                $definition = $pdo->query('SHOW CREATE VIEW '.$name)->fetch(PDO::FETCH_ASSOC);
                if (!is_array($definition) || empty($definition['Create View'])) {
                    throw new RuntimeException('No se pudo guardar una vista SQL.');
                }
                $this->write($out, 'DROP VIEW IF EXISTS '.$name.";\n");
                $this->write($out, (string) $definition['Create View'].";\n\n");
            }
            $this->write($out, "SET FOREIGN_KEY_CHECKS=1;\n-- Fin del respaldo portable.\n");
            fflush($out);
        } catch (Throwable $e) {
            if ($transaction && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            fclose($out);
            @unlink($file);
            throw $e;
        }
        fclose($out);
    }
}
