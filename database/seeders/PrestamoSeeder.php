<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prestamo;
use App\Models\Libro;
use App\Models\Cliente;

class PrestamoSeeder extends Seeder
{
    public function run(): void
    {
        // Préstamo activo
        Prestamo::create([
            'libro_id' => 3, // Los ríos profundos
            'cliente_id' => 1,
            'nombres' => 'Juan Carlos',
            'apellidos' => 'Pérez López',
            'dni' => '45678901',
            'fecha_nacimiento' => '1990-05-15',
            'edad' => 34,
            'telefono' => '987123456',
            'domicilio' => 'Av. Los Incas 123',
            'fecha_inicio' => now()->subDays(5),
            'fecha_fin' => now()->addDays(9),
            'total_dias' => 14,
            'dias_retraso' => 0,
            'garantia' => 'DNI',
            'tipo_prestamo' => 'a domicilio',
            'estado' => 'activo',
            'fecha_aprobacion' => now()->subDays(5),
            'prestado_por' => 2,
        ]);

        // Reserva pendiente
        Prestamo::create([
            'libro_id' => 1, // Cien años de soledad
            'cliente_id' => 2,
            'nombres' => 'Ana María',
            'apellidos' => 'García Torres',
            'dni' => '56789012',
            'fecha_nacimiento' => '1995-08-20',
            'edad' => 29,
            'telefono' => '987123457',
            'domicilio' => 'Jr. Cultura 456',
            'fecha_inicio' => now()->addDays(1),
            'fecha_fin' => now()->addDays(15),
            'total_dias' => 14,
            'dias_retraso' => 0,
            'garantia' => 'Carnet de estudiante',
            'tipo_prestamo' => 'en biblioteca',
            'estado' => 'pendiente',
        ]);

        $this->command->info('✓ 2 préstamos creados (1 activo, 1 pendiente)');
    }
}