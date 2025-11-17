<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            'Sin categoría',
            'Novelas Peruanas',
            'Terror',
            'Suspenso',
            'Historia Universal',
            'Historia Peruana',
            'Derecho Legal',
        ];

        foreach ($categorias as $categoria) {
            Categoria::create(['nombre' => $categoria]);
        }
    }
}
