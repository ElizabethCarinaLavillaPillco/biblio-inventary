import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/dashboard');
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            
            if (error.response?.status === 401) {
                // Si es 401, limpiar y redirigir al login
                localStorage.removeItem('user');
                localStorage.removeItem('authenticated');
                window.location.href = '/';
            } else {
                setError('Error al cargar datos del dashboard');
                setLoading(false);
            }
        }
    };

    if (loading) {
        return <div style={styles.loading}>Cargando dashboard...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    if (!data) {
        return <div style={styles.loading}>No hay datos disponibles</div>;
    }

    const { stats, ultimos_libros, prestamos_recientes, libros_por_categoria } = data;

    const statCards = [
        { label: 'Total Libros', value: stats.total_libros, icon: '📚', color: '#2196F3' },
        { label: 'Disponibles', value: stats.libros_disponibles, icon: '✅', color: '#4CAF50' },
        { label: 'Prestados', value: stats.libros_prestados, icon: '📤', color: '#FF9800' },
        { label: 'Perdidos', value: stats.libros_perdidos, icon: '❌', color: '#F44336' },
        { label: 'Autores', value: stats.total_autores, icon: '✍️', color: '#9C27B0' },
        { label: 'Categorías', value: stats.total_categorias, icon: '🏷️', color: '#FFEB3B' },
        { label: 'Préstamos Activos', value: stats.prestamos_activos, icon: '📋', color: '#00BCD4' },
        { label: 'Préstamos Vencidos', value: stats.prestamos_vencidos, icon: '⚠️', color: '#FF5722' },
    ];

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>📊 Dashboard</h1>

            <div style={styles.statsGrid}>
                {statCards.map((card, index) => (
                    <div key={index} style={{...styles.statCard, borderLeftColor: card.color}}>
                        <div style={styles.statIcon}>{card.icon}</div>
                        <div>
                            <div style={styles.statValue}>{card.value}</div>
                            <div style={styles.statLabel}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>📚 Últimos Libros Registrados</h3>
                    <div style={styles.list}>
                        {ultimos_libros && ultimos_libros.length > 0 ? (
                            ultimos_libros.map((libro) => (
                                <div key={libro.id} style={styles.listItem}>
                                    <div>
                                        <div style={styles.itemTitle}>{libro.titulo}</div>
                                        <div style={styles.itemSubtitle}>
                                            {libro.autor?.nombre} • {libro.categoria?.nombre}
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: getEstadoColor(libro.estado_actual)
                                    }}>
                                        {libro.estado_actual}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No hay libros registrados</div>
                        )}
                    </div>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>📋 Préstamos Activos Recientes</h3>
                    <div style={styles.list}>
                        {prestamos_recientes && prestamos_recientes.length > 0 ? (
                            prestamos_recientes.map((prestamo) => (
                                <div key={prestamo.id} style={styles.listItem}>
                                    <div>
                                        <div style={styles.itemTitle}>{prestamo.libro?.titulo}</div>
                                        <div style={styles.itemSubtitle}>
                                            {prestamo.nombres} {prestamo.apellidos}
                                        </div>
                                        <div style={styles.itemDate}>
                                            Hasta: {new Date(prestamo.fecha_fin).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No hay préstamos activos</div>
                        )}
                    </div>
                </div>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>🏷️ Libros por Categoría</h3>
                <div style={styles.categoriesGrid}>
                    {libros_por_categoria && libros_por_categoria.map((cat) => (
                        <div key={cat.id} style={styles.categoryCard}>
                            <div style={styles.categoryName}>{cat.nombre}</div>
                            <div style={styles.categoryCount}>{cat.libros_count} libros</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const getEstadoColor = (estado) => {
    const colors = {
        'en biblioteca': '#4CAF50',
        'prestado': '#FF9800',
        'perdido': '#F44336',
        'biblioteca comunitaria': '#9E9E9E'
    };
    return colors[estado] || '#2196F3';
};

const styles = {
    container: { padding: '20px' },
    title: { fontSize: '32px', marginBottom: '30px', color: '#333' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    error: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#F44336' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '5px solid' },
    statIcon: { fontSize: '40px' },
    statValue: { fontSize: '32px', fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: '14px', color: '#666', marginTop: '5px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '20px', marginBottom: '20px', color: '#333', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' },
    list: { display: 'flex', flexDirection: 'column', gap: '15px' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' },
    itemTitle: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '5px' },
    itemSubtitle: { fontSize: '14px', color: '#666' },
    itemDate: { fontSize: '12px', color: '#999', marginTop: '5px' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff' },
    emptyState: { textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px' },
    categoriesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' },
    categoryCard: { padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '2px solid #2196F3', textAlign: 'center' },
    categoryName: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' },
    categoryCount: { fontSize: '24px', fontWeight: 'bold', color: '#2196F3' },
};

export default Dashboard;
