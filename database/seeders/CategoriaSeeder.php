<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            'Sin Categoría', // ID 1 - default
            'Ficción',
            'Literatura Infantil',
            'Historia del Perú',
            'Ciencias Naturales',
            'Matemáticas',
            'Filosofía',
            'Poesía',
            'Teatro',
            'Biografías',
            'Autoayuda',
            'Cocina',
            'Arte',
            'Música',
            'Deportes',
            'Tecnología',
            'Educación',
            'Derecho',
            'Medicina',
            'Literatura Peruana',
        ];

        foreach ($categorias as $nombre) {
            Categoria::create(['nombre' => $nombre]);
        }

        $this->command->info('✓ ' . count($categorias) . ' categorías creadas');
    }
}
