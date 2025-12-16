import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const CargaMasiva = () => {
    const navigate = useNavigate();
    const [archivo, setArchivo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'
            ];

            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Tipo de archivo inválido',
                    text: 'Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV',
                    confirmButtonColor: '#F44336'
                });
                e.target.value = '';
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'Archivo demasiado grande',
                    text: 'El archivo no debe superar los 5MB',
                    confirmButtonColor: '#F44336'
                });
                e.target.value = '';
                return;
            }

            setArchivo(file);
            setResultado(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!archivo) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo requerido',
                text: 'Por favor selecciona un archivo Excel para cargar',
                confirmButtonColor: '#FF9800'
            });
            return;
        }

        const confirmacion = await Swal.fire({
            title: '¿Iniciar carga masiva?',
            html: `
                <p>Archivo: <strong>${archivo.name}</strong></p>
                <p>Tamaño: <strong>${(archivo.size / 1024).toFixed(2)} KB</strong></p>
                <p style="margin-top: 10px; color: #666; font-size: 13px;">
                    El proceso puede tardar varios minutos dependiendo del tamaño del archivo.
                </p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#9E9E9E',
            confirmButtonText: 'Sí, procesar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) return;

        const formData = new FormData();
        formData.append('archivo', archivo);

        setLoading(true);

        try {
            const response = await axios.post('/libros/carga-masiva', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000
            });

            setResultado(response.data);

            Swal.fire({
                icon: 'success',
                title: '¡Carga completada!',
                html: `
                    <div style="text-align: left;">
                        <p><strong>✅ Registrados:</strong> ${response.data.resumen.registrados}</p>
                        <p><strong>❌ Sin datos:</strong> ${response.data.resumen.sin_datos}</p>
                        <p><strong>🚫 Errores:</strong> ${response.data.resumen.errores}</p>
                    </div>
                `,
                confirmButtonColor: '#4CAF50'
            });
        } catch (error) {
            console.error('Error en carga masiva:', error);

            let errorMessage = 'Error al procesar el archivo';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'El proceso tomó demasiado tiempo. El archivo puede ser muy grande.';
            } else if (error.response?.status === 422) {
                errorMessage = 'Formato de archivo inválido. Verifica que contenga las columnas correctas.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Error al procesar',
                text: errorMessage,
                confirmButtonColor: '#F44336'
            });
        } finally {
            setLoading(false);
        }
    };

    const descargarPlantilla = async () => {
        try {
          const res = await axios.get('/plantilla/descargar', { responseType: 'blob' });
          const blob = new Blob([res.data]);
          const url  = window.URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href     = url;
          a.download = 'plantilla_carga_libros_completa.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
          Swal.fire({ icon:'success', title:'Plantilla descargada', timer: 1500, showConfirmButton: false });
        } catch (e) {
          Swal.fire({ icon:'error', title:'No se pudo descargar la plantilla' });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📤 Carga Masiva de Libros</h1>
                <button
                    onClick={descargarPlantilla}
                    style={styles.btnDownload}
                    type="button"
                >
                    📥 Descargar Plantilla Excel Completa
                </button>
            </div>

            <div style={styles.card}>
                <div style={styles.instructions}>
                    <h3>📋 Instrucciones</h3>
                    <ul style={styles.instructionsList}>
                        <li><strong>Descarga la plantilla Excel</strong> usando el botón verde de arriba</li>
                        <li>La plantilla incluye <strong>21 columnas con TODOS los campos</strong> del libro</li>
                        <li>Solo 3 campos son <strong>OBLIGATORIOS</strong>: Título, Autor y Categoría</li>
                        <li>El resto de campos son <strong>opcionales</strong> (puedes dejarlos vacíos)</li>
                        <li>La plantilla incluye <strong>5 ejemplos</strong> de libros con diferentes niveles de detalle</li>
                        <li>El sistema <strong>creará automáticamente</strong>:
                            <ul style={{marginLeft: '20px', marginTop: '5px'}}>
                                <li>Autores nuevos que no existan</li>
                                <li>Categorías nuevas que no existan</li>
                                <li>Colecciones nuevas que no existan</li>
                                <li>Códigos de inventario únicos</li>
                            </ul>
                        </li>
                        <li><strong>NO subir la primera fila</strong> con los encabezados (Título, Autor, etc.)</li>
                        <li>Tamaño máximo del archivo: <strong>5MB</strong></li>
                    </ul>
                </div>

                <div style={styles.fieldsInfo}>
                    <h4 style={{marginBottom: '10px'}}>📝 Campos disponibles en la plantilla:</h4>
                    <div style={styles.fieldsGrid}>
                        <div style={styles.fieldCategory}>
                            <strong>✅ Obligatorios (3):</strong>
                            <ul style={{marginLeft: '15px', fontSize: '13px'}}>
                                <li>Título</li>
                                <li>Autor</li>
                                <li>Categoría</li>
                            </ul>
                        </div>
                        <div style={styles.fieldCategory}>
                            <strong>🏷️ Identificadores (4):</strong>
                            <ul style={{marginLeft: '15px', fontSize: '13px'}}>
                                <li>Tipo Item</li>
                                <li>ISBN</li>
                                <li>ISSN</li>
                                <li>Colección</li>
                            </ul>
                        </div>
                        <div style={styles.fieldCategory}>
                            <strong>📊 Clasificación (3):</strong>
                            <ul style={{marginLeft: '15px', fontSize: '13px'}}>
                                <li>Clasificación CDD</li>
                                <li>Código CDD</li>
                                <li>Signatura</li>
                            </ul>
                        </div>
                        <div style={styles.fieldCategory}>
                            <strong>📚 Publicación (3):</strong>
                            <ul style={{marginLeft: '15px', fontSize: '13px'}}>
                                <li>Editorial</li>
                                <li>Año Publicación</li>
                                <li>Idioma</li>
                            </ul>
                        </div>
                        <div style={styles.fieldCategory}>
                            <strong>📐 Físico (4):</strong>
                            <ul style={{marginLeft: '15px', fontSize: '13px'}}>
                                <li>Precio</li>
                                <li>Número Páginas</li>
                                <li>Tamaño</li>
                                <li>Color Forro</li>
                            </ul>
                        </div>
                        <div style={styles.fieldCategory}>
                            <strong>📝 Otros (4):</strong>
                            <ul style={{marginLeft: '15px', fontSize: '13px'}}>
                                <li>Resumen</li>
                                <li>Notas</li>
                                <li>Procedencia</li>
                                <li>Estado Libro</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fileInput}>
                        <label style={styles.fileLabel}>
                            {archivo ? (
                                <>
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{archivo.name}</div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        {(archivo.size / 1024).toFixed(2)} KB
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                                    <div>Seleccionar archivo Excel</div>
                                    <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                                        Formatos: .xlsx, .xls, .csv
                                    </div>
                                </>
                            )}
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !archivo}
                        style={{
                            ...styles.btn,
                            opacity: (loading || !archivo) ? 0.5 : 1,
                            cursor: (loading || !archivo) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '⏳ Procesando archivo...' : '📤 Cargar Archivo'}
                    </button>

                    {loading && (
                        <div style={styles.loadingInfo}>
                            <div style={styles.spinner}></div>
                            <p>Procesando archivo, por favor espera...</p>
                            <p style={{ fontSize: '13px', color: '#666' }}>
                                No cierres esta ventana
                            </p>
                        </div>
                    )}
                </form>

                {resultado && (
                    <div style={styles.resultado}>
                        <h3>✅ Resultado de la Carga</h3>

                        <div style={styles.summary}>
                            <div style={{...styles.summaryItem, backgroundColor: '#4CAF50'}}>
                                <div style={styles.summaryValue}>{resultado.resumen.registrados}</div>
                                <div style={styles.summaryLabel}>Registrados</div>
                            </div>
                            <div style={{...styles.summaryItem, backgroundColor: '#F44336'}}>
                                <div style={styles.summaryValue}>{resultado.resumen.sin_datos}</div>
                                <div style={styles.summaryLabel}>Sin Datos</div>
                            </div>
                            <div style={{...styles.summaryItem, backgroundColor: '#9E9E9E'}}>
                                <div style={styles.summaryValue}>{resultado.resumen.errores}</div>
                                <div style={styles.summaryLabel}>Errores</div>
                            </div>
                        </div>

                        {resultado.registrados && resultado.registrados.length > 0 && (
                            <div style={styles.detalles}>
                                <h4>✅ Libros Registrados ({resultado.registrados.length})</h4>
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {resultado.registrados.slice(0, 10).map((reg, i) => (
                                        <div key={i} style={styles.detalle}>
                                            Fila {reg.fila}: {reg.titulo} ({reg.codigo_inventario})
                                            <Link to={`/libros/ver/${reg.libro_id}`} style={styles.link}>
                                                Ver →
                                            </Link>
                                        </div>
                                    ))}
                                    {resultado.registrados.length > 10 && (
                                        <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
                                            ... y {resultado.registrados.length - 10} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {resultado.sin_datos && resultado.sin_datos.length > 0 && (
                            <div style={styles.detalles}>
                                <h4>❌ Filas Sin Datos Completos ({resultado.sin_datos.length})</h4>
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {resultado.sin_datos.map((sd, i) => (
                                        <div key={i} style={styles.detalle}>
                                            Fila {sd.fila}: {sd.titulo || 'Sin título'} - {sd.autor || 'Sin autor'}
                                            <div style={{fontSize: '12px', color: '#666', marginTop: '3px'}}>
                                                {sd.error}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {resultado.errores && resultado.errores.length > 0 && (
                            <div style={styles.detalles}>
                                <h4>🚫 Errores al Procesar ({resultado.errores.length})</h4>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {resultado.errores.map((err, i) => (
                                        <div key={i} style={styles.detalle}>
                                            <div>Fila {err.fila}: {err.titulo}</div>
                                            <div style={{ fontSize: '12px', color: '#F44336', marginTop: '5px' }}>
                                                {err.error}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={styles.actionButtons}>
                            <button
                                onClick={() => {
                                    setArchivo(null);
                                    setResultado(null);
                                }}
                                style={{...styles.btn, backgroundColor: '#9E9E9E'}}
                            >
                                🔄 Nueva Carga
                            </button>
                            <button
                                onClick={() => navigate('/libros')}
                                style={{...styles.btn, backgroundColor: '#2196F3'}}
                            >
                                📚 Ver Todos los Libros
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
    title: { fontSize: '32px', margin: 0 },
    btnDownload: {
        padding: '14px 28px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '16px',
        transition: 'all 0.3s',
        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
    },
    card: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    instructions: {
        backgroundColor: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        borderLeft: '4px solid #2196F3'
    },
    instructionsList: {
        margin: '10px 0',
        paddingLeft: '20px',
        lineHeight: '1.8'
    },
    fieldsInfo: {
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '2px solid #e0e0e0'
    },
    fieldsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '10px'
    },
    fieldCategory: {
        fontSize: '14px',
        lineHeight: '1.6'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    fileInput: { display: 'flex', justifyContent: 'center' },
    fileLabel: {
        padding: '60px 40px',
        border: '3px dashed #2196F3',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2196F3',
        textAlign: 'center',
        width: '100%',
        transition: 'all 0.3s',
        backgroundColor: '#f9f9f9'
    },
    btn: {
        padding: '16px 32px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s'
    },
    loadingInfo: {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #2196F3',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 10px'
    },
    resultado: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
    },
    summary: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px'
    },
    summaryItem: {
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#fff'
    },
    summaryValue: { fontSize: '36px', fontWeight: 'bold' },
    summaryLabel: { fontSize: '14px', marginTop: '5px' },
    detalles: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
    },
    detalle: {
        padding: '10px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    link: {
        color: '#2196F3',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '14px'
    },
    actionButtons: {
        display: 'flex',
        gap: '15px',
        marginTop: '20px',
        justifyContent: 'center'
    }
};

export default CargaMasiva;
