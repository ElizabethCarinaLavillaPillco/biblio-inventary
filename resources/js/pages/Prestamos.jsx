import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    FiCalendar,
    FiClock,
    FiUser,
    FiBook,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiPlus
} from 'react-icons/fi';

const Prestamos = () => {
    const [prestamos, setPrestamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('activo');
    const [showModal, setShowModal] = useState(false);
    const [librosDisponibles, setLibrosDisponibles] = useState([]);
    const [stats, setStats] = useState({
        activos: 0,
        vencidos: 0,
        devueltos_hoy: 0
    });

    const [formData, setFormData] = useState({
        libro_id: '',
        nombres: '',
        apellidos: '',
        dni: '',
        fecha_nacimiento: '',
        telefono: '',
        domicilio: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        garantia: '',
        tipo_prestamo: 'a domicilio',
        acepta_proteccion_datos: false
    });

    useEffect(() => {
        fetchPrestamos();
        fetchStats();
    }, [filtro]);

    const fetchPrestamos = async () => {
        try {
            setLoading(true);
            const params = filtro === 'todos' ? { todos: true } : { estado: filtro };
            const response = await axios.get('/prestamos', { params });
            setPrestamos(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar préstamos:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/prestamos/estadisticas');
            setStats(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const fetchLibrosDisponibles = async () => {
        try {
            const response = await axios.get('/prestamos/libros-disponibles');
            setLibrosDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar libros:', error);
        }
    };

    const handleOpenModal = () => {
        fetchLibrosDisponibles();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            libro_id: '',
            nombres: '',
            apellidos: '',
            dni: '',
            fecha_nacimiento: '',
            telefono: '',
            domicilio: '',
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            garantia: '',
            tipo_prestamo: 'a domicilio',
            acepta_proteccion_datos: false
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.acepta_proteccion_datos) {
            Swal.fire('Error', 'Debe aceptar la política de protección de datos', 'error');
            return;
        }

        try {
            await axios.post('/prestamos', formData);
            Swal.fire({
                icon: 'success',
                title: 'Préstamo Registrado',
                text: 'El préstamo se ha registrado exitosamente',
                timer: 2000,
                showConfirmButton: false
            });
            handleCloseModal();
            fetchPrestamos();
            fetchStats();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar el préstamo', 'error');
        }
    };

    const marcarDevuelto = async (id, titulo) => {
        const result = await Swal.fire({
            title: '¿Marcar como devuelto?',
            html: `<strong>${titulo}</strong>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            confirmButtonText: 'Sí, devuelto',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`/prestamos/${id}/devuelto`);
                Swal.fire({
                    icon: 'success',
                    title: '¡Devuelto!',
                    text: 'Libro marcado como devuelto',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchPrestamos();
                fetchStats();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message, 'error');
            }
        }
    };

    const marcarPerdido = async (id, titulo) => {
        const result = await Swal.fire({
            title: '¿Marcar como perdido?',
            html: `<strong>${titulo}</strong><br><br>Esta acción registrará el libro como perdido.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Sí, perdido',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`/prestamos/${id}/perdido`);
                Swal.fire({
                    icon: 'info',
                    title: 'Marcado como perdido',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchPrestamos();
                fetchStats();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message, 'error');
            }
        }
    };

    const calcularDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diferencia = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return diferencia;
    };

    const getColorEstado = (dias) => {
        if (dias < 0) return '#F44336';
        if (dias <= 3) return '#FF9800';
        return '#4CAF50';
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Gestión de Préstamos</h1>
                <button onClick={handleOpenModal} style={styles.btnNew}>
                    <FiPlus style={{ marginRight: '8px' }} />
                    Nuevo Préstamo
                </button>
            </div>

            {/* Estadísticas */}
            <div style={styles.statsGrid}>
                <div style={{...styles.statCard, borderLeftColor: '#FF9800'}}>
                    <FiBook style={styles.statIcon} />
                    <div>
                        <div style={styles.statValue}>{stats.activos}</div>
                        <div style={styles.statLabel}>Préstamos Activos</div>
                    </div>
                </div>
                <div style={{...styles.statCard, borderLeftColor: '#F44336'}}>
                    <FiAlertCircle style={styles.statIcon} />
                    <div>
                        <div style={styles.statValue}>{stats.vencidos}</div>
                        <div style={styles.statLabel}>Vencidos</div>
                    </div>
                </div>
                <div style={{...styles.statCard, borderLeftColor: '#4CAF50'}}>
                    <FiCheckCircle style={styles.statIcon} />
                    <div>
                        <div style={styles.statValue}>{stats.devueltos_hoy}</div>
                        <div style={styles.statLabel}>Devueltos Hoy</div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filters}>
                <button
                    onClick={() => setFiltro('activo')}
                    style={{
                        ...styles.filterBtn,
                        backgroundColor: filtro === 'activo' ? '#FF9800' : '#e0e0e0',
                        color: filtro === 'activo' ? '#fff' : '#666'
                    }}
                >
                    Activos
                </button>
                <button
                    onClick={() => setFiltro('devuelto')}
                    style={{
                        ...styles.filterBtn,
                        backgroundColor: filtro === 'devuelto' ? '#4CAF50' : '#e0e0e0',
                        color: filtro === 'devuelto' ? '#fff' : '#666'
                    }}
                >
                    Devueltos
                </button>
                <button
                    onClick={() => setFiltro('perdido')}
                    style={{
                        ...styles.filterBtn,
                        backgroundColor: filtro === 'perdido' ? '#F44336' : '#e0e0e0',
                        color: filtro === 'perdido' ? '#fff' : '#666'
                    }}
                >
                    Perdidos
                </button>
                <button
                    onClick={() => setFiltro('todos')}
                    style={{
                        ...styles.filterBtn,
                        backgroundColor: filtro === 'todos' ? '#2196F3' : '#e0e0e0',
                        color: filtro === 'todos' ? '#fff' : '#666'
                    }}
                >
                    Todos
                </button>
            </div>

            {loading ? (
                <div style={styles.loading}>Cargando préstamos...</div>
            ) : prestamos.length === 0 ? (
                <div style={styles.emptyState}>
                    <FiBook style={styles.emptyIcon} />
                    <p>No hay préstamos {filtro !== 'todos' ? filtro + 's' : ''}</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {prestamos.map((p) => {
                        const diasRestantes = calcularDiasRestantes(p.fecha_fin);
                        const isVencido = diasRestantes < 0;
                        const colorEstado = getColorEstado(diasRestantes);

                        return (
                            <div key={p.id} style={{
                                ...styles.card,
                                borderLeftColor: colorEstado,
                                borderLeftWidth: '5px',
                                borderLeftStyle: 'solid'
                            }}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.bookInfo}>
                                        <div style={styles.bookTitle}>{p.libro?.titulo}</div>
                                        <div style={styles.bookAuthor}>{p.libro?.autor?.nombre}</div>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: p.tipo_prestamo === 'a domicilio' ? '#2196F3' : '#9C27B0'
                                        }}>
                                            {p.tipo_prestamo === 'a domicilio' ? 'A Domicilio' : 'En Biblioteca'}
                                        </span>
                                    </div>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: colorEstado
                                    }}>
                                        {isVencido ? `Vencido (${Math.abs(diasRestantes)}d)` :
                                         diasRestantes <= 3 ? `${diasRestantes}d restantes` :
                                         `${diasRestantes}d restantes`}
                                    </span>
                                </div>

                                <div style={styles.userInfo}>
                                    <div style={styles.userItem}>
                                        <span style={styles.userLabel}>
                                            <FiUser style={{ marginRight: '5px' }} />
                                            Solicitante:
                                        </span>
                                        <span style={styles.userValue}>{p.nombres} {p.apellidos}</span>
                                    </div>
                                    <div style={styles.userItem}>
                                        <span style={styles.userLabel}>DNI:</span>
                                        <span style={styles.userValue}>{p.dni}</span>
                                    </div>
                                    <div style={styles.userItem}>
                                        <span style={styles.userLabel}>Teléfono:</span>
                                        <span style={styles.userValue}>{p.telefono}</span>
                                    </div>
                                </div>

                                <div style={styles.dates}>
                                    <div style={styles.dateItem}>
                                        <FiCalendar style={{ marginRight: '5px', color: '#666' }} />
                                        <span style={styles.dateLabel}>Inicio:</span>
                                        <span style={styles.dateValue}>
                                            {new Date(p.fecha_inicio).toLocaleDateString('es-PE')}
                                        </span>
                                    </div>
                                    <div style={styles.dateItem}>
                                        <FiClock style={{ marginRight: '5px', color: isVencido ? '#F44336' : '#4CAF50' }} />
                                        <span style={styles.dateLabel}>Vencimiento:</span>
                                        <span style={{...styles.dateValue, color: isVencido ? '#F44336' : '#4CAF50'}}>
                                            {new Date(p.fecha_fin).toLocaleDateString('es-PE')}
                                        </span>
                                    </div>
                                </div>

                                {p.estado === 'activo' && (
                                    <div style={styles.actions}>
                                        <button
                                            onClick={() => marcarDevuelto(p.id, p.libro?.titulo)}
                                            style={styles.btnDevuelto}
                                        >
                                            <FiCheckCircle style={{ marginRight: '5px' }} />
                                            Devuelto
                                        </button>
                                        <button
                                            onClick={() => marcarPerdido(p.id, p.libro?.titulo)}
                                            style={styles.btnPerdido}
                                        >
                                            <FiXCircle style={{ marginRight: '5px' }} />
                                            Perdido
                                        </button>
                                    </div>
                                )}

                                {p.estado === 'devuelto' && (
                                    <div style={styles.estadoFinal}>
                                        <FiCheckCircle style={{ marginRight: '8px' }} />
                                        Devuelto el {new Date(p.fecha_devolucion).toLocaleDateString('es-PE')}
                                    </div>
                                )}

                                {p.estado === 'perdido' && (
                                    <div style={{...styles.estadoFinal, backgroundColor: '#ffebee', color: '#c62828'}}>
                                        <FiXCircle style={{ marginRight: '8px' }} />
                                        Marcado como perdido
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL NUEVO PRÉSTAMO */}
            {showModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Nuevo Préstamo</h2>
                            <button onClick={handleCloseModal} style={styles.closeBtn}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={styles.formSection}>
                                <h3 style={styles.sectionTitle}>
                                    <FiBook style={{ marginRight: '8px' }} />
                                    Seleccionar Libro
                                </h3>
                                <select
                                    value={formData.libro_id}
                                    onChange={(e) => setFormData({...formData, libro_id: e.target.value})}
                                    style={styles.select}
                                    required
                                >
                                    <option value="">Seleccionar libro disponible</option>
                                    {librosDisponibles.map(libro => (
                                        <option key={libro.id} value={libro.id}>
                                            {libro.titulo} - {libro.autor?.nombre} ({libro.ubicacion?.codigo || 'Sin ubicación'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formSection}>
                                <h3 style={styles.sectionTitle}>
                                    <FiUser style={{ marginRight: '8px' }} />
                                    Datos del Solicitante
                                </h3>
                                <div style={styles.formGrid}>
                                    <input
                                        type="text"
                                        placeholder="Nombres *"
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                                        style={styles.input}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Apellidos *"
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                                        style={styles.input}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="DNI (8 dígitos) *"
                                        value={formData.dni}
                                        onChange={(e) => setFormData({...formData, dni: e.target.value})}
                                        maxLength="8"
                                        style={styles.input}
                                        required
                                    />
                                    <input
                                        type="date"
                                        placeholder="Fecha de Nacimiento *"
                                        value={formData.fecha_nacimiento}
                                        onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                                        style={styles.input}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Teléfono *"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                        style={styles.input}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Domicilio *"
                                        value={formData.domicilio}
                                        onChange={(e) => setFormData({...formData, domicilio: e.target.value})}
                                        style={{...styles.input, gridColumn: 'span 2'}}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.formSection}>
                                <h3 style={styles.sectionTitle}>
                                    <FiCalendar style={{ marginRight: '8px' }} />
                                    Detalles del Préstamo
                                </h3>
                                <div style={styles.formGrid}>
                                    <div>
                                        <label style={styles.label}>Fecha Inicio *</label>
                                        <input
                                            type="date"
                                            value={formData.fecha_inicio}
                                            onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.label}>Fecha Fin *</label>
                                        <input
                                            type="date"
                                            value={formData.fecha_fin}
                                            onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.label}>Tipo de Préstamo *</label>
                                        <select
                                            value={formData.tipo_prestamo}
                                            onChange={(e) => setFormData({...formData, tipo_prestamo: e.target.value})}
                                            style={styles.select}
                                            required
                                        >
                                            <option value="a domicilio">A Domicilio</option>
                                            <option value="en biblioteca">En Biblioteca</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={styles.label}>Garantía *</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: DNI, Carnet, Depósito"
                                            value={formData.garantia}
                                            onChange={(e) => setFormData({...formData, garantia: e.target.value})}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={styles.privacySection}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.acepta_proteccion_datos}
                                        onChange={(e) => setFormData({...formData, acepta_proteccion_datos: e.target.checked})}
                                        style={styles.checkbox}
                                        required
                                    />
                                    <span>
                                        Acepto la <a href="/politica-privacidad" target="_blank" style={styles.link}>Política de Protección de Datos Personales</a> según Ley N° 29733
                                    </span>
                                </label>
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={handleCloseModal} style={styles.btnCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" style={styles.btnSubmit}>
                                    <FiCheckCircle style={{ marginRight: '8px' }} />
                                    Registrar Préstamo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', margin: 0, color: '#333', fontWeight: '600' },
    btnNew: { padding: '12px 24px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(76,175,80,0.3)', transition: 'all 0.3s' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '5px solid' },
    statIcon: { fontSize: '40px', color: '#666' },
    statValue: { fontSize: '32px', fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: '14px', color: '#666', marginTop: '5px' },
    filters: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    filterBtn: { padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', fontSize: '14px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    emptyState: { textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    emptyIcon: { fontSize: '64px', color: '#ccc', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0' },
    bookInfo: { flex: 1 },
    bookTitle: { fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '5px' },
    bookAuthor: { fontSize: '14px', color: '#666', marginBottom: '10px' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff', display: 'inline-block' },
    statusBadge: { padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: '#fff' },
    userInfo: { marginBottom: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' },
    userItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' },
    userLabel: { fontSize: '13px', color: '#666', fontWeight: '500', display: 'flex', alignItems: 'center' },
    userValue: { fontSize: '14px', color: '#333', fontWeight: '600' },
    dates: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' },
    dateItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' },
    dateLabel: { fontSize: '12px', color: '#666' },
    dateValue: { fontSize: '14px', fontWeight: '600', color: '#333' },
    actions: { display: 'flex', gap: '10px' },
    btnDevuelto: { flex: 1, padding: '12px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' },
    btnPerdido: { flex: 1, padding: '12px', backgroundColor: '#F44336', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' },
    estadoFinal: { padding: '12px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', textAlign: 'center', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    // Estilos del Modal
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { backgroundColor: '#fff', borderRadius: '16px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', borderBottom: '2px solid #e0e0e0', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 },
    modalTitle: { fontSize: '24px', fontWeight: '600', color: '#333', margin: 0 },
    closeBtn: { fontSize: '32px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '0 10px', lineHeight: '1' },
    formSection: { padding: '25px', borderBottom: '1px solid #f0f0f0' },
    sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px' },
    input: { width: '100%', padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none' },
    select: { width: '100%', padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
    privacySection: { padding: '20px 25px', backgroundColor: '#f0f7ff', borderBottom: '1px solid #e0e0e0' },
    checkboxLabel: { display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#333', cursor: 'pointer' },
    checkbox: { marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer' },
    link: { color: '#2196F3', textDecoration: 'underline', fontWeight: '600' },
    modalActions: { padding: '25px', display: 'flex', gap: '15px', justifyContent: 'flex-end', position: 'sticky', bottom: 0, backgroundColor: '#fff', borderTop: '2px solid #e0e0e0' },
    btnCancel: { padding: '12px 24px', backgroundColor: '#9E9E9E', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
    btnSubmit: { padding: '12px 24px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center' },
};

export default Prestamos;
