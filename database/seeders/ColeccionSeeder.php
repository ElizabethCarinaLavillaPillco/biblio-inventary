<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Coleccion;

class ColeccionSeeder extends Seeder
{
    public function run(): void
    {
        $colecciones = [
            [
                'nombre' => 'Biblioteca Peruana',
                'descripcion' => 'Colección de autores peruanos clásicos y contemporáneos',
            ],
            [
                'nombre' => 'Obras Maestras Latinoamericanas',
                'descripcion' => 'Grandes obras de la literatura latinoamericana',
            ],
            [
                'nombre' => 'Historia y Patrimonio',
                'descripcion' => 'Libros sobre historia y cultura peruana',
            ],
            [
                'nombre' => 'Poesía Universal',
                'descripcion' => 'Antologías y obras poéticas',
            ],
        ];

        foreach ($colecciones as $coleccion) {
            Coleccion::create($coleccion);
        }

        $this->command->info('✓ ' . count($colecciones) . ' colecciones creadas');
    }
}