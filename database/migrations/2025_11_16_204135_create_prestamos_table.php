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
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->onDelete('cascade');

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
            $table->boolean('acepta_proteccion_datos')->default(false);

            // Estado del préstamo - ACTUALIZADO
            $table->enum('estado', [
                'pendiente',    // Esperando aprobación
                'aprobado',     // Aprobado pero no entregado
                'activo',       // Libro entregado (en curso)
                'en_curso',     // Sinónimo de activo
                'en_falta',     // Con retraso
                'devuelto',     // Libro devuelto
                'perdido',      // Libro perdido
                'rechazado',    // Préstamo rechazado
                'cancelado'     // Cancelado por el usuario
            ])->default('pendiente');

            $table->date('fecha_devolucion')->nullable();

            // Información del sistema
            $table->foreignId('prestado_por')->nullable()->constrained('users')->onDelete('restrict');
            $table->foreignId('recibido_por')->nullable()->constrained('users')->onDelete('set null');

            // Agregar campos adicionales para el seguimiento
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->timestamp('fecha_rechazo')->nullable();
            $table->text('motivo_rechazo')->nullable();
            $table->integer('dias_retraso')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamos');
    }
};
