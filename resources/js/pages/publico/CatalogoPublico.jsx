import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaFilter, FaBook, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CatalogoPublico = () => {
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({});

    // Filtros
    const [categorias, setCategorias] = useState([]);
    const [clasificacionesCdd, setClasificacionesCdd] = useState([]);
    const [autores, setAutores] = useState([]);
    const [colecciones, setColecciones] = useState([]);
    
    const [filtros, setFiltros] = useState({
        categoria_id: '',
        clasificacion_cdd: '',
        autor_id: '',
        coleccion_id: '',
        tipo_item: '',
        disponible: '',
    });

    const [estadisticas, setEstadisticas] = useState({});
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    useEffect(() => {
        fetchLibros();
        fetchFiltros();
        fetchEstadisticas();
    }, [search, filtros]);

    const fetchLibros = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                search,
                ...filtros,
                page,
            };
            
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await axios.get('/publico/libros', { params });
            setLibros(response.data.data || []);
            setPagination(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar libros:', error);
            setLoading(false);
        }
    };

    const fetchFiltros = async () => {
        try {
            const [catRes, cddRes, autRes, colRes] = await Promise.all([
                axios.get('/publico/categorias'),
                axios.get('/publico/clasificaciones-cdd'),
                axios.get('/publico/autores'),
                axios.get('/publico/colecciones'),
            ]);

            setCategorias(catRes.data);
            setClasificacionesCdd(cddRes.data);
            setAutores(autRes.data);
            setColecciones(colRes.data);
        } catch (error) {
            console.error('Error al cargar filtros:', error);
        }
    };

    const fetchEstadisticas = async () => {
        try {
            const response = await axios.get('/publico/estadisticas');
            setEstadisticas(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const handleFiltroChange = (name, value) => {
        setFiltros({ ...filtros, [name]: value });
    };

    const limpiarFiltros = () => {
        setFiltros({
            categoria_id: '',
            clasificacion_cdd: '',
            autor_id: '',
            coleccion_id: '',
            tipo_item: '',
            disponible: '',
        });
        setSearch('');
    };

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <div style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Catálogo de Biblioteca</h1>
                    <p style={styles.heroSubtitle}>Explora nuestra colección de más de {estadisticas.total_libros || 0} libros</p>
                    
                    {/* Barra de búsqueda principal */}
                    <div style={styles.searchBar}>
                        <FaSearch style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por título, autor, ISBN, ISSN..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={styles.clearBtn}>
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Estadísticas rápidas */}
                    <div style={styles.stats}>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{estadisticas.libros_disponibles || 0}</div>
                            <div style={styles.statLabel}>Disponibles</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{estadisticas.total_autores || 0}</div>
                            <div style={styles.statLabel}>Autores</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{estadisticas.total_categorias || 0}</div>
                            <div style={styles.statLabel}>Categorías</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{estadisticas.total_colecciones || 0}</div>
                            <div style={styles.statLabel}>Colecciones</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal con sidebar */}
            <div style={styles.mainContent}>
                {/* Sidebar de filtros */}
                <aside style={{...styles.sidebar, display: mostrarFiltros || window.innerWidth > 768 ? 'block' : 'none'}}>
                    <div style={styles.sidebarHeader}>
                        <FaFilter /> Filtros
                        <button onClick={limpiarFiltros} style={styles.clearFiltersBtn}>
                            Limpiar
                        </button>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Clasificación Dewey (CDD)</label>
                        <select
                            value={filtros.clasificacion_cdd}
                            onChange={(e) => handleFiltroChange('clasificacion_cdd', e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="">Todas las clasificaciones</option>
                            {clasificacionesCdd.map((cdd) => (
                                <option key={cdd.codigo} value={cdd.codigo}>
                                    {cdd.codigo} - {cdd.nombre} ({cdd.total})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Categoría</label>
                        <select
                            value={filtros.categoria_id}
                            onChange={(e) => handleFiltroChange('categoria_id', e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre} ({cat.libros_publicos_count})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Autor</label>
                        <select
                            value={filtros.autor_id}
                            onChange={(e) => handleFiltroChange('autor_id', e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="">Todos los autores</option>
                            {autores.map((autor) => (
                                <option key={autor.id} value={autor.id}>
                                    {autor.nombre} ({autor.libros_publicos_count})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Colección</label>
                        <select
                            value={filtros.coleccion_id}
                            onChange={(e) => handleFiltroChange('coleccion_id', e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="">Todas las colecciones</option>
                            {colecciones.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.nombre} ({col.libros_publicos_count})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Tipo de Ítem</label>
                        <select
                            value={filtros.tipo_item}
                            onChange={(e) => handleFiltroChange('tipo_item', e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="">Todos los tipos</option>
                            <option value="libro">Libro</option>
                            <option value="folleto">Folleto</option>
                            <option value="traduccion">Traducción</option>
                            <option value="revista">Revista</option>
                            <option value="tesis">Tesis</option>
                            <option value="manual">Manual</option>
                            <option value="diccionario">Diccionario</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Disponibilidad</label>
                        <select
                            value={filtros.disponible}
                            onChange={(e) => handleFiltroChange('disponible', e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="">Todos</option>
                            <option value="true">Solo disponibles</option>
                        </select>
                    </div>
                </aside>

                {/* Lista de libros */}
                <div style={styles.content}>
                    <div style={styles.contentHeader}>
                        <button 
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            style={styles.toggleFiltersBtn}
                        >
                            <FaFilter /> {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
                        </button>
                        <div style={styles.resultCount}>
                            {pagination.total || 0} libros encontrados
                        </div>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Cargando libros...</div>
                    ) : libros.length === 0 ? (
                        <div style={styles.emptyState}>
                            <FaBook style={styles.emptyIcon} />
                            <p>No se encontraron libros con los criterios seleccionados</p>
                            <button onClick={limpiarFiltros} style={styles.btnPrimary}>
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={styles.grid}>
                                {libros.map((libro) => (
                                    <Link 
                                        key={libro.id} 
                                        to={`/publico/libro/${libro.id}`}
                                        style={styles.card}
                                    >
                                        <div style={styles.cardHeader}>
                                            <div style={{
                                                ...styles.disponibilidadBadge,
                                                backgroundColor: libro.estado_actual === 'en biblioteca' ? '#2CA792' : '#F0C84F'
                                            }}>
                                                {libro.estado_actual === 'en biblioteca' ? (
                                                    <><FaCheckCircle /> Disponible</>
                                                ) : (
                                                    <><FaTimesCircle /> Prestado</>
                                                )}
                                            </div>
                                            {libro.tipo_item !== 'libro' && (
                                                <div style={styles.tipoBadge}>
                                                    {libro.tipo_item}
                                                </div>
                                            )}
                                        </div>

                                        <h3 style={styles.cardTitle}>{libro.titulo}</h3>
                                        
                                        <div style={styles.cardMeta}>
                                            <div style={styles.metaItem}>
                                                <strong>Autor:</strong> {libro.autor?.nombre || 'Desconocido'}
                                            </div>
                                            <div style={styles.metaItem}>
                                                <strong>Categoría:</strong> {libro.categoria?.nombre || 'Sin categoría'}
                                            </div>
                                            {libro.clasificacion_cdd && (
                                                <div style={styles.metaItem}>
                                                    <strong>CDD:</strong> {libro.clasificacion_cdd}
                                                    {libro.codigo_cdd && `/${libro.codigo_cdd}`}
                                                </div>
                                            )}
                                            {libro.coleccion && (
                                                <div style={styles.metaItem}>
                                                    <strong>Colección:</strong> {libro.coleccion.nombre}
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.cardFooter}>
                                            <span style={styles.verMas}>Ver detalles →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Paginación */}
                            {pagination.last_page > 1 && (
                                <div style={styles.pagination}>
                                    <button
                                        onClick={() => fetchLibros(pagination.current_page - 1)}
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
                                        onClick={() => fetchLibros(pagination.current_page + 1)}
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
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa' 
    },
    hero: {
        background: 'linear-gradient(135deg, #3484A5 0%, #2CA792 100%)', // Gradiente con la paleta
        color: '#fff',
        padding: '60px 20px',
        textAlign: 'center',
    },
    heroContent: { maxWidth: '900px', margin: '0 auto' },
    heroTitle: { fontSize: '48px', margin: '0 0 10px 0', fontWeight: 'bold' },
    heroSubtitle: { fontSize: '20px', margin: '0 0 30px 0', opacity: 0.9 },
    searchBar: {
        position: 'relative',
        maxWidth: '700px',
        margin: '0 auto 30px',
    },
    searchIcon: {
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '20px',
        color: '#666',
    },
    searchInput: {
        width: '100%',
        padding: '18px 20px 18px 55px',
        fontSize: '18px',
        border: 'none',
        borderRadius: '50px', // Bordes redondeados
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        outline: 'none',
        transition: 'box-shadow 0.3s ease',
    },
    clearBtn: {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        color: '#999',
        cursor: 'pointer',
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        maxWidth: '700px',
        margin: '0 auto',
    },
    statCard: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: '20px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
    },
    statValue: { fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' },
    statLabel: { fontSize: '14px', opacity: 0.9 },
    mainContent: {
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
    },
    sidebar: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        height: 'fit-content',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Sombra suave
        position: 'sticky',
        top: '20px',
    },
    sidebarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e0e0e0',
    },
    clearFiltersBtn: {
        padding: '6px 12px',
        backgroundColor: '#F44336',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    filterGroup: { marginBottom: '20px' },
    filterLabel: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
    },
    filterSelect: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        outline: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.3s ease',
    },
    content: { minHeight: '500px' },
    contentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    toggleFiltersBtn: {
        display: 'none', // Se mostrará en responsive
        padding: '10px 20px',
        backgroundColor: '#3484A5', // Color primario
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        gap: '8px',
    },
    resultCount: { fontSize: '16px', color: '#666', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
    },
    emptyIcon: { fontSize: '64px', color: '#ccc', marginBottom: '20px' },
    btnPrimary: {
        padding: '12px 24px',
        backgroundColor: '#2CA792', // Color secundario
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '20px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Sombra suave
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s ease', // Transición suave
        cursor: 'pointer',
        border: '2px solid transparent',
        display: 'flex',
        flexDirection: 'column',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px',
    },
    disponibilidadBadge: {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    tipoBadge: {
        padding: '6px 12px',
        backgroundColor: '#E3F2FD',
        color: '#3484A5', // Color primario
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
        lineHeight: '1.4',
    },
    cardMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '15px',
        flexGrow: 1, // Para que el footer se pegue abajo
    },
    metaItem: {
        fontSize: '14px',
        color: '#666',
    },
    cardFooter: {
        paddingTop: '15px',
        borderTop: '1px solid #e0e0e0',
        marginTop: 'auto', // Empuja el footer hacia abajo
    },
    verMas: {
        color: '#3484A5', // Color primario
        fontSize: '14px',
        fontWeight: '600',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '40px',
    },
    pageBtn: {
        padding: '12px 24px',
        backgroundColor: '#3484A5', // Color primario
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    pageInfo: { fontSize: '16px', color: '#666', fontWeight: '600' },
};

// Media query para responsive
if (window.innerWidth <= 768) {
    styles.mainContent.gridTemplateColumns = '1fr';
    styles.toggleFiltersBtn.display = 'flex';
}

export default CatalogoPublico;