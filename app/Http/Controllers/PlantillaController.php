<?php

namespace App\Http\Controllers;

use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Common\Entity\Row;
use Illuminate\Support\Facades\Response;

class PlantillaController extends Controller
{
    /**
     * Descarga la plantilla en formato Excel (.xlsx)
     */
    public function descargarPlantilla()
    {
        $fileName = 'plantilla_carga_libros.xlsx';

        return Response::stream(function () {
            $writer = WriterEntityFactory::createXLSXWriter();
            $writer->openToBrowser('php://output');

            // Hoja 1: Instrucciones
            $headers = [
                'Título (*)',
                'Autor (*)',
                'ISBN',
                'Categoría',
                'Precio',
                'Editorial',
                'Año'
            ];
            $writer->addRow(WriterEntityFactory::createRowFromArray($headers));

            // Algunos ejemplos
            $ejemplos = [
                ['Cien años de soledad', 'Gabriel García Márquez', '978-0-307-47472-8', 'Literatura', 45.50, 'Sudamericana', 1967],
                ['Don Quijote de la Mancha', 'Miguel de Cervantes', '978-84-206-0690-0', 'Literatura', 38.90, 'Cátedra', 1605],
                ['1984', 'George Orwell', '978-0-452-28423-4', 'Ciencia Ficción', 29.90, 'Debolsillo', 1949],
                ['El Principito', 'Antoine de Saint-Exupéry', '978-84-9838-512-0', 'Infantil', 18.50, 'Salamandra', 1943],
            ];
            foreach ($ejemplos as $row) {
                $writer->addRow(WriterEntityFactory::createRowFromArray($row));
            }

            // (Opcional) Hoja 2: lista de categorías válidas
            $writer->addNewSheetAndMakeItCurrent();
            $writer->addRow(WriterEntityFactory::createRowFromArray(['Categorías sugeridas']));
            $cats = ['Literatura', 'Ciencia Ficción', 'Infantil', 'Historia', 'Tecnología'];
            foreach ($cats as $c) {
                $writer->addRow(WriterEntityFactory::createRowFromArray([$c]));
            }

            $writer->close();
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }
}