// resources/js/pages/Auditoria.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Auditoria = () => {
    const [logs, setLogs] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [estadisticas, setEstadisticas] = useState(null);

    // Filtros
    const [filtros, setFiltros] = useState({
        user_id: '',
        modelo: '',
        accion: '',
        fecha_desde: '',
        fecha_hasta: ''
    });

    // Estado del modal de detalles
    const [showModal, setShowModal] = useState(false);
    const [logSeleccionado, setLogSeleccionado] = useState(null);

    useEffect(() => {
        fetchLogs();
        fetchUsuarios();
        fetchEstadisticas();
    }, []);

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                ...Object.fromEntries(
                    Object.entries(filtros).filter(([_, v]) => v !== '')
                )
            };

            const response = await axios.get('/auditoria', { params });
            setLogs(response.data.data || []);
            setPagination(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar logs:', error);
            Swal.fire('Error', 'No se pudieron cargar los logs de auditoría', 'error');
            setLoading(false);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('/usuarios');
            setUsuarios(response.data.usuarios?.data || response.data.data || []);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const fetchEstadisticas = async () => {
        try {
            const params = {};
            if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
            if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;

            const response = await axios.get('/auditoria/estadisticas', { params });
            setEstadisticas(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros({ ...filtros, [campo]: valor });
    };

    const aplicarFiltros = () => {
        fetchLogs(1);
        fetchEstadisticas();
    };

    const limpiarFiltros = () => {
        setFiltros({
            user_id: '',
            modelo: '',
            accion: '',
            fecha_desde: '',
            fecha_hasta: ''
        });
        setTimeout(() => {
            fetchLogs(1);
            fetchEstadisticas();
        }, 100);
    };

    const exportarCSV = async () => {
        const params = new URLSearchParams(
          Object.entries(filtros).filter(([, v]) => v !== '')
        );
      
        // crea un enlace temporal con el token de sesión
        const url = `${axios.defaults.baseURL}/auditoria/exportar?${params}`;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';   // mismo origen → manda cookie
        link.click();
      };

    const verDetalles = (log) => {
        setLogSeleccionado(log);
        setShowModal(true);
    };

    const getAccionColor = (accion) => {
        const colores = {
            'crear': '#4CAF50',
            'editar': '#FF9800',
            'eliminar': '#F44336',
            'prestar': '#2196F3',
            'devolver': '#9C27B0',
            'login': '#00BCD4',
            'logout': '#9E9E9E'
        };
        return colores[accion] || '#607D8B';
    };

    const getModeloIcon = (modelo) => {
        const iconos = {
            'Libro': '📚',
            'Prestamo': '📋',
            'User': '👤',
            'Autor': '✏️',
            'Categoria': '🏷️',
            'Ubicacion': '📍'
        };
        return iconos[modelo] || '📄';
    };

    const contarFiltrosActivos = () => {
        return Object.values(filtros).filter(v => v !== '').length;
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>🔍 Auditoría del Sistema</h1>
                    <p style={styles.subtitle}>Registro completo de todas las acciones realizadas</p>
                </div>
                <button onClick={exportarCSV} style={styles.btnExport}>
                    📥 Exportar CSV
                </button>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div style={styles.statsGrid}>
                    <div style={{...styles.statCard, borderLeftColor: '#2196F3'}}>
                        <div style={styles.statValue}>{estadisticas.total_acciones}</div>
                        <div style={styles.statLabel}>Total Acciones</div>
                    </div>
                    {estadisticas.por_accion?.map((item, index) => (
                        <div key={index} style={{...styles.statCard, borderLeftColor: getAccionColor(item.accion)}}>
                            <div style={styles.statValue}>{item.total}</div>
                            <div style={styles.statLabel}>{item.accion}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filtros */}
            <div style={styles.filtersCard}>
                <h3 style={styles.filtersTitle}>
                    🔎 Filtros
                    {contarFiltrosActivos() > 0 && (
                        <span style={styles.filterCount}> ({contarFiltrosActivos()} activos)</span>
                    )}
                </h3>
                <div style={styles.filtersGrid}>
                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Usuario</label>
                        <select
                            value={filtros.user_id}
                            onChange={(e) => handleFiltroChange('user_id', e.target.value)}
                            style={styles.select}
                        >
                            <option value="">Todos los usuarios</option>
                            {usuarios.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Modelo</label>
                        <select
                            value={filtros.modelo}
                            onChange={(e) => handleFiltroChange('modelo', e.target.value)}
                            style={styles.select}
                        >
                            <option value="">Todos los modelos</option>
                            <option value="Libro">📚 Libro</option>
                            <option value="Prestamo">📋 Préstamo</option>
                            <option value="User">👤 Usuario</option>
                            <option value="Autor">✏️ Autor</option>
                            <option value="Categoria">🏷️ Categoría</option>
                            <option value="Ubicacion">📍 Ubicación</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Acción</label>
                        <select
                            value={filtros.accion}
                            onChange={(e) => handleFiltroChange('accion', e.target.value)}
                            style={styles.select}
                        >
                            <option value="">Todas las acciones</option>
                            <option value="crear">✅ Crear</option>
                            <option value="editar">✏️ Editar</option>
                            <option value="eliminar">🗑️ Eliminar</option>
                            <option value="prestar">📤 Prestar</option>
                            <option value="devolver">📥 Devolver</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Fecha Desde</label>
                        <input
                            type="date"
                            value={filtros.fecha_desde}
                            onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Fecha Hasta</label>
                        <input
                            type="date"
                            value={filtros.fecha_hasta}
                            onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.filterActions}>
                    <button onClick={limpiarFiltros} style={{...styles.btn, ...styles.btnSecondary}}>
                        🔄 Limpiar Filtros
                    </button>
                    <button onClick={aplicarFiltros} style={{...styles.btn, ...styles.btnPrimary}}>
                        🔍 Aplicar Filtros
                    </button>
                </div>
            </div>

            {/* Tabla de Logs */}
            {loading ? (
                <div style={styles.loading}>Cargando registros...</div>
            ) : logs.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🔍</div>
                    <p>No se encontraron registros de auditoría</p>
                    {contarFiltrosActivos() > 0 && (
                        <button onClick={limpiarFiltros} style={{...styles.btn, ...styles.btnPrimary}}>
                            Limpiar Filtros
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Fecha</th>
                                    <th style={styles.th}>Usuario</th>
                                    <th style={styles.th}>Acción</th>
                                    <th style={styles.th}>Modelo</th>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>IP</th>
                                    <th style={styles.th}>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.fecha}>
                                                {new Date(log.created_at).toLocaleDateString('es-PE')}
                                            </div>
                                            <div style={styles.hora}>
                                                {new Date(log.created_at).toLocaleTimeString('es-PE')}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.userName}>
                                                {log.user ? log.user.name : 'Sistema'}
                                            </div>
                                            {log.user && (
                                                <div style={styles.userEmail}>{log.user.email}</div>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: getAccionColor(log.accion)
                                            }}>
                                                {log.accion}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.modeloBadge}>
                                                {getModeloIcon(log.modelo)} {log.modelo}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {log.modelo_id || 'N/A'}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.ipAddress}>{log.ip_address}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => verDetalles(log)}
                                                style={styles.btnDetalles}
                                            >
                                                👁️ Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div style={styles.pagination}>
                            <button
                                onClick={() => fetchLogs(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                style={{
                                    ...styles.pageBtn,
                                    opacity: pagination.current_page === 1 ? 0.5 : 1
                                }}
                            >
                                ← Anterior
                            </button>
                            <span style={styles.pageInfo}>
                                Página {pagination.current_page} de {pagination.last_page}
                            </span>
                            <button
                                onClick={() => fetchLogs(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                style={{
                                    ...styles.pageBtn,
                                    opacity: pagination.current_page === pagination.last_page ? 0.5 : 1
                                }}
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modal de Detalles */}
            {showModal && logSeleccionado && (
                <div style={styles.modal} onClick={() => setShowModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>📋 Detalles del Registro</h2>
                            <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                                ✕
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.detailRow}>
                                <strong>ID:</strong> {logSeleccionado.id}
                            </div>
                            <div style={styles.detailRow}>
                                <strong>Usuario:</strong> {logSeleccionado.user?.name || 'Sistema'}
                            </div>
                            <div style={styles.detailRow}>
                                <strong>Acción:</strong> 
                                <span style={{
                                    ...styles.badge,
                                    backgroundColor: getAccionColor(logSeleccionado.accion),
                                    marginLeft: '10px'
                                }}>
                                    {logSeleccionado.accion}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <strong>Modelo:</strong> {getModeloIcon(logSeleccionado.modelo)} {logSeleccionado.modelo}
                            </div>
                            <div style={styles.detailRow}>
                                <strong>ID del Modelo:</strong> {logSeleccionado.modelo_id || 'N/A'}
                            </div>
                            <div style={styles.detailRow}>
                                <strong>Fecha:</strong> {new Date(logSeleccionado.created_at).toLocaleString('es-PE')}
                            </div>
                            <div style={styles.detailRow}>
                                <strong>IP:</strong> {logSeleccionado.ip_address}
                            </div>
                            <div style={styles.detailRow}>
                                <strong>User Agent:</strong>
                                <div style={styles.userAgent}>{logSeleccionado.user_agent}</div>
                            </div>

                            {logSeleccionado.datos_anteriores && (
                                <div style={styles.detailSection}>
                                    <strong>📄 Datos Anteriores:</strong>
                                    <pre style={styles.jsonPre}>
                                        {JSON.stringify(
                                            typeof logSeleccionado.datos_anteriores === 'string'
                                                ? JSON.parse(logSeleccionado.datos_anteriores)
                                                : logSeleccionado.datos_anteriores,
                                            null,
                                            2
                                        )}
                                    </pre>
                                </div>
                            )}

                            {logSeleccionado.datos_nuevos && (
                                <div style={styles.detailSection}>
                                    <strong>📝 Datos Nuevos:</strong>
                                    <pre style={styles.jsonPre}>
                                        {JSON.stringify(
                                            typeof logSeleccionado.datos_nuevos === 'string'
                                                ? JSON.parse(logSeleccionado.datos_nuevos)
                                                : logSeleccionado.datos_nuevos,
                                            null,
                                            2
                                        )}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div style={styles.modalFooter}>
                            <button onClick={() => setShowModal(false)} style={{...styles.btn, ...styles.btnSecondary}}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
    title: { fontSize: '32px', margin: 0, color: '#333' },
    subtitle: { fontSize: '14px', color: '#666', marginTop: '5px' },
    btnExport: { padding: '12px 24px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '5px solid' },
    statValue: { fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' },
    statLabel: { fontSize: '14px', color: '#666', textTransform: 'capitalize' },
    filtersCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' },
    filtersTitle: { fontSize: '20px', marginBottom: '20px', color: '#333' },
    filterCount: { color: '#2196F3', fontSize: '16px' },
    filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
    filterGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#555' },
    select: { padding: '10px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff' },
    input: { padding: '10px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '8px' },
    filterActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    btn: { padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
    btnPrimary: { backgroundColor: '#2196F3', color: '#fff' },
    btnSecondary: { backgroundColor: '#9E9E9E', color: '#fff' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    emptyState: { textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    emptyIcon: { fontSize: '64px', marginBottom: '20px' },
    tableContainer: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f5f5f5', padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #e0e0e0', fontSize: '14px' },
    tr: { borderBottom: '1px solid #e0e0e0', transition: 'background-color 0.2s' },
    td: { padding: '15px', fontSize: '14px' },
    fecha: { fontWeight: '600', color: '#333' },
    hora: { fontSize: '12px', color: '#999', marginTop: '2px' },
    userName: { fontWeight: '600', color: '#333' },
    userEmail: { fontSize: '12px', color: '#666', marginTop: '2px' },
    badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#fff', display: 'inline-block' },
    modeloBadge: { fontSize: '13px', color: '#666' },
    ipAddress: { fontFamily: 'monospace', fontSize: '13px', color: '#666' },
    btnDetalles: { padding: '6px 12px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px', padding: '20px' },
    pageBtn: { padding: '10px 20px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    pageInfo: { fontSize: '14px', color: '#666' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', borderRadius: '12px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
    modalHeader: { padding: '20px', borderBottom: '2px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '24px', margin: 0, color: '#333' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' },
    modalBody: { padding: '20px' },
    detailRow: { padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
    detailSection: { marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' },
    userAgent: { fontSize: '12px', color: '#666', marginTop: '5px', wordBreak: 'break-all' },
    jsonPre: { backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', overflow: 'auto', fontSize: '12px', marginTop: '10px' },
    modalFooter: { padding: '20px', borderTop: '2px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end' },
};

export default Auditoria;