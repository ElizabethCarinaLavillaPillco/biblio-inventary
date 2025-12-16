<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class BiblioSystemCompleteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Deshabilitar verificaciones de claves foráneas temporalmente
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Limpiar tablas en orden correcto
        DB::table('prestamos')->truncate();
        DB::table('libros')->truncate();
        DB::table('colecciones')->truncate();
        DB::table('ubicaciones')->truncate();
        DB::table('categorias')->truncate();
        DB::table('autores')->truncate();
        DB::table('clientes')->truncate();
        DB::table('users')->truncate();

        // Reactivar verificaciones
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ========================================
        // 1. USUARIOS STAFF
        // ========================================
        $adminId = DB::table('users')->insertGetId([
            'name' => 'Admin Principal',
            'email' => 'admin@biblioteca.com',
            'password' => Hash::make('admin123'),
            'dni' => '12345678',
            'telefono' => '987654321',
            'activo' => true,
            'rol' => 'admin',
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $bibliotecarioId = DB::table('users')->insertGetId([
            'name' => 'María Gonzales',
            'email' => 'maria@biblioteca.com',
            'password' => Hash::make('biblioteca2024'),
            'dni' => '23456789',
            'telefono' => '987654322',
            'activo' => true,
            'rol' => 'bibliotecario',
            'creado_por' => $adminId,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'name' => 'Rosa Flores',
            'email' => 'rosa@biblioteca.com',
            'password' => Hash::make('biblioteca2024'),
            'dni' => '34567890',
            'telefono' => '987654323',
            'activo' => true,
            'rol' => 'bibliotecario',
            'creado_por' => $adminId,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ========================================
        // 2. CLIENTES
        // ========================================
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
            $cliente['created_at'] = now();
            $cliente['updated_at'] = now();
            DB::table('clientes')->insert($cliente);
        }

        // ========================================
        // 3. AUTORES
        // ========================================
        $autores = [
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
        ];

        foreach ($autores as $autor) {
            DB::table('autores')->insert([
                'nombre' => $autor,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ========================================
        // 4. CATEGORÍAS
        // ========================================
        $categorias = [
            'Literatura Latinoamericana',
            'Historia del Perú',
            'Ciencias Sociales',
            'Filosofía',
            'Poesía',
            'Cuentos',
            'Novelas',
            'Ensayos',
            'Biografías',
            'Ciencia y Tecnología',
        ];

        foreach ($categorias as $categoria) {
            DB::table('categorias')->insert([
                'nombre' => $categoria,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ========================================
        // 5. COLECCIONES
        // ========================================
        $colecciones = [
            [
                'nombre' => 'Biblioteca Peruana',
                'descripcion' => 'Colección de autores peruanos clásicos y contemporáneos',
            ],
            [
                'nombre' => 'Obras Maestras Latinoamericanas',
                'descripcion' => 'Grandes obras de la literatura latinoamericana',
            ],
            [
                'nombre' => 'Historia y Patrimonio',
                'descripcion' => 'Libros sobre historia y cultura peruana',
            ],
            [
                'nombre' => 'Poesía Universal',
                'descripcion' => 'Antologías y obras poéticas',
            ],
        ];

        foreach ($colecciones as $coleccion) {
            $coleccion['created_at'] = now();
            $coleccion['updated_at'] = now();
            DB::table('colecciones')->insert($coleccion);
        }

        // ========================================
        // 6. UBICACIONES
        // ========================================
        $anaqueles = ['A', 'B', 'C'];
        $lados = ['A', 'B'];
        $niveles = [1, 2, 3, 4, 5];
        $secciones = ['A', 'B', 'C', 'D'];

        foreach ($anaqueles as $anaquel) {
            foreach ($lados as $lado) {
                foreach ($niveles as $nivel) {
                    foreach ($secciones as $seccion) {
                        $codigo = $anaquel . $lado . $nivel . $seccion;
                        DB::table('ubicaciones')->insert([
                            'anaquel' => $anaquel,
                            'lado' => $lado,
                            'nivel' => $nivel,
                            'seccion' => $seccion,
                            'codigo' => $codigo,
                            'activo' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        // ========================================
        // 7. LIBROS
        // ========================================
        $libros = [
            [
                'titulo' => 'Cien años de soledad',
                'tipo_item' => 'libro',
                'autor_id' => 1,
                'isbn' => '978-0307474728',
                'coleccion_id' => 2,
                'categoria_id' => 7,
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
                'registrado_por' => $bibliotecarioId,
            ],
            [
                'titulo' => 'La ciudad y los perros',
                'tipo_item' => 'libro',
                'autor_id' => 2,
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
                'registrado_por' => $bibliotecarioId,
            ],
            [
                'titulo' => 'Los ríos profundos',
                'tipo_item' => 'libro',
                'autor_id' => 11,
                'isbn' => '978-9972663369',
                'coleccion_id' => 1,
                'categoria_id' => 1,
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
                'registrado_por' => $bibliotecarioId,
            ],
            [
                'titulo' => 'Ficciones',
                'tipo_item' => 'libro',
                'autor_id' => 4,
                'isbn' => '978-0307950925',
                'coleccion_id' => 2,
                'categoria_id' => 6,
                'clasificacion_cdd' => '800',
                'codigo_cdd' => '863/B732',
                'precio' => 35.00,
                'numero_paginas' => 174,
                'editorial' => 'Emecé',
                'anio_publicacion' => 1944,
                'idioma' => 'Español',
                'resumen' => 'Colección de cuentos que exploran temas metafísicos y filosóficos.',
                'tamanio' => 'pequeño',
                'procedencia' => 'donaciones',
                'estado_libro' => 'normal',
                'estado_actual' => 'en biblioteca',
                'ubicacion_id' => 4,
                'registrado_por' => $bibliotecarioId,
            ],
            [
                'titulo' => 'Veinte poemas de amor y una canción desesperada',
                'tipo_item' => 'libro',
                'autor_id' => 5,
                'isbn' => '978-8437604695',
                'coleccion_id' => 4,
                'categoria_id' => 5,
                'clasificacion_cdd' => '800',
                'codigo_cdd' => '861/N456',
                'precio' => 25.00,
                'numero_paginas' => 128,
                'editorial' => 'Cátedra',
                'anio_publicacion' => 1924,
                'idioma' => 'Español',
                'resumen' => 'Obra poética más conocida de Pablo Neruda.',
                'tamanio' => 'pequeño',
                'procedencia' => 'donaciones',
                'estado_libro' => 'nuevo',
                'estado_actual' => 'en biblioteca',
                'ubicacion_id' => 5,
                'registrado_por' => $bibliotecarioId,
            ],
        ];

        foreach ($libros as $libro) {
            $libro['created_at'] = now();
            $libro['updated_at'] = now();
            DB::table('libros')->insert($libro);
        }

        // ========================================
        // 8. PRÉSTAMOS
        // ========================================

        // Préstamo activo
        DB::table('prestamos')->insert([
            'libro_id' => 3, // Los ríos profundos (marcado como prestado)
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
            'estado' => 'en_curso',
            'fecha_aprobacion' => now()->subDays(5),
            'prestado_por' => $bibliotecarioId,
            'created_at' => now()->subDays(6),
            'updated_at' => now()->subDays(5),
        ]);

        // Reserva pendiente
        DB::table('prestamos')->insert([
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
            'created_at' => now()->subHours(3),
            'updated_at' => now()->subHours(3),
        ]);

        // Préstamo completado
        DB::table('prestamos')->insert([
            'libro_id' => 2, // La ciudad y los perros
            'cliente_id' => 1,
            'nombres' => 'Juan Carlos',
            'apellidos' => 'Pérez López',
            'dni' => '45678901',
            'fecha_nacimiento' => '1990-05-15',
            'edad' => 34,
            'telefono' => '987123456',
            'domicilio' => 'Av. Los Incas 123',
            'fecha_inicio' => now()->subDays(30),
            'fecha_fin' => now()->subDays(16),
            'total_dias' => 14,
            'dias_retraso' => 0,
            'garantia' => 'DNI',
            'tipo_prestamo' => 'a domicilio',
            'estado' => 'devuelto',
            'fecha_devolucion' => now()->subDays(16),
            'fecha_aprobacion' => now()->subDays(30),
            'prestado_por' => $bibliotecarioId,
            'recibido_por' => $bibliotecarioId,
            'created_at' => now()->subDays(31),
            'updated_at' => now()->subDays(16),
        ]);

        echo "✅ Seeder ejecutado exitosamente!\n\n";
        echo "📊 Datos creados:\n";
        echo "   - 3 usuarios staff (1 admin, 2 bibliotecarios)\n";
        echo "   - 4 clientes\n";
        echo "   - 15 autores\n";
        echo "   - 10 categorías\n";
        echo "   - 4 colecciones\n";
        echo "   - " . count($anaqueles) * count($lados) * count($niveles) * count($secciones) . " ubicaciones\n";
        echo "   - 5 libros\n";
        echo "   - 3 préstamos (1 activo, 1 pendiente, 1 completado)\n\n";
        echo "🔐 Credenciales:\n";
        echo "   Admin: admin@biblioteca.com / admin123\n";
        echo "   Bibliotecario: maria@biblioteca.com / biblioteca2024\n";
        echo "   Cliente: juan.perez@gmail.com / password123\n";
    }
}
