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
        setArchivo(e.target.files[0]);
        setResultado(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!archivo) {
            Swal.fire('Error', 'Por favor selecciona un archivo Excel', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('archivo', archivo);

        setLoading(true);
        try {
            const response = await axios.post('/libros/carga-masiva', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResultado(response.data);
            Swal.fire('¡Completado!', 'Carga masiva procesada', 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error al procesar archivo', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>📤 Carga Masiva de Libros</h1>

            <div style={styles.card}>
                <div style={styles.instructions}>
                    <h3>📋 Instrucciones</h3>
                    <p>• El archivo Excel debe tener las columnas: <strong>Título, Autor, Precio</strong></p>
                    <p>• Los campos Título y Autor son obligatorios</p>
                    <p>• El sistema detectará automáticamente duplicados</p>
                    <p>• Después de la carga, puedes editar cada libro para completar los detalles</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fileInput}>
                        <label style={styles.fileLabel}>
                            {archivo ? '📄 ' + archivo.name : '📁 Seleccionar archivo Excel'}
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !archivo}
                        style={{...styles.btn, opacity: (loading || !archivo) ? 0.5 : 1}}
                    >
                        {loading ? '⏳ Procesando...' : '📤 Cargar Archivo'}
                    </button>
                </form>

                {resultado && (
                    <div style={styles.resultado}>
                        <h3>✅ Resultado de la Carga</h3>
                        <div style={styles.summary}>
                            <div style={{...styles.summaryItem, backgroundColor: '#4CAF50'}}>
                                <div style={styles.summaryValue}>{resultado.resumen.registrados}</div>
                                <div style={styles.summaryLabel}>Registrados</div>
                            </div>
                            <div style={{...styles.summaryItem, backgroundColor: '#FF9800'}}>
                                <div style={styles.summaryValue}>{resultado.resumen.duplicados}</div>
                                <div style={styles.summaryLabel}>Duplicados</div>
                            </div>
                            <div style={{...styles.summaryItem, backgroundColor: '#F44336'}}>
                                <div style={styles.summaryValue}>{resultado.resumen.sin_datos}</div>
                                <div style={styles.summaryLabel}>Sin Datos</div>
                            </div>
                        </div>

                        {resultado.duplicados && resultado.duplicados.length > 0 && (
                            <div style={styles.detalles}>
                                <h4>⚠️ Libros Duplicados</h4>
                                {resultado.duplicados.map((dup, i) => (
                                    <div key={i} style={styles.detalle}>
                                        Fila {dup.fila}: {dup.titulo} - {dup.autor}
                                        <Link to={`/libros/ver/${dup.libro_id}`} style={styles.link}>
                                            Ver libro →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        {resultado.sin_datos && resultado.sin_datos.length > 0 && (
                            <div style={styles.detalles}>
                                <h4>❌ Filas Sin Datos Completos</h4>
                                {resultado.sin_datos.map((sd, i) => (
                                    <div key={i} style={styles.detalle}>
                                        Fila {sd.fila}: {sd.titulo || 'Sin título'} - {sd.autor || 'Sin autor'}
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/libros')}
                            style={{...styles.btn, backgroundColor: '#2196F3', marginTop: '20px'}}
                        >
                            Ver Todos los Libros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '900px' },
    title: { fontSize: '32px', marginBottom: '30px' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    instructions: { backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #2196F3' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    fileInput: { display: 'flex', justifyContent: 'center' },
    fileLabel: { padding: '60px 40px', border: '3px dashed #2196F3', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', fontWeight: '600', color: '#2196F3', textAlign: 'center', width: '100%', transition: 'all 0.3s' },
    btn: { padding: '16px 32px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' },
    resultado: { marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' },
    summary: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' },
    summaryItem: { padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#fff' },
    summaryValue: { fontSize: '36px', fontWeight: 'bold' },
    summaryLabel: { fontSize: '14px', marginTop: '5px' },
    detalles: { marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' },
    detalle: { padding: '10px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    link: { color: '#2196F3', textDecoration: 'none', fontWeight: '600' }
};

export default CargaMasiva;
