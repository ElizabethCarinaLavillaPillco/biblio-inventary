<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('libros', function (Blueprint $table) {
            $table->id();

            // Información Principal
            $table->string('titulo', 255);
            $table->enum('tipo_item', [
                'libro', 'folleto', 'traduccion', 'revista',
                'tesis', 'manual', 'diccionario', 'otro'
            ])->default('libro');

            $table->foreignId('autor_id')->constrained('autores')->onDelete('restrict');
            $table->string('isbn', 20)->nullable();
            $table->string('issn', 20)->nullable();
            $table->string('codigo_inventario', 50)->unique();
            $table->foreignId('coleccion_id')->nullable()->constrained('colecciones')->onDelete('set null');

            // Clasificación Decimal Dewey
            $table->foreignId('categoria_id')->constrained('categorias')->onDelete('restrict');
            $table->enum('clasificacion_cdd', [
                '000', '100', '200', '300', '400',
                '500', '600', '700', '800', '900'
            ])->nullable();
            $table->string('codigo_cdd', 50)->nullable();

            $table->decimal('precio', 10, 2)->nullable();
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones')->onDelete('set null');
            $table->string('signatura', 50)->nullable();

            // Información adicional
            $table->year('anio_publicacion')->nullable();
            $table->string('idioma', 50)->default('Español');
            $table->text('resumen')->nullable();
            $table->text('notas')->nullable();

            // Información Secundaria (Características físicas)
            $table->integer('numero_paginas')->nullable();
            $table->string('editorial', 100)->nullable();
            $table->enum('tamanio', ['pequeño', 'mediano', 'grande'])->nullable();
            $table->string('color_forro', 50)->nullable();
            $table->enum('procedencia', ['ministerio de cultura', 'donaciones'])->nullable();
            $table->enum('estado_libro', ['nuevo', 'normal', 'mal estado'])->default('normal');

            // Para libros en mal estado
            $table->enum('destino_mal_estado', ['aun en biblioteca', 'descartado a biblioteca comunitaria', 'n/a'])->default('n/a');

            // Estado actual del libro
            $table->enum('estado_actual', ['en biblioteca', 'prestado', 'perdido', 'biblioteca comunitaria'])->default('en biblioteca');

            // Para préstamos
            $table->enum('tipo_prestamo', ['en biblioteca', 'a domicilio', 'n/a'])->default('n/a');

            // Información del sistema
            $table->foreignId('registrado_por')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();

            // ===== ÍNDICES PARA BÚSQUEDA DE COPIAS DEL MISMO LIBRO =====
            $table->index(['titulo', 'autor_id']); // Buscar libros con mismo título y autor
            $table->index('isbn'); // Buscar por ISBN
            $table->index('codigo_inventario'); // Buscar por código único
            $table->index('estado_actual'); // Filtrar por disponibilidad

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('libros');
    }
};
