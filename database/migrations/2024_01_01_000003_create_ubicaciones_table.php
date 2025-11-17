<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ubicaciones', function (Blueprint $table) {
            $table->id();
            $table->string('anaquel', 10); // A, B, C
            $table->string('lado', 10); // A (izquierdo), B (derecho)
            $table->integer('nivel'); // 1, 2, 3, 4, 5...
            $table->string('seccion', 10); // A, B, C, D...
            $table->string('codigo', 20)->unique(); // BA2D
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ubicaciones');
    }
};
