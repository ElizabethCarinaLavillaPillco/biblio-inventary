<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('consentimientos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_completo');
            $table->string('dni', 8);
            $table->boolean('acepta_tratamiento_datos')->default(false);
            $table->timestamp('fecha_aceptacion')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('documento_firmado')->nullable(); // Base64 o ruta
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consentimientos');
    }
};
