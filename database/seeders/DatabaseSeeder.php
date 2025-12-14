<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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