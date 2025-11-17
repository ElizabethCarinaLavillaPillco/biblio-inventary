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
            $table->foreignId('autor_id')->constrained('autores')->onDelete('restrict');
            $table->foreignId('categoria_id')->constrained('categorias')->onDelete('restrict');
            $table->decimal('precio', 10, 2)->nullable();
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones')->onDelete('set null');
            
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
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('libros');
    }
};