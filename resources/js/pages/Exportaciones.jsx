// resources/js/pages/Exportaciones.jsx

import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaFileCsv, FaFileExcel, FaFileCode, FaChartBar } from 'react-icons/fa';

const Exportaciones = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    const handleExport = async (formato) => {
        setLoading(true);
        
        try {
            let url = '';
            let filename = '';

            switch (formato) {
                case 'csv':
                    url = '/exportaciones/csv';
                    filename = `catalogo_biblioteca_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'excel':
                    url = '/exportaciones/excel';
                    filename = `catalogo_biblioteca_${new Date().toISOString().split('T')[0]}.xls`;
                    break;
                case 'marc':
                    url = '/exportaciones/marc';
                    filename = `catalogo_marc21_${new Date().toISOString().split('T')[0]}.mrc`;
                    break;
                default:
                    throw new Error('Formato no válido');
            }

            const response = await axios.get(url, {
                responseType: 'blob'
            });

            // Crear enlace de descarga
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            Swal.fire('¡Exportado!', 'El archivo se ha descargado correctamente', 'success');

        } catch (error) {
            console.error('Error al exportar:', error);
            Swal.fire('Error', 'No se pudo generar la exportación', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEstadisticas = async () => {
        setLoading(true);
        
        try {
            const response = await axios.get('/exportaciones/estadisticas');
            setStats(response.data);
            
            Swal.fire({
                title: 'Estadísticas Generadas',
                text: 'Revisa los detalles a continuación',
                icon: 'success'
            });

        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar las estadísticas', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>📊 Exportaciones para BNP</h1>
            <p style={styles.subtitle}>
                Genera reportes y exportaciones del catálogo bibliográfico según estándares de la Biblioteca Nacional del Perú
            </p>

            <div style={styles.grid}>
                {/* CSV */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}>
                        <FaFileCsv size={48} color="#4CAF50" />
                    </div>
                    <h3 style={styles.cardTitle}>Exportar CSV</h3>
                    <p style={styles.cardDescription}>
                        Formato universal compatible con Excel, Google Sheets y sistemas de gestión bibliográfica.
                        Incluye todos los campos del catálogo.
                    </p>
                    <ul style={styles.featureList}>
                        <li>✓ Codificación UTF-8</li>
                        <li>✓ Compatible con BNP</li>
                        <li>✓ Todos los campos incluidos</li>
                        <li>✓ Fácil de importar</li>
                    </ul>
                    <button 
                        onClick={() => handleExport('csv')} 
                        disabled={loading}
                        style={{...styles.button, ...styles.buttonGreen}}
                    >
                        {loading ? '⏳ Generando...' : '📥 Descargar CSV'}
                    </button>
                </div>

                {/* Excel */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}>
                        <FaFileExcel size={48} color="#217346" />
                    </div>
                    <h3 style={styles.cardTitle}>Exportar Excel</h3>
                    <p style={styles.cardDescription}>
                        Formato Microsoft Excel (.xls) listo para abrir directamente en Excel o LibreOffice Calc.
                    </p>
                    <ul style={styles.featureList}>
                        <li>✓ Formato .xls nativo</li>
                        <li>✓ Tabla formateada</li>
                        <li>✓ UTF-8 compatible</li>
                        <li>✓ Listado simplificado</li>
                    </ul>
                    <button 
                        onClick={() => handleExport('excel')} 
                        disabled={loading}
                        style={{...styles.button, ...styles.buttonExcel}}
                    >
                        {loading ? '⏳ Generando...' : '📥 Descargar Excel'}
                    </button>
                </div>

                {/* MARC21 */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}>
                        <FaFileCode size={48} color="#2196F3" />
                    </div>
                    <h3 style={styles.cardTitle}>Exportar MARC21</h3>
                    <p style={styles.cardDescription}>
                        Formato estándar internacional para intercambio de registros bibliográficos.
                        Compatible con sistemas profesionales.
                    </p>
                    <ul style={styles.featureList}>
                        <li>✓ Estándar MARC21</li>
                        <li>✓ Compatible BNP</li>
                        <li>✓ Metadatos completos</li>
                        <li>✓ Integración profesional</li>
                    </ul>
                    <button 
                        onClick={() => handleExport('marc')} 
                        disabled={loading}
                        style={{...styles.button, ...styles.buttonBlue}}
                    >
                        {loading ? '⏳ Generando...' : '📥 Descargar MARC21'}
                    </button>
                </div>

                {/* Estadísticas */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}>
                        <FaChartBar size={48} color="#FF9800" />
                    </div>
                    <h3 style={styles.cardTitle}>Estadísticas BNP</h3>
                    <p style={styles.cardDescription}>
                        Reporte estadístico completo del acervo bibliográfico para reportes oficiales a la BNP.
                    </p>
                    <ul style={styles.featureList}>
                        <li>✓ Totales por categoría</li>
                        <li>✓ Clasificación Dewey</li>
                        <li>✓ Estado del acervo</li>
                        <li>✓ Formato JSON</li>
                    </ul>
                    <button 
                        onClick={handleEstadisticas} 
                        disabled={loading}
                        style={{...styles.button, ...styles.buttonOrange}}
                    >
                        {loading ? '⏳ Generando...' : '📊 Ver Estadísticas'}
                    </button>
                </div>
            </div>

            {/* Mostrar estadísticas si existen */}
            {stats && (
                <div style={styles.statsContainer}>
                    <h2 style={styles.statsTitle}>📈 Estadísticas del Acervo</h2>
                    
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{stats.total_materiales}</div>
                            <div style={styles.statLabel}>Total Materiales</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{stats.con_isbn}</div>
                            <div style={styles.statLabel}>Con ISBN</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{stats.con_clasificacion_dewey}</div>
                            <div style={styles.statLabel}>Con Clasificación Dewey</div>
                        </div>
                    </div>

                    <div style={styles.statsDetails}>
                        <div style={styles.statsSection}>
                            <h4>Por Tipo de Material</h4>
                            {Object.entries(stats.por_tipo).map(([tipo, total]) => (
                                <div key={tipo} style={styles.statsRow}>
                                    <span>{tipo}</span>
                                    <strong>{total}</strong>
                                </div>
                            ))}
                        </div>

                        <div style={styles.statsSection}>
                            <h4>Por Estado Actual</h4>
                            {Object.entries(stats.por_estado_actual).map(([estado, total]) => (
                                <div key={estado} style={styles.statsRow}>
                                    <span>{estado}</span>
                                    <strong>{total}</strong>
                                </div>
                            ))}
                        </div>

                        <div style={styles.statsSection}>
                            <h4>Por Antigüedad</h4>
                            {Object.entries(stats.antiguedad).map(([rango, total]) => (
                                <div key={rango} style={styles.statsRow}>
                                    <span>{rango.replace('_', ' ')}</span>
                                    <strong>{total}</strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            const dataStr = JSON.stringify(stats, null, 2);
                            const blob = new Blob([dataStr], { type: 'application/json' });
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `estadisticas_${new Date().toISOString().split('T')[0]}.json`;
                            link.click();
                        }}
                        style={{...styles.button, ...styles.buttonOrange, marginTop: '20px'}}
                    >
                        💾 Descargar JSON
                    </button>
                </div>
            )}

            {/* Información adicional */}
            <div style={styles.infoBox}>
                <h3>ℹ️ Información Importante</h3>
                <ul>
                    <li><strong>CSV:</strong> Recomendado para importar a otros sistemas o analizar en Excel</li>
                    <li><strong>Excel:</strong> Para visualización y edición rápida en Microsoft Excel</li>
                    <li><strong>MARC21:</strong> Estándar internacional para sistemas bibliotecarios profesionales</li>
                    <li><strong>Estadísticas:</strong> Reportes oficiales para la Biblioteca Nacional del Perú (BNP)</li>
                </ul>
                <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                    <strong>Nota:</strong> Todos los archivos incluyen codificación UTF-8 para correcta visualización de caracteres especiales y tildes.
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
    title: { fontSize: '32px', marginBottom: '10px', color: '#333' },
    subtitle: { fontSize: '16px', color: '#666', marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    cardIcon: { marginBottom: '20px' },
    cardTitle: { fontSize: '22px', marginBottom: '15px', color: '#333' },
    cardDescription: { fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.6' },
    featureList: { listStyle: 'none', padding: 0, marginBottom: '25px', textAlign: 'left', width: '100%' },
    button: { padding: '14px 28px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', width: '100%' },
    buttonGreen: { backgroundColor: '#4CAF50', color: '#fff' },
    buttonExcel: { backgroundColor: '#217346', color: '#fff' },
    buttonBlue: { backgroundColor: '#2196F3', color: '#fff' },
    buttonOrange: { backgroundColor: '#FF9800', color: '#fff' },
    statsContainer: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: '30px' },
    statsTitle: { fontSize: '24px', marginBottom: '25px', color: '#333', borderBottom: '2px solid #e0e0e0', paddingBottom: '15px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', textAlign: 'center' },
    statValue: { fontSize: '36px', fontWeight: 'bold', color: '#2196F3', marginBottom: '10px' },
    statLabel: { fontSize: '14px', color: '#666' },
    statsDetails: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' },
    statsSection: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' },
    statsRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e0e0e0' },
    infoBox: { backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', marginTop: '30px', borderLeft: '4px solid #2196F3' },
};

export default Exportaciones;