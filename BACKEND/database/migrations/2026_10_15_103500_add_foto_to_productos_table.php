<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('productos') && !Schema::hasColumn('productos', 'foto')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->mediumText('foto')->nullable()->after('descripcion');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('productos') && Schema::hasColumn('productos', 'foto')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropColumn('foto');
            });
        }
    }
};
