<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario 1 - Administrador principal
        $admin = User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@biblioteca.com',
            'dni' => '12345678',
            'telefono' => '987654321',
            'password' => Hash::make('admin123'),
            'activo' => true,
            'rol' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Usuario 2 - Bibliotecario
        $maria = User::create([
            'name' => 'María Gonzales',
            'email' => 'maria@biblioteca.com',
            'dni' => '23456789',
            'telefono' => '987654322',
            'password' => Hash::make('biblioteca2024'),
            'activo' => true,
            'rol' => 'bibliotecario',
            'creado_por' => $admin->id,
            'email_verified_at' => now(),
        ]);

        // Usuario 3 - Bibliotecario
        $rosa = User::create([
            'name' => 'Rosa Flores',
            'email' => 'rosa@biblioteca.com',
            'dni' => '34567890',
            'telefono' => '987654323',
            'password' => Hash::make('biblioteca2024'),
            'activo' => true,
            'rol' => 'bibliotecario',
            'creado_por' => $admin->id,
            'email_verified_at' => now(),
        ]);
        
        // Usuario 4 - Bibliotecario adicional
        User::create([
            'name' => 'Carmen Flores',
            'email' => 'carmen@biblioteca.com',
            'dni' => '45678912',
            'telefono' => '987654324',
            'password' => Hash::make('biblioteca2024'),
            'activo' => true,
            'rol' => 'bibliotecario',
            'creado_por' => $admin->id,
            'email_verified_at' => now(),
        ]);

        $this->command->info('✓ 4 usuarios creados (1 admin, 3 bibliotecarios)');
    }
}