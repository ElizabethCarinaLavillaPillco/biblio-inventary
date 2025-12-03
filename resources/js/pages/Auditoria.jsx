import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Auditoria = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        user_id: '',
        modelo: '',
        accion: '',
        fecha_desde: '',
        fecha_hasta: ''
    });
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get('/auditoria', {
                params: { ...filtros, page }
            });
            setLogs(response.data.data);
            setPagination(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const exportarAuditoria = async () => {
        try {
            const response = await axios.get('/auditoria/exportar', {
                params: filtros,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    };

    const getAccionColor = (accion) => {
        const colors = {
            'crear': '#4CAF50',
            'editar': '#FF9800',
            'eliminar': '#F44336',
            'prestar': '#2196F3',
            'devolver': '#00BCD4'
        };
        return colors[accion] || '#9E9E9E';
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📋 Auditoría del Sistema</h1>
                <button onClick={exportarAuditoria} style={styles.btnExport}>
                    📥 Exportar CSV
                </button>
            </div>

            <div style={styles.filters}>
                <select
                    value={filtros.accion}
                    onChange={(e) => setFiltros({...filtros, accion: e.target.value})}
                    style={styles.select}
                >
                    <option value="">Todas las acciones</option>
                    <option value="crear">Crear</option>
                    <option value="editar">Editar</option>
                    <option value="eliminar">Eliminar</option>
                    <option value="prestar">Prestar</option>
                    <option value="devolver">Devolver</option>
                </select>

                <input
                    type="date"
                    value={filtros.fecha_desde}
                    onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
                    style={styles.input}
                    placeholder="Fecha desde"
                />

                <input
                    type="date"
                    value={filtros.fecha_hasta}
                    onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
                    style={styles.input}
                    placeholder="Fecha hasta"
                />

                <button onClick={() => fetchLogs()} style={styles.btnFilter}>
                    🔍 Filtrar
                </button>
            </div>

            {loading ? (
                <div style={styles.loading}>Cargando registros...</div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Fecha/Hora</th>
                                <th style={styles.th}>Usuario</th>
                                <th style={styles.th}>Acción</th>
                                <th style={styles.th}>Modelo</th>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        {new Date(log.created_at).toLocaleString('es-PE')}
                                    </td>
                                    <td style={styles.td}>
                                        {log.user ? log.user.name : 'Sistema'}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: getAccionColor(log.accion)
                                        }}>
                                            {log.accion.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {log.modelo.split('\\').pop()}
                                    </td>
                                    <td style={styles.td}>{log.modelo_id || 'N/A'}</td>
                                    <td style={styles.td}>{log.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination.last_page > 1 && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => fetchLogs(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        style={styles.pageBtn}
                    >
                        ← Anterior
                    </button>
                    <span style={styles.pageInfo}>
                        Página {pagination.current_page} de {pagination.last_page}
                    </span>
                    <button
                        onClick={() => fetchLogs(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        style={styles.pageBtn}
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '32px', margin: 0 },
    btnExport: { padding: '12px 24px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    filters: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
    select: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px' },
    input: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px' },
    btnFilter: { padding: '12px 24px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
    tableContainer: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f5f5f5', padding: '15px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #e0e0e0' },
    tr: { borderBottom: '1px solid #e0e0e0' },
    td: { padding: '15px' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff', display: 'inline-block' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px', padding: '20px' },
    pageBtn: { padding: '10px 20px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
    pageInfo: { fontSize: '16px', color: '#666' }
};

export default Auditoria;