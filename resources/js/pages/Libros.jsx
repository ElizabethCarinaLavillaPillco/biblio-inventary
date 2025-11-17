// resources/js/pages/Libros.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- IMPORTA useNavigate
import axios from 'axios';
import Swal from 'sweetalert2';

const Libros = () => {
    const navigate = useNavigate(); // <-- USA useNavigate
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [pagination, setPagination] = useState({});
    // NUEVO ESTADO para saber si hay un filtro activo desde la URL
    const [hasActiveFilter, setHasActiveFilter] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const categoriaId = params.get('categoria_id');
        const autorId = params.get('autor_id');
        const ubicacionId = params.get('ubicacion_id');

        // NUEVO: Comprueba si hay algún filtro en la URL
        if (categoriaId || autorId || ubicacionId) {
            setHasActiveFilter(true);
        } else {
            setHasActiveFilter(false);
        }

        if (categoriaId) {
            fetchLibros(1, { categoria_id: categoriaId });
        } else if (autorId) {
            fetchLibros(1, { autor_id: autorId });
        } else if (ubicacionId) {
            fetchLibros(1, { ubicacion_id: ubicacionId });
        } else {
            fetchLibros();
        }
    }, [window.location.search]); // Se vuelve a ejecutar si la URL cambia

    const fetchLibros = async (page = 1, additionalFilters = {}) => {
        try {
            setLoading(true);
            const params = {
                search: search,
                estado_actual: filtroEstado,
                page: page,
                ...additionalFilters
            };
            
            const response = await axios.get('/libros', { params });
            
            setLibros(response.data.data || []);
            setPagination(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar libros:', error);
            Swal.fire('Error', 'No se pudieron cargar los libros', 'error');
            setLoading(false);
        }
    };

    // NUEVA FUNCIÓN para limpiar todos los filtros
    const clearFilters = () => {
        setSearch('');
        setFiltroEstado('');
        setHasActiveFilter(false);
        navigate('/libros'); // Navega a la URL limpia sin parámetros
    };

    const eliminarLibro = async (id, titulo) => {
        const result = await Swal.fire({
            title: '¿Eliminar libro?',
            text: `¿Estás segura de eliminar "${titulo}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            cancelButtonColor: '#9E9E9E',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/libros/${id}`);
                Swal.fire('¡Eliminado!', 'El libro ha sido eliminado.', 'success');
                fetchLibros();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar el libro', 'error');
            }
        }
    };

    const getEstadoBadge = (estado) => {
        const config = {
            'en biblioteca': { bg: '#4CAF50', text: 'Disponible' },
            'prestado': { bg: '#FF9800', text: 'Prestado' },
            'perdido': { bg: '#F44336', text: 'Perdido' },
            'biblioteca comunitaria': { bg: '#9E9E9E', text: 'Bib. Comunitaria' }
        };
        const { bg, text } = config[estado] || { bg: '#2196F3', text: estado };
        return { backgroundColor: bg, label: text };
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📚 Gestión de Libros</h1>
                <div style={styles.actions}>
                    {/* NUEVO BOTÓN: Solo se muestra si hay un filtro activo */}
                    {hasActiveFilter && (
                        <button onClick={clearFilters} style={{...styles.btn, ...styles.btnClear}}>
                            🔄 Ver Todos
                        </button>
                    )}
                    <Link to="/libros/carga-masiva" style={{...styles.btn, ...styles.btnSecondary}}>
                        📤 Carga Masiva
                    </Link>
                    <Link to="/libros/registrar" style={{...styles.btn, ...styles.btnPrimary}}>
                        ➕ Registrar Libro
                    </Link>
                </div>
            </div>

            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por título o autor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    style={styles.select}
                >
                    <option value="">Todos los estados</option>
                    <option value="en biblioteca">En Biblioteca</option>
                    <option value="prestado">Prestado</option>
                    <option value="perdido">Perdido</option>
                    <option value="biblioteca comunitaria">Biblioteca Comunitaria</option>
                </select>
            </div>

            {loading ? (
                <div style={styles.loading}>Cargando libros...</div>
            ) : libros.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📚</div>
                    <p>No se encontraron libros</p>
                    <Link to="/libros/registrar" style={{...styles.btn, ...styles.btnPrimary, marginTop: '20px'}}>
                        ➕ Registrar Primer Libro
                    </Link>
                </div>
            ) : (
                <>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Título</th>
                                    <th style={styles.th}>Autor</th>
                                    <th style={styles.th}>Categoría</th>
                                    <th style={styles.th}>Ubicación</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {libros.map((libro) => {
                                    const badge = getEstadoBadge(libro.estado_actual);
                                    return (
                                        <tr key={libro.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.bookTitle}>{libro.titulo}</div>
                                                <div style={styles.bookPrice}>S/. {libro.precio || '0.00'}</div>
                                            </td>
                                            <td style={styles.td}>{libro.autor?.nombre || 'Sin autor'}</td>
                                            <td style={styles.td}>{libro.categoria?.nombre || 'Sin categoría'}</td>
                                            <td style={styles.td}>
                                                {libro.ubicacion?.codigo || 'Sin ubicación'}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: badge.backgroundColor
                                                }}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionButtons}>
                                                    <Link
                                                        to={`/libros/ver/${libro.id}`}
                                                        style={{...styles.actionBtn, backgroundColor: '#2196F3'}}
                                                        title="Ver detalles"
                                                    >
                                                        👁️
                                                    </Link>
                                                    <Link
                                                        to={`/libros/editar/${libro.id}`}
                                                        style={{...styles.actionBtn, backgroundColor: '#FF9800'}}
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    {libro.estado_actual === 'en biblioteca' && (
                                                        <Link
                                                            to={`/prestamos/registrar/${libro.id}`}
                                                            style={{...styles.actionBtn, backgroundColor: '#4CAF50'}}
                                                            title="Prestar"
                                                        >
                                                            📤
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => eliminarLibro(libro.id, libro.titulo)}
                                                        style={{...styles.actionBtn, backgroundColor: '#F44336'}}
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div style={styles.pagination}>
                            <button
                                onClick={() => fetchLibros(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                style={styles.pageBtn}
                            >
                                ← Anterior
                            </button>
                            <span style={styles.pageInfo}>
                                Página {pagination.current_page} de {pagination.last_page}
                            </span>
                            <button
                                onClick={() => fetchLibros(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                style={styles.pageBtn}
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ... (tus estilos existentes)
const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
    title: { fontSize: '32px', margin: 0, color: '#333' },
    actions: { display: 'flex', gap: '10px' },
    btn: { padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer', transition: 'all 0.3s', display: 'inline-block' },
    btnPrimary: { backgroundColor: '#4CAF50', color: '#fff' },
    btnSecondary: { backgroundColor: '#2196F3', color: '#fff' },
    btnClear: { backgroundColor: '#9E9E9E', color: '#fff' }, // <-- NUEVO ESTILO
    filters: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
    searchInput: { flex: 1, minWidth: '300px', padding: '12px 20px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none' },
    select: { padding: '12px 20px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', cursor: 'pointer' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    emptyState: { textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    emptyIcon: { fontSize: '64px', marginBottom: '20px' },
    tableContainer: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f5f5f5', padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333', borderBottom: '2px solid #e0e0e0' },
    tr: { borderBottom: '1px solid #e0e0e0', transition: 'background-color 0.2s' },
    td: { padding: '15px' },
    bookTitle: { fontWeight: '600', color: '#333', marginBottom: '4px' },
    bookPrice: { fontSize: '14px', color: '#4CAF50', fontWeight: '600' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff', display: 'inline-block' },
    actionButtons: { display: 'flex', gap: '8px' },
    actionBtn: { padding: '8px 12px', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', display: 'inline-block' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px', padding: '20px' },
    pageBtn: { padding: '10px 20px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    pageInfo: { fontSize: '16px', color: '#666' },
};

export default Libros;