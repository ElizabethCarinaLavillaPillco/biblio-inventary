<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            // Las mismas categorías del seeder completo
            'Literatura Latinoamericana',
            'Historia del Perú',
            'Ciencias Sociales',
            'Filosofía',
            'Poesía',
            'Cuentos',
            'Novelas',
            'Ensayos',
            'Biografías',
            'Ciencia y Tecnología',
            
            // Adicionales del seeder anterior
            'Sin Categoría',
            'Ficción',
            'Literatura Infantil',
            'Matemáticas',
            'Teatro',
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
            'Terror', // Para compatibilidad con DatosPruebaSeeder
            'Suspenso', // Para compatibilidad con DatosPruebaSeeder
        ];

        foreach ($categorias as $nombre) {
            Categoria::create(['nombre' => $nombre]);
        }

        $this->command->info('✓ ' . count($categorias) . ' categorías creadas');
    }
}