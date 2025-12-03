<?php

use Illuminate\Support\Facades\Route;

// Ruta principal de la aplicación
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!politica-privacidad).*$');

// Ruta específica para política de privacidad
Route::get('/politica-privacidad', function () {
    return view('politica-privacidad');
});
