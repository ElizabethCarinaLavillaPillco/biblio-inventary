<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Categoria;
use App\Models\Autor;
use App\Models\Ubicacion;

class BibliotecaSeeder extends Seeder
{
    public function run(): void
    {
        // Si quieres una versión más ligera del seeder completo
        $this->call([
            UserSeeder::class,
            ClienteSeeder::class,
            CategoriaSeeder::class,
            AutorSeeder::class,
            ColeccionSeeder::class,
            UbicacionSeeder::class,
            LibroSeeder::class,
            PrestamoSeeder::class,
        ]);
    }
}