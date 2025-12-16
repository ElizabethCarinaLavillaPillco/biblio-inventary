import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiBell, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/dashboard');
            console.log('Dashboard data:', response.data);
            setData(response.data);
            setError(null);
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            setError('Error al cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const aprobarReserva = async (id, libroTitulo) => {
        const result = await Swal.fire({
            title: '¿Aprobar esta reserva?',
            html: `<strong>${libroTitulo}</strong><br><br>El libro será marcado como prestado.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#9E9E9E',
            confirmButtonText: 'Sí, aprobar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`/reservas/${id}/aprobar`);
                Swal.fire({
                    icon: 'success',
                    title: '¡Reserva Aprobada!',
                    text: 'La reserva ha sido aprobada exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchDashboardData();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo aprobar la reserva', 'error');
            }
        }
    };

    const rechazarReserva = async (id, libroTitulo) => {
        const { value: motivo } = await Swal.fire({
            title: '¿Rechazar esta reserva?',
            html: `<strong>${libroTitulo}</strong>`,
            input: 'textarea',
            inputLabel: 'Motivo del rechazo',
            inputPlaceholder: 'Escribe el motivo del rechazo...',
            inputAttributes: {
                'aria-label': 'Motivo del rechazo'
            },
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            cancelButtonColor: '#9E9E9E',
            confirmButtonText: 'Rechazar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return '¡Debes escribir un motivo!';
                }
            }
        });

        if (motivo) {
            try {
                await axios.put(`/reservas/${id}/rechazar`, { motivo_rechazo: motivo });
                Swal.fire({
                    icon: 'info',
                    title: 'Reserva Rechazada',
                    text: 'La reserva ha sido rechazada',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchDashboardData();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo rechazar la reserva', 'error');
            }
        }
    };

    if (loading) {
        return <div style={styles.loading}>Cargando dashboard...</div>;
    }

    if (error) {
        return (
            <div style={styles.error}>
                {error}
                <button onClick={fetchDashboardData} style={styles.retryBtn}>
                    🔄 Reintentar
                </button>
            </div>
        );
    }

    if (!data) {
        return <div style={styles.error}>No hay datos disponibles</div>;
    }

    const {
        stats = {},
        stats_mes = {},
        prestamos_por_mes = [],
        libros_mas_prestados = [],
        categorias_populares = [],
        ultimos_libros = [],
        prestamos_recientes = [],
        reservas_pendientes = [],
        prestamos_por_tipo = []
    } = data;

    const statCards = [
        { label: 'Total Libros', value: stats.total_libros || 0, color: '#2196F3', path: '/libros' },
        { label: 'Disponibles', value: stats.libros_disponibles || 0, color: '#4CAF50', path: '/libros' },
        { label: 'Prestados', value: stats.libros_prestados || 0, color: '#FF9800', path: '/prestamos' },
        { label: 'Vencidos', value: stats.prestamos_vencidos || 0, color: '#F44336', path: '/prestamos' },
        { label: 'Autores', value: stats.total_autores || 0, color: '#9C27B0', path: '/autores' },
        { label: 'Categorías', value: stats.total_categorias || 0, color: '#FFEB3B', path: '/categorias' },
        { label: 'Usuarios', value: stats.total_usuarios || 0, color: '#00BCD4', path: '/usuarios' },
        { label: 'Préstamos Activos', value: stats.prestamos_activos || 0, color: '#8BC34A', path: '/prestamos' },
    ];

    const maxPrestamos = prestamos_por_mes.length > 0
        ? Math.max(...prestamos_por_mes.map(item => item.total || 0))
        : 1;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>📊 Dashboard</h1>
                    <p style={styles.subtitle}>Resumen general del sistema</p>
                </div>
                <Link to="/exportaciones" style={styles.btnExport}>
                    📤 Exportaciones BNP
                </Link>
            </div>

            {/* ALERTA DE RESERVAS PENDIENTES - NUEVO */}
            {reservas_pendientes.length > 0 && (
                <div style={styles.alertContainer}>
                    <div style={styles.alertHeader}>
                        <FiBell style={styles.alertIcon} />
                        <h3 style={styles.alertTitle}>
                            {reservas_pendientes.length} Reserva{reservas_pendientes.length > 1 ? 's' : ''} Pendiente{reservas_pendientes.length > 1 ? 's' : ''} de Aprobación
                        </h3>
                    </div>
                    <div style={styles.reservasList}>
                        {reservas_pendientes.map((reserva) => (
                            <div key={reserva.id} style={styles.reservaCard}>
                                <div style={styles.reservaInfo}>
                                    <div style={styles.reservaLibro}>
                                        📖 <strong>{reserva.libro?.titulo}</strong>
                                    </div>
                                    <div style={styles.reservaCliente}>
                                        👤 {reserva.cliente ? `${reserva.cliente.nombres} ${reserva.cliente.apellidos}` : `${reserva.nombres} ${reserva.apellidos}`}
                                    </div>
                                    <div style={styles.reservaFecha}>
                                        📅 Solicitado: {new Date(reserva.created_at).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div style={styles.reservaDetalle}>
                                        🗓️ Del {new Date(reserva.fecha_inicio).toLocaleDateString('es-PE')} al {new Date(reserva.fecha_fin).toLocaleDateString('es-PE')}
                                    </div>
                                    <div style={styles.reservaTipo}>
                                        {reserva.tipo_prestamo === 'a domicilio' ? '🏠' : '📚'} {reserva.tipo_prestamo}
                                    </div>
                                </div>
                                <div style={styles.reservaActions}>
                                    <button
                                        onClick={() => aprobarReserva(reserva.id, reserva.libro?.titulo)}
                                        style={styles.btnAprobar}
                                        title="Aprobar reserva"
                                    >
                                        <FiCheck style={{ marginRight: '5px' }} />
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => rechazarReserva(reserva.id, reserva.libro?.titulo)}
                                        style={styles.btnRechazar}
                                        title="Rechazar reserva"
                                    >
                                        <FiX style={{ marginRight: '5px' }} />
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estadísticas Principales */}
            <div style={styles.statsGrid}>
                {statCards.map((card, index) => (
                    <Link
                        to={card.path}
                        key={index}
                        style={{
                            ...styles.statCard,
                            borderLeftColor: card.color,
                            textDecoration: 'none'
                        }}
                    >
                        <div>
                            <div style={styles.statValue}>{card.value}</div>
                            <div style={styles.statLabel}>{card.label}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Estadísticas del Mes */}
            <div style={styles.sectionTitle}>📅 Estadísticas del Mes Actual</div>
            <div style={styles.monthStatsGrid}>
                <div style={{...styles.monthStatCard, borderTopColor: '#2196F3'}}>
                    <div style={styles.monthStatValue}>{stats_mes.prestamos_por_mes || 0}</div>
                    <div style={styles.monthStatLabel}>Préstamos este mes</div>
                </div>
                <div style={{...styles.monthStatCard, borderTopColor: '#4CAF50'}}>
                    <div style={styles.monthStatValue}>{stats_mes.devoluciones_mes || 0}</div>
                    <div style={styles.monthStatLabel}>Devoluciones este mes</div>
                </div>
                <div style={{...styles.monthStatCard, borderTopColor: '#FF9800'}}>
                    <div style={styles.monthStatValue}>{stats_mes.libros_registrados_mes || 0}</div>
                    <div style={styles.monthStatLabel}>Libros registrados</div>
                </div>
            </div>

            {/* Gráficos */}
            <div style={styles.chartsGrid}>
                {/* Préstamos por Mes */}
                <div style={styles.chartCard}>
                    <h3 style={styles.cardTitle}>📈 Préstamos por Mes (Últimos 6 meses)</h3>
                    <div style={styles.barChart}>
                        {prestamos_por_mes.length > 0 ? (
                            prestamos_por_mes.map((item, index) => (
                                <div key={index} style={styles.barContainer}>
                                    <div
                                        style={{
                                            ...styles.bar,
                                            height: `${((item.total || 0) / maxPrestamos) * 150}px`,
                                            backgroundColor: '#2196F3'
                                        }}
                                    >
                                        <span style={styles.barValue}>{item.total || 0}</span>
                                    </div>
                                    <span style={styles.barLabel}>{item.mes || 'N/A'}</span>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyChart}>No hay datos de préstamos</div>
                        )}
                    </div>
                </div>

                {/* Préstamos por Tipo */}
                <div style={styles.chartCard}>
                    <h3 style={styles.cardTitle}>🏠 Préstamos por Tipo (Este Mes)</h3>
                    <div style={styles.pieChart}>
                        {prestamos_por_tipo.length > 0 ? (
                            prestamos_por_tipo.map((tipo, index) => (
                                <div key={index} style={styles.pieItem}>
                                    <div
                                        style={{
                                            ...styles.pieCircle,
                                            backgroundColor: tipo.tipo_prestamo === 'a domicilio' ? '#2196F3' : '#9C27B0'
                                        }}
                                    >
                                        {tipo.total || 0}
                                    </div>
                                    <div style={styles.pieLabel}>
                                        {tipo.tipo_prestamo === 'a domicilio' ? 'A Domicilio' : 'En Biblioteca'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyChart}>No hay préstamos este mes</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Listas */}
            <div style={styles.listsGrid}>
                {/* Libros Más Prestados */}
                <div style={styles.listCard}>
                    <h3 style={styles.cardTitle}>🏆 Top 5 Libros Más Prestados</h3>
                    <div style={styles.list}>
                        {libros_mas_prestados.length > 0 ? (
                            libros_mas_prestados.map((libro, index) => (
                                <Link
                                    to={`/libros/ver/${libro.id}`}
                                    key={libro.id}
                                    style={styles.listItem}
                                >
                                    <div style={{...styles.rankBadge, backgroundColor: '#2196F3'}}>{index + 1}</div>
                                    <div style={styles.listItemContent}>
                                        <div style={styles.listItemTitle}>{libro.titulo}</div>
                                        <div style={styles.listItemSubtitle}>{libro.autor?.nombre}</div>
                                    </div>
                                    <div style={{...styles.badge, backgroundColor: '#2196F3'}}>
                                        {libro.prestamos_count} préstamos
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No hay datos disponibles</div>
                        )}
                    </div>
                </div>

                {/* Categorías Populares */}
                <div style={styles.listCard}>
                    <h3 style={styles.cardTitle}>🏷️ Categorías Más Populares</h3>
                    <div style={styles.list}>
                        {categorias_populares.length > 0 ? (
                            categorias_populares.map((cat, index) => (
                                <Link
                                    to={`/libros?categoria_id=${cat.id}`}
                                    key={cat.id}
                                    style={styles.listItem}
                                >
                                    <div style={{...styles.rankBadge, backgroundColor: '#FFEB3B', color: '#333'}}>
                                        {index + 1}
                                    </div>
                                    <div style={styles.listItemContent}>
                                        <div style={styles.listItemTitle}>{cat.nombre}</div>
                                    </div>
                                    <div style={{...styles.badge, backgroundColor: '#FFEB3B', color: '#333'}}>
                                        {cat.libros_count} libros
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No hay datos disponibles</div>
                        )}
                    </div>
                </div>

                {/* Últimos Libros */}
                <div style={styles.listCard}>
                    <h3 style={styles.cardTitle}>📚 Últimos Libros Registrados</h3>
                    <div style={styles.list}>
                        {ultimos_libros.length > 0 ? (
                            ultimos_libros.map((libro) => (
                                <Link
                                    to={`/libros/ver/${libro.id}`}
                                    key={libro.id}
                                    style={styles.listItem}
                                >
                                    <div style={styles.listItemContent}>
                                        <div style={styles.listItemTitle}>{libro.titulo}</div>
                                        <div style={styles.listItemSubtitle}>
                                            {libro.autor?.nombre} • {libro.categoria?.nombre}
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: libro.estado_actual === 'en biblioteca' ? '#4CAF50' : '#FF9800'
                                    }}>
                                        {libro.estado_actual}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No hay libros registrados</div>
                        )}
                    </div>
                </div>

                {/* Préstamos Activos */}
                <div style={styles.listCard}>
                    <h3 style={styles.cardTitle}>⏰ Préstamos Activos Recientes</h3>
                    <div style={styles.list}>
                        {prestamos_recientes.length > 0 ? (
                            prestamos_recientes.map((prestamo) => (
                                <div key={prestamo.id} style={styles.listItem}>
                                    <div style={styles.listItemContent}>
                                        <div style={styles.listItemTitle}>{prestamo.libro?.titulo}</div>
                                        <div style={styles.listItemSubtitle}>
                                            {prestamo.nombres} {prestamo.apellidos}
                                        </div>
                                        <div style={styles.listItemMeta}>
                                            Vence: {new Date(prestamo.fecha_fin).toLocaleDateString('es-PE')}
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: new Date(prestamo.fecha_fin) < new Date() ? '#F44336' : '#FF9800'
                                    }}>
                                        {prestamo.tipo_prestamo}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No hay préstamos activos</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1600px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
    title: { fontSize: '32px', margin: 0, color: '#333' },
    subtitle: { fontSize: '14px', color: '#666', marginTop: '5px' },
    btnExport: { padding: '12px 24px', backgroundColor: '#FF5722', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    error: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#F44336', backgroundColor: '#FFEBEE', borderRadius: '8px', margin: '20px' },
    retryBtn: { marginTop: '15px', padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },

    // Estilos de la alerta de reservas pendientes
    alertContainer: {
        backgroundColor: '#FFF3E0',
        border: '2px solid #FF9800',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(255,152,0,0.2)'
    },
    alertHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #FFB74D'
    },
    alertIcon: { fontSize: '28px', color: '#FF9800' },
    alertTitle: { fontSize: '20px', fontWeight: '600', color: '#E65100', margin: 0 },
    reservasList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    reservaCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        border: '1px solid #FFE0B2'
    },
    reservaInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    reservaLibro: { fontSize: '16px', fontWeight: '600', color: '#333' },
    reservaCliente: { fontSize: '14px', color: '#666' },
    reservaFecha: { fontSize: '13px', color: '#999' },
    reservaDetalle: { fontSize: '13px', color: '#666', fontWeight: '500' },
    reservaTipo: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#2196F3',
        backgroundColor: '#E3F2FD',
        padding: '4px 10px',
        borderRadius: '12px',
        display: 'inline-block',
        width: 'fit-content'
    },
    reservaActions: { display: 'flex', gap: '10px', flexShrink: 0 },
    btnAprobar: {
        padding: '10px 18px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        transition: 'all 0.3s',
        boxShadow: '0 2px 4px rgba(76,175,80,0.3)'
    },
    btnRechazar: {
        padding: '10px 18px',
        backgroundColor: '#F44336',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        transition: 'all 0.3s',
        boxShadow: '0 2px 4px rgba(244,67,54,0.3)'
    },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '5px solid', transition: 'transform 0.2s' },
    statValue: { fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' },
    statLabel: { fontSize: '14px', color: '#666' },
    sectionTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '15px', color: '#333' },
    monthStatsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
    monthStatCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderTop: '5px solid', textAlign: 'center' },
    monthStatValue: { fontSize: '36px', fontWeight: 'bold', color: '#333', marginBottom: '10px' },
    monthStatLabel: { fontSize: '14px', color: '#666' },
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' },
    chartCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '18px', marginBottom: '20px', color: '#333', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' },
    barChart: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', paddingTop: '20px' },
    barContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    bar: { width: '60px', backgroundColor: '#2196F3', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10px', color: '#fff', fontWeight: '600', transition: 'height 0.3s' },
    barValue: { fontSize: '14px' },
    barLabel: { fontSize: '12px', color: '#666', textAlign: 'center' },
    pieChart: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '20px' },
    pieItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    pieCircle: { width: '80px', height: '80px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '24px', fontWeight: 'bold' },
    pieLabel: { fontSize: '14px', color: '#666', textAlign: 'center' },
    emptyChart: { textAlign: 'center', padding: '40px', color: '#999', fontSize: '14px' },
    listsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' },
    listCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    list: { display: 'flex', flexDirection: 'column', gap: '10px' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0', textDecoration: 'none', transition: 'background-color 0.2s' },
    rankBadge: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 },
    listItemContent: { flex: 1, marginLeft: '15px' },
    listItemTitle: { fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' },
    listItemSubtitle: { fontSize: '13px', color: '#666' },
    listItemMeta: { fontSize: '12px', color: '#999', marginTop: '4px' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff', flexShrink: 0 },
    emptyState: { textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px' },
};

export default Dashboard;
