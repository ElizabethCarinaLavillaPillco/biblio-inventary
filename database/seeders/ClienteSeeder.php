<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Cliente;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        $clientes = [
            [
                'nombres' => 'Juan Carlos',
                'apellidos' => 'Pérez López',
                'dni' => '45678901',
                'email' => 'juan.perez@gmail.com',
                'password' => Hash::make('password123'),
                'fecha_nacimiento' => '1990-05-15',
                'edad' => 34,
                'telefono' => '987123456',
                'domicilio' => 'Av. Los Incas 123',
                'distrito' => 'Wanchaq',
                'provincia' => 'Cusco',
                'activo' => true,
                'sancionado' => false,
            ],
            [
                'nombres' => 'Ana María',
                'apellidos' => 'García Torres',
                'dni' => '56789012',
                'email' => 'ana.garcia@gmail.com',
                'password' => Hash::make('password123'),
                'fecha_nacimiento' => '1995-08-20',
                'edad' => 29,
                'telefono' => '987123457',
                'domicilio' => 'Jr. Cultura 456',
                'distrito' => 'Cusco',
                'provincia' => 'Cusco',
                'activo' => true,
                'sancionado' => false,
            ],
            [
                'nombres' => 'Pedro Luis',
                'apellidos' => 'Mamani Quispe',
                'dni' => '67890123',
                'email' => 'pedro.mamani@gmail.com',
                'password' => Hash::make('password123'),
                'fecha_nacimiento' => '1988-12-10',
                'edad' => 36,
                'telefono' => '987123458',
                'domicilio' => 'Calle Sol 789',
                'distrito' => 'Santiago',
                'provincia' => 'Cusco',
                'activo' => true,
                'sancionado' => false,
            ],
            [
                'nombres' => 'Carmen Rosa',
                'apellidos' => 'Huamán Ccama',
                'dni' => '78901234',
                'email' => 'carmen.huaman@gmail.com',
                'password' => Hash::make('password123'),
                'fecha_nacimiento' => '2000-03-25',
                'edad' => 24,
                'telefono' => '987123459',
                'domicilio' => 'Av. Pardo 321',
                'distrito' => 'Wanchaq',
                'provincia' => 'Cusco',
                'activo' => true,
                'sancionado' => true,
                'fecha_fin_sancion' => now()->addMonths(2),
                'motivo_sancion' => 'Préstamo vencido por 35 días',
            ],
        ];

        foreach ($clientes as $cliente) {
            Cliente::create($cliente);
        }

        $this->command->info('✓ ' . count($clientes) . ' clientes creados');
    }
}