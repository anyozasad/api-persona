<?php
namespace App\Http\Controllers;
use App\Models\Producto;
class ProductoController extends CrudController { protected string $modelClass = Producto::class; }
