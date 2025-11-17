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
            'name' => 'María González',
            'email' => 'maria@biblioteca.com',
            'dni' => '12345678',
            'telefono' => '987654321',
            'password' => Hash::make('biblioteca2024'),
            'activo' => true,
            'creado_por' => null,
        ]);

        // Usuario 2 - Personal
        User::create([
            'name' => 'Rosa Mendoza',
            'email' => 'rosa@biblioteca.com',
            'dni' => '23456789',
            'telefono' => '987654322',
            'password' => Hash::make('biblioteca2024'),
            'activo' => true,
            'creado_por' => $admin->id,
        ]);

        // Usuario 3 - Personal
        User::create([
            'name' => 'Carmen Flores',
            'email' => 'carmen@biblioteca.com',
            'dni' => '34567890',
            'telefono' => '987654323',
            'password' => Hash::make('biblioteca2024'),
            'activo' => true,
            'creado_por' => $admin->id,
        ]);
    }
}