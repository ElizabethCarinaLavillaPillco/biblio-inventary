<?php

namespace App\Http\Controllers;

use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Common\Entity\Row;
use Illuminate\Support\Facades\Response;

class PlantillaController extends Controller
{
    /**
     * Descarga la plantilla completa con TODOS los campos del libro en formato Excel (.xlsx)
     */
    public function descargarPlantilla()
    {
        $fileName = 'plantilla_carga_libros_completa.xlsx';

        return Response::stream(function () {
            $writer = WriterEntityFactory::createXLSXWriter();
            $writer->openToBrowser('php://output');

            // ===== ENCABEZADOS CON TODOS LOS CAMPOS =====
            $headers = [
                // OBLIGATORIOS
                'Título (*)',
                'Autor (*)',
                'Categoría (*)',

                // IDENTIFICADORES
                'Tipo Item',
                'ISBN',
                'ISSN',
                'Colección',

                // CLASIFICACIÓN
                'Clasificación CDD',
                'Código CDD',
                'Signatura',

                // PUBLICACIÓN
                'Editorial',
                'Año Publicación',
                'Idioma',

                // ECONÓMICO
                'Precio',

                // FÍSICO
                'Número Páginas',
                'Tamaño',
                'Color Forro',

                // DESCRIPCIÓN
                'Resumen',
                'Notas',

                // PROCEDENCIA Y ESTADO
                'Procedencia',
                'Estado Libro'
            ];
            $writer->addRow(WriterEntityFactory::createRowFromArray($headers));

            // ===== EJEMPLOS COMPLETOS =====
            $ejemplos = [
                [
                    // OBLIGATORIOS
                    'Cien años de soledad',           // Título *
                    'Gabriel García Márquez',         // Autor *
                    'Literatura',                     // Categoría *

                    // IDENTIFICADORES
                    'libro',                          // Tipo Item
                    '978-0-307-47472-8',             // ISBN
                    '',                               // ISSN
                    'Clásicos de la Literatura',      // Colección

                    // CLASIFICACIÓN
                    '800',                            // Clasificación CDD
                    '863',                            // Código CDD
                    'GAR-CIE',                        // Signatura

                    // PUBLICACIÓN
                    'Sudamericana',                   // Editorial
                    1967,                             // Año Publicación
                    'Español',                        // Idioma

                    // ECONÓMICO
                    45.50,                            // Precio

                    // FÍSICO
                    496,                              // Número Páginas
                    'mediano',                        // Tamaño
                    'verde',                          // Color Forro

                    // DESCRIPCIÓN
                    'Obra cumbre del realismo mágico que narra la historia de la familia Buendía', // Resumen
                    'Edición conmemorativa',          // Notas

                    // PROCEDENCIA Y ESTADO
                    'donaciones',                     // Procedencia
                    'normal'                          // Estado Libro
                ],
                [
                    // OBLIGATORIOS
                    'Don Quijote de la Mancha',
                    'Miguel de Cervantes',
                    'Literatura',

                    // IDENTIFICADORES
                    'libro',
                    '978-84-206-0690-0',
                    '',
                    'Clásicos Españoles',

                    // CLASIFICACIÓN
                    '800',
                    '863.3',
                    'CER-QUI',

                    // PUBLICACIÓN
                    'Cátedra',
                    1605,
                    'Español',

                    // ECONÓMICO
                    38.90,

                    // FÍSICO
                    1200,
                    'grande',
                    'rojo',

                    // DESCRIPCIÓN
                    'La obra cumbre de la literatura española y universal',
                    'Edición anotada',

                    // PROCEDENCIA Y ESTADO
                    'ministerio de cultura',
                    'normal'
                ],
                [
                    // OBLIGATORIOS
                    '1984',
                    'George Orwell',
                    'Ciencia Ficción',

                    // IDENTIFICADORES
                    'libro',
                    '978-0-452-28423-4',
                    '',
                    'Distopías',

                    // CLASIFICACIÓN
                    '800',
                    '823',
                    'ORW-198',

                    // PUBLICACIÓN
                    'Debolsillo',
                    1949,
                    'Español',

                    // ECONÓMICO
                    29.90,

                    // FÍSICO
                    326,
                    'pequeño',
                    'azul',

                    // DESCRIPCIÓN
                    'Distopía sobre un régimen totalitario',
                    '',

                    // PROCEDENCIA Y ESTADO
                    'donaciones',
                    'nuevo'
                ],
                [
                    // OBLIGATORIOS
                    'El Principito',
                    'Antoine de Saint-Exupéry',
                    'Infantil',

                    // IDENTIFICADORES
                    'libro',
                    '978-84-9838-512-0',
                    '',
                    'Literatura Infantil',

                    // CLASIFICACIÓN
                    '800',
                    '843',
                    'SAI-PRI',

                    // PUBLICACIÓN
                    'Salamandra',
                    1943,
                    'Español',

                    // ECONÓMICO
                    18.50,

                    // FÍSICO
                    96,
                    'pequeño',
                    'amarillo',

                    // DESCRIPCIÓN
                    'Cuento filosófico sobre la amistad y la vida',
                    'Ilustrado',

                    // PROCEDENCIA Y ESTADO
                    'ministerio de cultura',
                    'normal'
                ],
                [
                    // EJEMPLO CON CAMPOS MÍNIMOS (solo obligatorios)
                    'La Metamorfosis',
                    'Franz Kafka',
                    'Literatura',

                    // Resto vacío (se llenará con valores por defecto)
                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
                ]
            ];

            foreach ($ejemplos as $row) {
                $writer->addRow(WriterEntityFactory::createRowFromArray($row));
            }

            // ===== HOJA DE INSTRUCCIONES =====
            $writer->addRow(WriterEntityFactory::createRowFromArray([])); // Línea vacía
            $writer->addRow(WriterEntityFactory::createRowFromArray([])); // Línea vacía

            $writer->addRow(WriterEntityFactory::createRowFromArray(['📋 INSTRUCCIONES DE USO']));
            $writer->addRow(WriterEntityFactory::createRowFromArray([]));

            $writer->addRow(WriterEntityFactory::createRowFromArray(['CAMPOS OBLIGATORIOS (marcados con *):']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  • Título', '  • Autor', '  • Categoría']));
            $writer->addRow(WriterEntityFactory::createRowFromArray([]));

            $writer->addRow(WriterEntityFactory::createRowFromArray(['VALORES PERMITIDOS:']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  Tipo Item:', 'libro, folleto, traduccion, revista, tesis, manual, diccionario, otro']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  Clasificación CDD:', '000, 100, 200, 300, 400, 500, 600, 700, 800, 900']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  Tamaño:', 'pequeño, mediano, grande']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  Procedencia:', 'ministerio de cultura, donaciones']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  Estado Libro:', 'nuevo, normal, mal estado']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  Idioma:', 'Español (por defecto), Inglés, Francés, etc.']));
            $writer->addRow(WriterEntityFactory::createRowFromArray([]));

            $writer->addRow(WriterEntityFactory::createRowFromArray(['NOTAS IMPORTANTES:']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  • Años válidos: entre 1000 y', date('Y') + 10]));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  • ISBN e ISSN deben ser únicos']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  • Si Autor o Categoría no existen, se crearán automáticamente']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  • Si Colección no existe, se creará automáticamente']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  • Campos vacíos se guardan como NULL (sin dato)']));
            $writer->addRow(WriterEntityFactory::createRowFromArray(['  • NO subir la fila de encabezados']));

            $writer->close();
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }
}
