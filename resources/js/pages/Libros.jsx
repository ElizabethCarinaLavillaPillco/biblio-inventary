import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const Libros = () => {
    const navigate = useNavigate();
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        estado_actual: '',
        categoria_id: '',
        autor_id: '',
        ubicacion_id: '',
        tipo_item: '',
        coleccion_id: ''
    });
    const [pagination, setPagination] = useState({});
    const [hasActiveFilter, setHasActiveFilter] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [autores, setAutores] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [colecciones, setColecciones] = useState([]);

    // ===== NUEVO: Modal para ver todas las copias =====
    const [showCopiasModal, setShowCopiasModal] = useState(false);
    const [copiasData, setCopiasData] = useState(null);
    const [loadingCopias, setLoadingCopias] = useState(false);

    // Cargar datos de filtros
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [categoriasRes, autoresRes, ubicacionesRes, coleccionesRes] = await Promise.all([
                    axios.get('/categorias/all'),
                    axios.get('/autores'),
                    axios.get('/ubicaciones/activas'),
                    axios.get('/colecciones/all')
                ]);

                // Corregido: Manejar diferentes formatos de respuesta
                setCategorias(Array.isArray(categoriasRes.data) ? categoriasRes.data : categoriasRes.data?.data || []);
                setAutores(Array.isArray(autoresRes.data) ? autoresRes.data : autoresRes.data?.data || []);
                setUbicaciones(Array.isArray(ubicacionesRes.data) ? ubicacionesRes.data : ubicacionesRes.data?.data || []);
                setColecciones(Array.isArray(coleccionesRes.data) ? coleccionesRes.data : coleccionesRes.data?.data || []);
            } catch (error) {
                console.error('Error al cargar filtros:', error);
            }
        };
        loadFilters();
    }, []);

    // Cargar libros con filtros
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const estado = params.get('estado_actual') || '';
        const categoria = params.get('categoria_id') || '';
        const autor = params.get('autor_id') || '';
        const ubicacion = params.get('ubicacion_id') || '';
        const tipo = params.get('tipo_item') || '';
        const cdd = params.get('clasificacion_cdd') || '';
        const coleccion = params.get('coleccion_id') || '';

        const newFilters = {
            estado_actual: estado,
            categoria_id: categoria,
            autor_id: autor,
            ubicacion_id: ubicacion,
            tipo_item: tipo,
            clasificacion_cdd: cdd,
            coleccion_id: coleccion
        };

        setFilters(newFilters);
        setHasActiveFilter(estado || categoria || autor || ubicacion || tipo || cdd || coleccion);

        fetchLibros(1, newFilters);
    }, [window.location.search]);

    const fetchLibros = async (page = 1, additionalFilters = {}) => {
        try {
            setLoading(true);
            const params = {
                search: search,
                page: page,
                ...filters,
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

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...filters, [filterName]: value };
        setFilters(newFilters);

        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, val]) => {
            if (val) params.append(key, val);
        });

        navigate(`/libros?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearch('');
        setFilters({
            estado_actual: '',
            categoria_id: '',
            autor_id: '',
            ubicacion_id: '',
            tipo_item: '',
            clasificacion_cdd: '',
            coleccion_id: ''
        });
        navigate('/libros');
    };

    const verTodasLasCopias = async (titulo, autorId) => {
        setLoadingCopias(true);
        setShowCopiasModal(true);

        try {
            const response = await axios.get('/libros/ver-copias', {
                params: { titulo, autor_id: autorId }
            });
            setCopiasData(response.data);
        } catch (error) {
            console.error('Error al cargar copias:', error);
            Swal.fire('Error', 'No se pudieron cargar las copias', 'error');
            setShowCopiasModal(false);
        } finally {
            setLoadingCopias(false);
        }
    };

    const eliminarCopia = async (id, titulo, codigo) => {
        const result = await Swal.fire({
            title: '¿Eliminar esta copia?',
            html: `
                <strong>${titulo}</strong><br>
                Código: ${codigo}<br><br>
                Esto eliminará solo esta copia física específica.
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            cancelButtonColor: '#9E9E9E',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`/libros/${id}`);
                Swal.fire('¡Eliminado!', response.data.message, 'success');
                fetchLibros();
                if (showCopiasModal) {
                    setShowCopiasModal(false);
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar', 'error');
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

    const StockBadge = ({ stockTotal, stockDisponible, stockPrestado }) => {
        return (
            <div style={styles.stockContainer}>
                <div style={styles.stockTotal}>
                    📚 {stockTotal} {stockTotal === 1 ? 'copia' : 'copias'}
                </div>
                <div style={styles.stockDetails}>
                    <span style={{...styles.stockBadge, backgroundColor: '#4CAF50'}}>
                        ✓ {stockDisponible}
                    </span>
                    {stockPrestado > 0 && (
                        <span style={{...styles.stockBadge, backgroundColor: '#FF9800'}}>
                            📤 {stockPrestado}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📚 Gestión de Libros</h1>
                <div style={styles.actions}>
                    {hasActiveFilter && (
                        <button onClick={clearFilters} style={{...styles.btn, ...styles.btnClear}}>
                            🔄 Limpiar Filtros
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
                <div style={styles.filterRow}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por título, autor, ISBN..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            // Aplicar búsqueda inmediata
                            const params = new URLSearchParams();
                            if (e.target.value) params.append('search', e.target.value);
                            navigate(`/libros?${params.toString()}`);
                        }}
                        style={styles.searchInput}
                    />

                    <select
                        value={filters.estado_actual}
                        onChange={(e) => handleFilterChange('estado_actual', e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Todos los estados</option>
                        <option value="en biblioteca">En Biblioteca</option>
                        <option value="prestado">Prestado</option>
                        <option value="perdido">Perdido</option>
                        <option value="biblioteca comunitaria">Biblioteca Comunitaria</option>
                    </select>

                    <select
                        value={filters.categoria_id}
                        onChange={(e) => handleFilterChange('categoria_id', e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>

                    <select
                        value={filters.autor_id}
                        onChange={(e) => handleFilterChange('autor_id', e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Todos los autores</option>
                        {autores.map(autor => (
                            <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                        ))}
                    </select>

                    <select
                        value={filters.ubicacion_id}
                        onChange={(e) => handleFilterChange('ubicacion_id', e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Todas las ubicaciones</option>
                        {ubicaciones.map(ub => (
                            <option key={ub.id} value={ub.id}>{ub.codigo}</option>
                        ))}
                    </select>

                    <select
                        value={filters.tipo_item}
                        onChange={(e) => handleFilterChange('tipo_item', e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Todos los tipos</option>
                        <option value="libro">Libro</option>
                        <option value="folleto">Folleto</option>
                        <option value="traduccion">Traducción</option>
                        <option value="revista">Revista</option>
                        <option value="tesis">Tesis</option>
                        <option value="manual">Manual</option>
                        <option value="diccionario">Diccionario</option>
                        <option value="otro">Otro</option>
                    </select>

                    <select
                        value={filters.clasificacion_cdd}
                        onChange={(e) => handleFilterChange('clasificacion_cdd', e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Todas las clasificaciones</option>
                        <option value="000">000 - Informática, conocimiento y sistemas</option>
                        <option value="100">100 - Filosofía y psicología</option>
                        <option value="200">200 - Religión</option>
                        <option value="300">300 - Ciencias sociales</option>
                        <option value="400">400 - Lenguas</option>
                        <option value="500">500 - Ciencias naturales y matemáticas</option>
                        <option value="600">600 - Tecnología y ciencias aplicadas</option>
                        <option value="700">700 - Artes y recreación</option>
                        <option value="800">800 - Literatura</option>
                        <option value="900">900 - Historia y geografía</option>
                    </select>

                    <select
                        value={filters.coleccion_id}
                        onChange={(e) => handleFilterChange('coleccion_id', e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Todas las colecciones</option>
                        {colecciones.map(col => (
                            <option key={col.id} value={col.id}>{col.nombre}</option>
                        ))}
                    </select>
                </div>
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
                                    <th style={styles.th}>Stock</th>
                                    <th style={styles.th}>Disponibilidad</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {libros.map((libro) => {
                                    const hayDisponibles = libro.stock_disponible > 0;

                                    return (
                                        <tr key={libro.id_representativo} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.bookTitle}>{libro.titulo}</div>
                                                <div style={styles.bookPrice}>
                                                    S/. {parseFloat(libro.precio_promedio || 0).toFixed(2)}
                                                </div>
                                            </td>
                                            <td style={styles.td}>{libro.autor?.nombre || 'Sin autor'}</td>
                                            <td style={styles.td}>{libro.categoria?.nombre || 'Sin categoría'}</td>
                                            <td style={styles.td}>{libro.ubicacion?.codigo || '-'}</td>
                                            <td style={styles.td}>
                                                <StockBadge
                                                    stockTotal={libro.stock_total}
                                                    stockDisponible={libro.stock_disponible}
                                                    stockPrestado={libro.stock_prestado}
                                                />
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: hayDisponibles ? '#4CAF50' : '#F44336'
                                                }}>
                                                    {hayDisponibles ? '✓ Disponible' : '✗ No disponible'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionButtons}>
                                                    <button
                                                        onClick={() => verTodasLasCopias(libro.titulo, libro.autor_id)}
                                                        style={{...styles.actionBtn, backgroundColor: '#2196F3'}}
                                                        title="Ver todas las copias"
                                                    >
                                                        👁️ {libro.stock_total}
                                                    </button>
                                                    <Link
                                                        to={`/libros/editar/${libro.id_representativo}`}
                                                        style={{...styles.actionBtn, backgroundColor: '#FF9800'}}
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    {hayDisponibles && (
                                                        <Link
                                                            to={`/prestamos/registrar/${libro.id_representativo}`}
                                                            style={{...styles.actionBtn, backgroundColor: '#4CAF50'}}
                                                            title="Prestar"
                                                        >
                                                            📤
                                                        </Link>
                                                    )}
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

            {/* ===== MODAL DE COPIAS ===== */}
            {showCopiasModal && (
                <div style={styles.modal} onClick={() => setShowCopiasModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2>📚 Todas las Copias</h2>
                            <button
                                onClick={() => setShowCopiasModal(false)}
                                style={styles.closeBtn}
                            >
                                ✕
                            </button>
                        </div>

                        {loadingCopias ? (
                            <div style={{padding: '40px', textAlign: 'center'}}>
                                Cargando copias...
                            </div>
                        ) : copiasData ? (
                            <>
                                <div style={styles.modalSummary}>
                                    <div style={styles.summaryItem}>
                                        <div style={styles.summaryValue}>{copiasData.total_copias}</div>
                                        <div style={styles.summaryLabel}>Total copias</div>
                                    </div>
                                    <div style={styles.summaryItem}>
                                        <div style={{...styles.summaryValue, color: '#4CAF50'}}>
                                            {copiasData.disponibles}
                                        </div>
                                        <div style={styles.summaryLabel}>Disponibles</div>
                                    </div>
                                    <div style={styles.summaryItem}>
                                        <div style={{...styles.summaryValue, color: '#FF9800'}}>
                                            {copiasData.prestadas}
                                        </div>
                                        <div style={styles.summaryLabel}>Prestadas</div>
                                    </div>
                                    {copiasData.perdidas > 0 && (
                                        <div style={styles.summaryItem}>
                                            <div style={{...styles.summaryValue, color: '#F44336'}}>
                                                {copiasData.perdidas}
                                            </div>
                                            <div style={styles.summaryLabel}>Perdidas</div>
                                        </div>
                                    )}
                                </div>

                                <div style={styles.copiasGrid}>
                                    {copiasData.copias.map((copia) => {
                                        const badge = getEstadoBadge(copia.estado_actual);
                                        return (
                                            <div
                                                key={copia.id}
                                                style={{
                                                    ...styles.copiaCard,
                                                    borderColor: badge.backgroundColor
                                                }}
                                            >
                                                <div style={styles.copiaHeader}>
                                                    <span style={styles.copiaCodigo}>
                                                        🏷️ {copia.codigo_inventario}
                                                    </span>
                                                    <span style={{
                                                        ...styles.badge,
                                                        backgroundColor: badge.backgroundColor,
                                                        fontSize: '12px',
                                                        padding: '4px 8px'
                                                    }}>
                                                        {badge.label}
                                                    </span>
                                                </div>

                                                <div style={styles.copiaDetails}>
                                                    {copia.ubicacion && (
                                                        <div style={styles.copiaDetail}>
                                                            <strong>📍 Ubicación:</strong> {copia.ubicacion.codigo}
                                                        </div>
                                                    )}
                                                    {copia.color_forro && (
                                                        <div style={styles.copiaDetail}>
                                                            <strong>🎨 Forro:</strong> {copia.color_forro}
                                                        </div>
                                                    )}
                                                    {copia.isbn && (
                                                        <div style={styles.copiaDetail}>
                                                            <strong>📖 ISBN:</strong> {copia.isbn}
                                                        </div>
                                                    )}

                                                    {copia.prestamo_activo && (
                                                        <div style={styles.prestamoInfo}>
                                                            <strong>👤 Prestado a:</strong><br/>
                                                            {copia.prestamo_activo.prestatario}<br/>
                                                            <small>Hasta: {new Date(copia.prestamo_activo.fecha_fin).toLocaleDateString()}</small>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={styles.copiaActions}>
                                                    <Link
                                                        to={`/libros/ver/${copia.id}`}
                                                        style={{...styles.copiaBtn, backgroundColor: '#2196F3'}}
                                                    >
                                                        👁️ Ver
                                                    </Link>
                                                    <Link
                                                        to={`/libros/editar/${copia.id}`}
                                                        style={{...styles.copiaBtn, backgroundColor: '#FF9800'}}
                                                    >
                                                        ✏️ Editar
                                                    </Link>
                                                    {copia.estado_actual === 'en biblioteca' && (
                                                        <Link
                                                            to={`/prestamos/registrar/${copia.id}`}
                                                            style={{...styles.copiaBtn, backgroundColor: '#4CAF50'}}
                                                        >
                                                            📤 Prestar
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => eliminarCopia(copia.id, copia.titulo, copia.codigo_inventario)}
                                                        style={{...styles.copiaBtn, backgroundColor: '#F44336'}}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : null}
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
    actions: { display: 'flex', gap: '10px' },
    btn: { padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer', transition: 'all 0.3s', display: 'inline-block' },
    btnPrimary: { backgroundColor: '#4CAF50', color: '#fff' },
    btnSecondary: { backgroundColor: '#2196F3', color: 'white' },
    btnClear: { backgroundColor: '#9E9E9E', color: '#fff' },
    filters: { marginBottom: '20px' },
    filterRow: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
    },
    searchInput: {
        flex: 2,
        minWidth: '250px',
        padding: '12px 20px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        outline: 'none'
    },
    select: {
        padding: '12px 20px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        outline: 'none',
        backgroundColor: '#fff',
        cursor: 'pointer',
        minWidth: '150px'
    },
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

    // ===== NUEVO: Estilos de stock =====
    stockContainer: { display: 'flex', flexDirection: 'column', gap: '5px' },
    stockTotal: { fontSize: '14px', fontWeight: '600', color: '#333' },
    stockDetails: { display: 'flex', gap: '5px' },
    stockBadge: { padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#fff' },

    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff', display: 'inline-block' },
    actionButtons: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    actionBtn: { padding: '8px 12px', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', display: 'inline-block', fontWeight: '600' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px', padding: '20px' },
    pageBtn: { padding: '10px 20px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    pageInfo: { fontSize: '16px', color: '#666' },

    // ===== MODAL COPIAS =====
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { backgroundColor: '#fff', borderRadius: '12px', maxWidth: '1200px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '2px solid #e0e0e0', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 },
    closeBtn: { fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '5px 10px' },
    modalSummary: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', padding: '20px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #e0e0e0' },
    summaryItem: { textAlign: 'center' },
    summaryValue: { fontSize: '32px', fontWeight: 'bold', color: '#333' },
    summaryLabel: { fontSize: '12px', color: '#666', marginTop: '5px' },
    copiasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '20px' },
    copiaCard: { backgroundColor: '#fff', border: '3px solid', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
    copiaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #e0e0e0' },
    copiaCodigo: { fontSize: '14px', fontWeight: '600', color: '#333' },
    copiaDetails: { display: 'flex', flexDirection: 'column', gap: '8px' },
    copiaDetail: { fontSize: '13px', color: '#666' },
    prestamoInfo: { padding: '10px', backgroundColor: '#FFF3E0', borderRadius: '6px', fontSize: '12px', marginTop: '5px' },
    copiaActions: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
    copiaBtn: { flex: 1, padding: '8px 12px', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '12px', textDecoration: 'none', display: 'inline-block', fontWeight: '600', textAlign: 'center' },
};

export default Libros;
