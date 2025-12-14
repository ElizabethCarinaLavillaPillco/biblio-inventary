<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Libro;
use App\Models\Autor;

class LibroSeeder extends Seeder
{
    public function run(): void
    {
        // Buscar autores por nombre para obtener IDs
        $garciaMarquez = Autor::where('nombre', 'Gabriel García Márquez')->first();
        $vargasLlosa = Autor::where('nombre', 'Mario Vargas Llosa')->first();
        $arguedas = Autor::where('nombre', 'José María Arguedas')->first();
        $borges = Autor::where('nombre', 'Jorge Luis Borges')->first();
        $neruda = Autor::where('nombre', 'Pablo Neruda')->first();
        $king = Autor::where('nombre', 'Stephen King')->first();

        $libros = [
            [
                'titulo' => 'Cien años de soledad',
                'tipo_item' => 'libro',
                'autor_id' => $garciaMarquez->id ?? 1,
                'isbn' => '978-0307474728',
                'coleccion_id' => 2,
                'categoria_id' => 7, // Novelas
                'clasificacion_cdd' => '800',
                'codigo_cdd' => '863/G216',
                'precio' => 45.00,
                'numero_paginas' => 417,
                'editorial' => 'Editorial Sudamericana',
                'anio_publicacion' => 1967,
                'idioma' => 'Español',
                'resumen' => 'Obra maestra del realismo mágico que narra la historia de la familia Buendía.',
                'tamanio' => 'mediano',
                'procedencia' => 'donaciones',
                'estado_libro' => 'normal',
                'estado_actual' => 'en biblioteca',
                'ubicacion_id' => 1,
                'registrado_por' => 2,
            ],
            [
                'titulo' => 'La ciudad y los perros',
                'tipo_item' => 'libro',
                'autor_id' => $vargasLlosa->id ?? 2,
                'isbn' => '978-8420412146',
                'coleccion_id' => 1,
                'categoria_id' => 7,
                'clasificacion_cdd' => '800',
                'codigo_cdd' => '863/V297',
                'precio' => 38.00,
                'numero_paginas' => 408,
                'editorial' => 'Alfaguara',
                'anio_publicacion' => 1963,
                'idioma' => 'Español',
                'resumen' => 'Novela sobre la vida en un colegio militar limeño.',
                'tamanio' => 'mediano',
                'procedencia' => 'ministerio de cultura',
                'estado_libro' => 'normal',
                'estado_actual' => 'en biblioteca',
                'ubicacion_id' => 2,
                'registrado_por' => 2,
            ],
            [
                'titulo' => 'Los ríos profundos',
                'tipo_item' => 'libro',
                'autor_id' => $arguedas->id ?? 11,
                'isbn' => '978-9972663369',
                'coleccion_id' => 1,
                'categoria_id' => 20, // Literatura Peruana
                'clasificacion_cdd' => '800',
                'codigo_cdd' => '863/A694',
                'precio' => 32.00,
                'numero_paginas' => 288,
                'editorial' => 'Peisa',
                'anio_publicacion' => 1958,
                'idioma' => 'Español',
                'resumen' => 'Novela indigenista que retrata la sociedad andina peruana.',
                'tamanio' => 'mediano',
                'procedencia' => 'ministerio de cultura',
                'estado_libro' => 'normal',
                'estado_actual' => 'prestado',
                'ubicacion_id' => 3,
                'registrado_por' => 2,
            ],
            [
                'titulo' => 'IT',
                'tipo_item' => 'libro',
                'autor_id' => $king->id ?? 30,
                'categoria_id' => 16, // Terror
                'precio' => 30.00,
                'ubicacion_id' => 15, // BA2B
                'numero_paginas' => 450,
                'editorial' => 'Noche Oscura',
                'tamanio' => 'grande',
                'color_forro' => 'rojo',
                'procedencia' => 'donaciones',
                'estado_libro' => 'nuevo',
                'destino_mal_estado' => 'n/a',
                'estado_actual' => 'prestado',
                'registrado_por' => 1
            ],
        ];

        foreach ($libros as $libro) {
            Libro::create($libro);
        }

        $this->command->info('✓ ' . count($libros) . ' libros creados');
    }
}