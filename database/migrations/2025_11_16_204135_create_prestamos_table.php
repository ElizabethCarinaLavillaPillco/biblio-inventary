<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prestamos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('libro_id')->constrained('libros')->onDelete('cascade');
            
            // Datos del solicitante
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('dni', 8);
            $table->date('fecha_nacimiento');
            $table->integer('edad');
            $table->string('telefono', 15);
            $table->string('domicilio', 255);
            
            // Datos del préstamo
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->integer('total_dias');
            $table->string('garantia', 100);
            $table->enum('tipo_prestamo', ['en biblioteca', 'a domicilio']);
            
            // Estado del préstamo
            $table->enum('estado', ['activo', 'devuelto', 'perdido'])->default('activo');
            $table->date('fecha_devolucion')->nullable();
            
            // Información del sistema
            $table->foreignId('prestado_por')->constrained('users')->onDelete('restrict');
            $table->foreignId('recibido_por')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamos');
    }
};