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
        // Crear autores
        $arguedas = Autor::create(['nombre' => 'José María Arguedas']);
        $king = Autor::create(['nombre' => 'Stephen King']);
        $dante = Autor::create(['nombre' => 'Dante Alighieri']);

        // Libro 1: Ríos Profundos
        Libro::create([
            'titulo' => 'Ríos Profundos',
            'autor_id' => $arguedas->id,
            'categoria_id' => 2, // Novelas Peruanas
            'precio' => 15.00,
            'ubicacion_id' => 22, // BA2D
            'numero_paginas' => 180,
            'editorial' => 'Norma',
            'tamanio' => 'pequeño',
            'color_forro' => 'amarillo',
            'procedencia' => 'ministerio de cultura',
            'estado_libro' => 'normal',
            'destino_mal_estado' => 'n/a',
            'estado_actual' => 'en biblioteca',
            'tipo_prestamo' => 'n/a',
            'registrado_por' => 1
        ]);

        // Libro 2: IT
        $libroIT = Libro::create([
            'titulo' => 'IT',
            'autor_id' => $king->id,
            'categoria_id' => 3, // Terror
            'precio' => 30.00,
            'ubicacion_id' => 81, // CA4A
            'numero_paginas' => 450,
            'editorial' => 'Noche Oscura',
            'tamanio' => 'grande',
            'color_forro' => 'rojo',
            'procedencia' => 'donaciones',
            'estado_libro' => 'nuevo',
            'destino_mal_estado' => 'n/a',
            'estado_actual' => 'prestado',
            'tipo_prestamo' => 'a domicilio',
            'registrado_por' => 1
        ]);

        // Crear préstamo para IT
        Prestamo::create([
            'libro_id' => $libroIT->id,
            'nombres' => 'Mario Esteban',
            'apellidos' => 'Pérez Gonzales',
            'dni' => '66666666',
            'fecha_nacimiento' => '2000-01-01',
            'edad' => 25,
            'telefono' => '999999999',
            'domicilio' => 'APV Miraflores 1-A',
            'fecha_inicio' => '2025-12-01',
            'fecha_fin' => '2025-12-05',
            'total_dias' => 5,
            'garantia' => 'DNI',
            'tipo_prestamo' => 'a domicilio',
            'estado' => 'activo',
            'prestado_por' => 1
        ]);

        // Libro 3: La Divina Comedia
        Libro::create([
            'titulo' => 'La Divina Comedia',
            'autor_id' => $dante->id,
            'categoria_id' => 4, // Suspenso
            'precio' => 30.00,
            'ubicacion_id' => null, // Sin ubicación porque está en biblioteca comunitaria
            'numero_paginas' => 300,
            'editorial' => 'Santos',
            'tamanio' => 'grande',
            'color_forro' => 'negro',
            'procedencia' => 'ministerio de cultura',
            'estado_libro' => 'mal estado',
            'destino_mal_estado' => 'descartado a biblioteca comunitaria',
            'estado_actual' => 'biblioteca comunitaria',
            'tipo_prestamo' => 'n/a',
            'registrado_por' => 1
        ]);
    }
}
