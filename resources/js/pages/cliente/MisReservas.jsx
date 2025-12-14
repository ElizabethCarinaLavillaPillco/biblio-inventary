import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaBook, FaCalendar, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas');

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            const response = await axios.get('/cliente/reservas');
            setReservas(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            Swal.fire('Error', 'No se pudieron cargar tus reservas', 'error');
            setLoading(false);
        }
    };

    const handleCancelar = async (id, tituloLibro) => {
        const result = await Swal.fire({
            title: '¿Cancelar reserva?',
            text: `¿Estás seguro de cancelar la reserva de "${tituloLibro}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            cancelButtonColor: '#9E9E9E',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/cliente/reservas/${id}`);
                Swal.fire('¡Cancelada!', 'Tu reserva ha sido cancelada', 'success');
                fetchReservas();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo cancelar', 'error');
            }
        }
    };

    const reservasFiltradas = reservas.filter(reserva => {
        if (filtro === 'todas') return true;
        return reserva.estado === filtro;
    });

    const getEstadoConfig = (estado) => {
        const configs = {
            'pendiente': {
                icon: <FaClock />,
                color: '#FF9800',
                label: 'Pendiente de Aprobación',
                descripcion: 'Tu solicitud está siendo revisada por el personal'
            },
            'aprobado': {
                icon: <FaCheckCircle />,
                color: '#4CAF50',
                label: 'Aprobada',
                descripcion: 'Puedes recoger el libro en la biblioteca'
            },
            'en_curso': {
                icon: <FaBook />,
                color: '#2196F3',
                label: 'En Curso',
                descripcion: 'Ya tienes el libro en préstamo'
            },
            'devuelto': {
                icon: <FaCheckCircle />,
                color: '#4CAF50',
                label: 'Devuelto',
                descripcion: 'Préstamo completado exitosamente'
            },
            'en_falta': {
                icon: <FaExclamationCircle />,
                color: '#F44336',
                label: 'Vencido',
                descripcion: 'El libro no fue devuelto a tiempo'
            },
            'rechazado': {
                icon: <FaTimesCircle />,
                color: '#F44336',
                label: 'Rechazada',
                descripcion: 'Tu solicitud no fue aprobada'
            },
            'perdido': {
                icon: <FaTimesCircle />,
                color: '#9E9E9E',
                label: 'Libro Perdido',
                descripcion: 'Libro reportado como perdido'
            },
        };
        return configs[estado] || configs['pendiente'];
    };

    if (loading) {
        return <div style={styles.loading}>Cargando tus reservas...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Mis Reservas</h1>
                <Link to="/publico" style={styles.btnCatalog}>
                    📚 Ir al Catálogo
                </Link>
            </div>

            {/* Filtros */}
            <div style={styles.filters}>
                <button
                    onClick={() => setFiltro('todas')}
                    style={{
                        ...styles.filterBtn,
                        ...(filtro === 'todas' ? styles.filterBtnActive : {})
                    }}
                >
                    Todas ({reservas.length})
                </button>
                <button
                    onClick={() => setFiltro('pendiente')}
                    style={{
                        ...styles.filterBtn,
                        ...(filtro === 'pendiente' ? styles.filterBtnActive : {})
                    }}
                >
                    Pendientes ({reservas.filter(r => r.estado === 'pendiente').length})
                </button>
                <button
                    onClick={() => setFiltro('aprobado')}
                    style={{
                        ...styles.filterBtn,
                        ...(filtro === 'aprobado' ? styles.filterBtnActive : {})
                    }}
                >
                    Aprobadas ({reservas.filter(r => r.estado === 'aprobado').length})
                </button>
                <button
                    onClick={() => setFiltro('en_curso')}
                    style={{
                        ...styles.filterBtn,
                        ...(filtro === 'en_curso' ? styles.filterBtnActive : {})
                    }}
                >
                    En Curso ({reservas.filter(r => r.estado === 'en_curso').length})
                </button>
            </div>

            {/* Lista de reservas */}
            {reservasFiltradas.length === 0 ? (
                <div style={styles.emptyState}>
                    <FaBook style={styles.emptyIcon} />
                    <h3 style={styles.emptyTitle}>
                        {filtro === 'todas' 
                            ? 'No tienes reservas' 
                            : `No tienes reservas ${filtro === 'pendiente' ? 'pendientes' : filtro === 'aprobado' ? 'aprobadas' : 'en curso'}`
                        }
                    </h3>
                    <p style={styles.emptyText}>
                        Explora nuestro catálogo y reserva tus libros favoritos
                    </p>
                    <Link to="/publico" style={styles.btnPrimary}>
                        Ver Catálogo
                    </Link>
                </div>
            ) : (
                <div style={styles.reservasList}>
                    {reservasFiltradas.map((reserva) => {
                        const estadoConfig = getEstadoConfig(reserva.estado);
                        const libro = reserva.libro;
                        
                        return (
                            <div key={reserva.id} style={styles.reservaCard}>
                                {/* Header con estado */}
                                <div style={{
                                    ...styles.cardHeader,
                                    backgroundColor: `${estadoConfig.color}15`,
                                    borderColor: estadoConfig.color
                                }}>
                                    <div style={styles.estadoInfo}>
                                        <span style={{ ...styles.estadoIcon, color: estadoConfig.color }}>
                                            {estadoConfig.icon}
                                        </span>
                                        <div>
                                            <div style={styles.estadoLabel}>{estadoConfig.label}</div>
                                            <div style={styles.estadoDesc}>{estadoConfig.descripcion}</div>
                                        </div>
                                    </div>
                                    <div style={styles.reservaId}>#{reserva.id}</div>
                                </div>

                                {/* Información del libro */}
                                <div style={styles.cardBody}>
                                    <div style={styles.bookInfo}>
                                        <h3 style={styles.bookTitle}>{libro.titulo}</h3>
                                        <div style={styles.bookMeta}>
                                            <span><strong>Autor:</strong> {libro.autor?.nombre}</span>
                                            <span><strong>Categoría:</strong> {libro.categoria?.nombre}</span>
                                        </div>
                                    </div>

                                    {/* Fechas */}
                                    <div style={styles.dateInfo}>
                                        <div style={styles.dateItem}>
                                            <FaCalendar style={styles.dateIcon} />
                                            <div>
                                                <div style={styles.dateLabel}>Solicitado</div>
                                                <div style={styles.dateValue}>
                                                    {new Date(reserva.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {reserva.estado === 'aprobado' && reserva.fecha_aprobacion && (
                                            <div style={styles.dateItem}>
                                                <FaCheckCircle style={styles.dateIcon} />
                                                <div>
                                                    <div style={styles.dateLabel}>Aprobado</div>
                                                    <div style={styles.dateValue}>
                                                        {new Date(reserva.fecha_aprobacion).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(reserva.estado === 'en_curso' || reserva.estado === 'devuelto' || reserva.estado === 'en_falta') && (
                                            <>
                                                <div style={styles.dateItem}>
                                                    <FaCalendar style={styles.dateIcon} />
                                                    <div>
                                                        <div style={styles.dateLabel}>Inicio</div>
                                                        <div style={styles.dateValue}>
                                                            {new Date(reserva.fecha_inicio).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={styles.dateItem}>
                                                    <FaCalendar style={styles.dateIcon} />
                                                    <div>
                                                        <div style={styles.dateLabel}>Debe devolver</div>
                                                        <div style={styles.dateValue}>
                                                            {new Date(reserva.fecha_fin).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Detalles adicionales */}
                                    <div style={styles.details}>
                                        <div style={styles.detailItem}>
                                            <strong>Tipo:</strong> {reserva.tipo_prestamo}
                                        </div>
                                        {reserva.garantia && (
                                            <div style={styles.detailItem}>
                                                <strong>Garantía:</strong> {reserva.garantia}
                                            </div>
                                        )}
                                        {reserva.total_dias && (
                                            <div style={styles.detailItem}>
                                                <strong>Días totales:</strong> {reserva.total_dias}
                                            </div>
                                        )}
                                        {reserva.dias_retraso > 0 && (
                                            <div style={{...styles.detailItem, color: '#F44336', fontWeight: '600'}}>
                                                <strong>Días de retraso:</strong> {reserva.dias_retraso}
                                            </div>
                                        )}
                                    </div>

                                    {/* Motivo de rechazo */}
                                    {reserva.estado === 'rechazado' && reserva.motivo_rechazo && (
                                        <div style={styles.rechazoInfo}>
                                            <strong>Motivo del rechazo:</strong> {reserva.motivo_rechazo}
                                        </div>
                                    )}
                                </div>

                                {/* Footer con acciones */}
                                <div style={styles.cardFooter}>
                                    <Link to={`/publico/libro/${libro.id}`} style={styles.btnVer}>
                                        Ver Libro
                                    </Link>
                                    
                                    {reserva.estado === 'pendiente' && (
                                        <button
                                            onClick={() => handleCancelar(reserva.id, libro.titulo)}
                                            style={styles.btnCancelar}
                                        >
                                            <FaTrash /> Cancelar Reserva
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    },
    loading: {
        textAlign: 'center',
        padding: '100px 20px',
        fontSize: '18px',
        color: '#666',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    title: {
        fontSize: '32px',
        color: '#333',
        margin: 0,
    },
    btnCatalog: {
        padding: '12px 24px',
        backgroundColor: '#2196F3',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '16px',
        transition: 'all 0.3s',
    },
    filters: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    filterBtn: {
        padding: '10px 20px',
        backgroundColor: '#fff',
        color: '#666',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    filterBtnActive: {
        backgroundColor: '#2196F3',
        color: '#fff',
        borderColor: '#2196F3',
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    emptyIcon: {
        fontSize: '64px',
        color: '#ccc',
        marginBottom: '20px',
    },
    emptyTitle: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '10px',
    },
    emptyText: {
        fontSize: '16px',
        color: '#666',
        marginBottom: '30px',
    },
    btnPrimary: {
        display: 'inline-block',
        padding: '12px 32px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
    },
    reservasList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    reservaCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    cardHeader: {
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeft: '4px solid',
    },
    estadoInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    estadoIcon: {
        fontSize: '24px',
    },
    estadoLabel: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
    },
    estadoDesc: {
        fontSize: '13px',
        color: '#666',
        marginTop: '3px',
    },
    reservaId: {
        fontSize: '14px',
        color: '#999',
        fontWeight: '600',
    },
    cardBody: {
        padding: '25px',
    },
    bookInfo: {
        marginBottom: '20px',
    },
    bookTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '10px',
    },
    bookMeta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        fontSize: '14px',
        color: '#666',
    },
    dateInfo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
    },
    dateItem: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    dateIcon: {
        fontSize: '18px',
        color: '#2196F3',
    },
    dateLabel: {
        fontSize: '12px',
        color: '#999',
    },
    dateValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
    },
    details: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '15px',
    },
    detailItem: {
        fontSize: '14px',
        color: '#666',
    },
    rechazoInfo: {
        padding: '15px',
        backgroundColor: '#FFEBEE',
        border: '1px solid #F44336',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#C62828',
        marginTop: '15px',
    },
    cardFooter: {
        padding: '20px 25px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
    },
    btnVer: {
        padding: '10px 20px',
        backgroundColor: '#2196F3',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s',
    },
    btnCancelar: {
        padding: '10px 20px',
        backgroundColor: '#F44336',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s',
    },
};

export default MisReservas;