<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Categoria;
use App\Models\Autor;
use App\Models\Ubicacion;

class BibliotecaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. USUARIOS
        echo "Creando usuarios...\n";
        
        // Admin
        $admin = User::create([
            'name' => 'Administrador Principal',
            'email' => 'admin@biblioteca.com',
            'password' => Hash::make('admin2024'),
            'dni' => '12345678',
            'telefono' => '984123456',
            'activo' => true,
            'rol' => 'admin',
        ]);

        // Bibliotecarios
        $maria = User::create([
            'name' => 'Maria Gonzales',
            'email' => 'maria@biblioteca.com',
            'password' => Hash::make('biblioteca2024'),
            'dni' => '87654321',
            'telefono' => '984654321',
            'activo' => true,
            'rol' => 'bibliotecario',
            'creado_por' => $admin->id,
        ]);

        $rosa = User::create([
            'name' => 'Rosa Flores',
            'email' => 'rosa@biblioteca.com',
            'password' => Hash::make('biblioteca2024'),
            'dni' => '45678912',
            'telefono' => '984789123',
            'activo' => true,
            'rol' => 'bibliotecario',
            'creado_por' => $admin->id,
        ]);

        $carmen = User::create([
            'name' => 'Carmen Flores',
            'email' => 'carmen@biblioteca.com',
            'password' => Hash::make('biblioteca2024'),
            'dni' => '78912345',
            'telefono' => '984456789',
            'activo' => true,
            'rol' => 'bibliotecario',
            'creado_por' => $admin->id,
        ]);

        echo "✓ 4 usuarios creados (1 admin, 3 bibliotecarios)\n\n";

        // 2. CATEGORÍAS
        echo "Creando categorías...\n";
        
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
        ];

        foreach ($categorias as $nombre) {
            Categoria::create(['nombre' => $nombre]);
        }

        echo "✓ " . count($categorias) . " categorías creadas\n\n";

        // 3. AUTORES PERUANOS E INTERNACIONALES
        echo "Creando autores...\n";
        
        $autores = [
            'Mario Vargas Llosa',
            'César Vallejo',
            'José María Arguedas',
            'Ciro Alegría',
            'Alfredo Bryce Echenique',
            'Gabriel García Márquez',
            'Jorge Luis Borges',
            'Isabel Allende',
            'Paulo Coelho',
            'Julio Cortázar',
            'Pablo Neruda',
            'Miguel de Cervantes',
            'William Shakespeare',
            'Jane Austen',
            'Charles Dickens',
            'Victor Hugo',
            'Antoine de Saint-Exupéry',
            'Agatha Christie',
            'J.K. Rowling',
            'George Orwell',
        ];

        foreach ($autores as $nombre) {
            Autor::create(['nombre' => $nombre]);
        }

        echo "✓ " . count($autores) . " autores creados\n\n";

        // 4. UBICACIONES
        echo "Creando ubicaciones...\n";
        
        $ubicaciones_data = [
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'B'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'A'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'B'],
            ['anaquel' => 'A', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'A', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'B'],
            ['anaquel' => 'B', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'B', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'B'],
            ['anaquel' => 'B', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'C', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'A'],
        ];

        foreach ($ubicaciones_data as $ub) {
            $codigo = Ubicacion::generarCodigo($ub['anaquel'], $ub['lado'], $ub['nivel'], $ub['seccion']);
            Ubicacion::create([
                'anaquel' => $ub['anaquel'],
                'lado' => $ub['lado'],
                'nivel' => $ub['nivel'],
                'seccion' => $ub['seccion'],
                'codigo' => $codigo,
                'activo' => true,
            ]);
        }

        echo "✓ " . count($ubicaciones_data) . " ubicaciones creadas\n\n";

        // 5. RESUMEN
        echo "\n=================================\n";
        echo "SEEDER COMPLETADO EXITOSAMENTE\n";
        echo "=================================\n\n";
        
        echo "CREDENCIALES DE ACCESO:\n";
        echo "-----------------------\n";
        echo "👤 ADMINISTRADOR:\n";
        echo "   Email: admin@biblioteca.com\n";
        echo "   Pass:  admin2024\n\n";
        
        echo "📚 BIBLIOTECARIOS:\n";
        echo "   Email: maria@biblioteca.com  | Pass: biblioteca2024\n";
        echo "   Email: rosa@biblioteca.com   | Pass: biblioteca2024\n";
        echo "   Email: carmen@biblioteca.com | Pass: biblioteca2024\n\n";
        
        echo "DATOS CREADOS:\n";
        echo "-----------------------\n";
        echo "✓ Usuarios: " . User::count() . "\n";
        echo "✓ Categorías: " . Categoria::count() . "\n";
        echo "✓ Autores: " . Autor::count() . "\n";
        echo "✓ Ubicaciones: " . Ubicacion::count() . "\n\n";
        
        echo "IMPORTANTE: Cambiar las contraseñas en producción.\n\n";
    }
}