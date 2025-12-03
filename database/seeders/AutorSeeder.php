<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Autor;

class AutorSeeder extends Seeder
{
    public function run(): void
    {
        $autores = [
            // Autores Peruanos
            'Mario Vargas Llosa',
            'César Vallejo',
            'José María Arguedas',
            'Ciro Alegría',
            'Alfredo Bryce Echenique',
            'Ricardo Palma',
            'Abraham Valdelomar',
            'Martín Adán',
            'Julio Ramón Ribeyro',
            'Manuel Scorza',

            // Autores Latinoamericanos
            'Gabriel García Márquez',
            'Jorge Luis Borges',
            'Isabel Allende',
            'Paulo Coelho',
            'Julio Cortázar',
            'Pablo Neruda',
            'Octavio Paz',
            'Carlos Fuentes',

            // Autores Clásicos
            'Miguel de Cervantes',
            'William Shakespeare',
            'Jane Austen',
            'Charles Dickens',
            'Victor Hugo',
            'Fiódor Dostoyevski',
            'León Tolstói',

            // Autores Contemporáneos
            'Antoine de Saint-Exupéry',
            'Agatha Christie',
            'J.K. Rowling',
            'George Orwell',
            'Haruki Murakami',
            'Stephen King',
        ];

        foreach ($autores as $nombre) {
            Autor::create(['nombre' => $nombre]);
        }

        $this->command->info('✓ ' . count($autores) . ' autores creados');
    }
}
