<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('dni', 8)->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->date('fecha_nacimiento');
            $table->integer('edad');
            $table->string('telefono', 15);
            $table->string('domicilio', 255);
            $table->string('distrito', 100)->nullable();
            $table->string('provincia', 100)->nullable();
            $table->boolean('activo')->default(true);
            $table->boolean('sancionado')->default(false);
            $table->date('fecha_fin_sancion')->nullable();
            $table->text('motivo_sancion')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};