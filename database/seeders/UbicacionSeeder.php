<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ubicacion;

class UbicacionSeeder extends Seeder
{
    public function run(): void
    {
        $anaqueles = ['A', 'B', 'C'];
        $lados = ['A', 'B']; // A = Izquierdo, B = Derecho
        $niveles = [1, 2, 3, 4, 5];
        $secciones = ['A', 'B', 'C', 'D'];

        foreach ($anaqueles as $anaquel) {
            foreach ($lados as $lado) {
                foreach ($niveles as $nivel) {
                    foreach ($secciones as $seccion) {
                        $codigo = Ubicacion::generarCodigo($anaquel, $lado, $nivel, $seccion);
                        
                        Ubicacion::create([
                            'anaquel' => $anaquel,
                            'lado' => $lado,
                            'nivel' => $nivel,
                            'seccion' => $seccion,
                            'codigo' => $codigo,
                            'activo' => true
                        ]);
                    }
                }
            }
        }
    }
}
