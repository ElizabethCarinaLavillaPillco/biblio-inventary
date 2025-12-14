<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ubicacion;

class UbicacionSeeder extends Seeder
{
    public function run(): void
    {
        $ubicaciones = [
            // Anaquel A
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'B'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'C'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'D'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'A'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'B'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'C'],
            ['anaquel' => 'A', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'D'],
            ['anaquel' => 'A', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'A', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'B'],

            // Anaquel B
            ['anaquel' => 'B', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'B', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'B'],
            ['anaquel' => 'B', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'A'],
            ['anaquel' => 'B', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'B'],
            ['anaquel' => 'B', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'B', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'B'],

            // Anaquel C
            ['anaquel' => 'C', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'A'],
            ['anaquel' => 'C', 'lado' => 'A', 'nivel' => 1, 'seccion' => 'B'],
            ['anaquel' => 'C', 'lado' => 'A', 'nivel' => 2, 'seccion' => 'A'],
            ['anaquel' => 'C', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'A'],
            
            // Adicionales para completar el patrón
            ['anaquel' => 'C', 'lado' => 'B', 'nivel' => 1, 'seccion' => 'B'],
            ['anaquel' => 'C', 'lado' => 'B', 'nivel' => 2, 'seccion' => 'A'],
        ];

        foreach ($ubicaciones as $ub) {
            $codigo = Ubicacion::generarCodigo(
                $ub['anaquel'],
                $ub['lado'],
                $ub['nivel'],
                $ub['seccion']
            );

            Ubicacion::create([
                'anaquel' => $ub['anaquel'],
                'lado' => $ub['lado'],
                'nivel' => $ub['nivel'],
                'seccion' => $ub['seccion'],
                'codigo' => $codigo,
                'activo' => true,
            ]);
        }

        $this->command->info('✓ ' . count($ubicaciones) . ' ubicaciones creadas');
    }
}