<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Autor;

class AutorSeeder extends Seeder
{
    public function run(): void
    {
        $autores = [
            // Autores Peruanos (los mismos que en el completo)
            'Gabriel García Márquez',
            'Mario Vargas Llosa',
            'Isabel Allende',
            'Jorge Luis Borges',
            'Pablo Neruda',
            'Julio Cortázar',
            'Octavio Paz',
            'Carlos Fuentes',
            'José Saramago',
            'Gabriela Mistral',
            'José María Arguedas',
            'Ciro Alegría',
            'César Vallejo',
            'Alfredo Bryce Echenique',
            'Manuel Scorza',
            
            // Adicionales del seeder anterior
            'Ricardo Palma',
            'Abraham Valdelomar',
            'Martín Adán',
            'Julio Ramón Ribeyro',
            'Paulo Coelho',
            'Miguel de Cervantes',
            'William Shakespeare',
            'Jane Austen',
            'Charles Dickens',
            'Victor Hugo',
            'Fiódor Dostoyevski',
            'León Tolstói',
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