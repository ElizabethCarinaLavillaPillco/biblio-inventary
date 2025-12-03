import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Exportaciones = () => {
    const [anioReporte, setAnioReporte] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);

    const exportarMARC21 = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/exportar/marc21', {
                responseType: 'blob'
            });
            descargarArchivo(response.data, `catalogo_marc21_${new Date().toISOString().split('T')[0]}.mrc`);
            Swal.fire('¡Éxito!', 'Catálogo MARC21 exportado', 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo exportar el catálogo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const exportarCSV = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/exportar/csv', {
                responseType: 'blob'
            });
            descargarArchivo(response.data, `catalogo_${new Date().toISOString().split('T')[0]}.csv`);
            Swal.fire('¡Éxito!', 'Catálogo CSV exportado', 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo exportar el catálogo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const exportarReporteBNP = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/exportar/reporte-bnp-csv', {
                params: { anio: anioReporte },
                responseType: 'blob'
            });
            descargarArchivo(response.data, `reporte_bnp_${anioReporte}.csv`);
            Swal.fire('¡Éxito!', `Reporte BNP ${anioReporte} exportado`, 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo generar el reporte', 'error');
        } finally {
            setLoading(false);
        }
    };

    const descargarArchivo = (blob, filename) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>📦 Exportaciones y Reportes</h1>

            <div style={styles.grid}>
                {/* Catálogo MARC21 */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}>📖</div>
                    <h3 style={styles.cardTitle}>Catálogo MARC21</h3>
                    <p style={styles.cardDesc}>
                        Exporta el catálogo completo en formato MARC21 estándar para sistemas bibliotecarios.
                    </p>
                    <button
                        onClick={exportarMARC21}
                        disabled={loading}
                        style={{...styles.btn, backgroundColor: '#2196F3'}}
                    >
                        {loading ? '⏳ Exportando...' : '📥 Exportar MARC21'}
                    </button>
                </div>

                {/* Catálogo CSV */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}>📊</div>
                    <h3 style={styles.cardTitle}>Catálogo CSV</h3>
                    <p style={styles.cardDesc}>
                        Exporta el catálogo completo en formato CSV para análisis en Excel o Google Sheets.
                    </p>
                    <button
                        onClick={exportarCSV}
                        disabled={loading}
                        style={{...styles.btn, backgroundColor: '#4CAF50'}}
                    >
                        {loading ? '⏳ Exportando...' : '📥 Exportar CSV'}
                    </button>
                </div>

                {/* Reporte BNP */}
                <div style={{...styles.card, gridColumn: '1 / -1'}}>
                    <div style={styles.cardIcon}>🏛️</div>
                    <h3 style={styles.cardTitle}>Reporte Estadístico Anual - BNP</h3>
                    <p style={styles.cardDesc}>
                        Genera el reporte estadístico anual requerido por la Biblioteca Nacional del Perú (BNP)
                        según las normas del Sistema Nacional de Bibliotecas.
                    </p>
                    
                    <div style={styles.reporteForm}>
                        <label style={styles.label}>Año del Reporte:</label>
                        <select
                            value={anioReporte}
                            onChange={(e) => setAnioReporte(e.target.value)}
                            style={styles.select}
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                        
                        <button
                            onClick={exportarReporteBNP}
                            disabled={loading}
                            style={{...styles.btn, backgroundColor: '#FF9800'}}
                        >
                            {loading ? '⏳ Generando...' : '📥 Generar Reporte BNP'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={styles.infoBox}>
                <h4 style={styles.infoTitle}>ℹ️ Información Legal</h4>
                <ul style={styles.infoList}>
                    <li>Los reportes cumplen con la <strong>Ley N° 30034</strong> - Sistema Nacional de Bibliotecas</li>
                    <li>Formato compatible con el <strong>Decreto Supremo N° 002-2014-MC</strong></li>
                    <li>Exportaciones válidas para envío a la Biblioteca Nacional del Perú</li>
                    <li>Todos los datos están protegidos según la <strong>Ley N° 29733</strong> (Protección de Datos Personales)</li>
                </ul>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1200px' },
    title: { fontSize: '32px', marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '30px' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' },
    cardIcon: { fontSize: '64px', marginBottom: '15px' },
    cardTitle: { fontSize: '22px', marginBottom: '15px', color: '#333' },
    cardDesc: { fontSize: '14px', color: '#666', marginBottom: '25px', lineHeight: '1.6' },
    btn: { padding: '14px 28px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', width: '100%' },
    reporteForm: { display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', marginTop: '20px' },
    label: { fontSize: '16px', fontWeight: '600', color: '#333' },
    select: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', minWidth: '150px' },
    infoBox: { backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', border: '2px solid #2196F3' },
    infoTitle: { fontSize: '18px', marginBottom: '15px', color: '#1976D2' },
    infoList: { fontSize: '14px', color: '#555', lineHeight: '1.8', paddingLeft: '20px' }
};

export default Exportaciones;