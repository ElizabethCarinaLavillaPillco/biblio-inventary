<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Autor;
use App\Models\Libro;
use App\Models\Prestamo;

class DatosPruebaSeeder extends Seeder
{
    public function run(): void
    {
        // Crear autores si no existen
        $arguedas = Autor::firstOrCreate(['nombre' => 'José María Arguedas']);
        $king = Autor::firstOrCreate(['nombre' => 'Stephen King']);
        $dante = Autor::firstOrCreate(['nombre' => 'Dante Alighieri']);

        // Libro 1: Ríos Profundos
        $libro1 = Libro::create([
            'titulo' => 'Ríos Profundos',
            'tipo_item' => 'libro',
            'autor_id' => $arguedas->id,
            'categoria_id' => 20, // Literatura Peruana
            'precio' => 15.00,
            'ubicacion_id' => 10, // AB2B
            'numero_paginas' => 180,
            'editorial' => 'Norma',
            'tamanio' => 'pequeño',
            'color_forro' => 'amarillo',
            'procedencia' => 'ministerio de cultura',
            'estado_libro' => 'normal',
            'destino_mal_estado' => 'n/a',
            'estado_actual' => 'en biblioteca',
            'registrado_por' => 1
        ]);

        // Libro 2: IT
        $libroIT = Libro::create([
            'titulo' => 'IT',
            'tipo_item' => 'libro',
            'autor_id' => $king->id,
            'categoria_id' => 16, // Terror
            'precio' => 30.00,
            'ubicacion_id' => 17, // CA1A
            'numero_paginas' => 450,
            'editorial' => 'Noche Oscura',
            'tamanio' => 'grande',
            'color_forro' => 'rojo',
            'procedencia' => 'donaciones',
            'estado_libro' => 'nuevo',
            'destino_mal_estado' => 'n/a',
            'estado_actual' => 'prestado',
            'registrado_por' => 1
        ]);

        // Crear préstamo para IT
        Prestamo::create([
            'libro_id' => $libroIT->id,
            'cliente_id' => 1,
            'nombres' => 'Mario Esteban',
            'apellidos' => 'Pérez Gonzales',
            'dni' => '66666666',
            'fecha_nacimiento' => '2000-01-01',
            'edad' => 25,
            'telefono' => '999999999',
            'domicilio' => 'APV Miraflores 1-A',
            'fecha_inicio' => now()->subDays(2),
            'fecha_fin' => now()->addDays(3),
            'total_dias' => 5,
            'garantia' => 'DNI',
            'tipo_prestamo' => 'a domicilio',
            'estado' => 'en_curso',
            'prestado_por' => 1
        ]);

        // Libro 3: La Divina Comedia
        Libro::create([
            'titulo' => 'La Divina Comedia',
            'tipo_item' => 'libro',
            'autor_id' => $dante->id,
            'categoria_id' => 8, // Poesía
            'precio' => 30.00,
            'ubicacion_id' => null,
            'numero_paginas' => 300,
            'editorial' => 'Santos',
            'tamanio' => 'grande',
            'color_forro' => 'negro',
            'procedencia' => 'ministerio de cultura',
            'estado_libro' => 'mal estado',
            'destino_mal_estado' => 'descartado a biblioteca comunitaria',
            'estado_actual' => 'biblioteca comunitaria',
            'registrado_por' => 1
        ]);

        $this->command->info('✓ Datos de prueba creados');
    }
}