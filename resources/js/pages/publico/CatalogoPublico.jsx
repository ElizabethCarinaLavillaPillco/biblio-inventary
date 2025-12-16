import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaFilter, FaBook, FaCheckCircle, FaTimesCircle, FaBookReader, FaClock, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const CatalogoPublico = () => {
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    const fetchLibros = async () => {
        try {
            setLoading(true);
            const params = {
                search,
                ...filtros,
                limit: 6, // Solo 6 libros más recientes
            };

            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await axios.get('/publico/libros', { params });
            setLibros(response.data.data || []);
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

    // ===== FRASES MOTIVACIONALES SOBRE LECTURA =====
    const frases = [
        { texto: "La lectura es para la mente lo que el ejercicio es para el cuerpo", autor: "Joseph Addison" },
        { texto: "Un libro abierto es un cerebro que habla; cerrado, un amigo que espera; olvidado, un alma que perdona; destruido, un corazón que llora", autor: "Proverbio hindú" },
        { texto: "Leer es como pensar, como rezar, como hablar con un amigo, como exponer tus ideas, como escuchar las ideas de otros, como escuchar música, como contemplar un paisaje, como salir a dar un paseo por la playa", autor: "Roberto Bolaño" },
    ];

    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <div style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Catálogo de Biblioteca Municipal</h1>
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
                            📚 Últimos Libros Registrados
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
                        </>
                    )}

                    {/* ===== SECCIÓN DE FRASE MOTIVACIONAL ===== */}
                    <div style={styles.fraseSection}>
                        <FaBookReader style={styles.fraseIcon} />
                        <blockquote style={styles.fraseTexto}>
                            "{fraseAleatoria.texto}"
                        </blockquote>
                        <cite style={styles.fraseAutor}>— {fraseAleatoria.autor}</cite>
                    </div>

                    {/* ===== SECCIÓN INFORMATIVA DE LA BIBLIOTECA ===== */}
                    <div style={styles.infoSection}>
                        <h2 style={styles.infoTitle}>📚 Sobre Nuestra Biblioteca</h2>

                        <div style={styles.infoGrid}>
                            {/* Card 1: Servicios */}
                            <div style={styles.infoCard}>
                                <div style={styles.infoCardIcon}>
                                    <FaBook size={32} color="#3484A5" />
                                </div>
                                <h3 style={styles.infoCardTitle}>Servicios Disponibles</h3>
                                <ul style={styles.infoCardList}>
                                    <li>✓ Préstamo de libros a domicilio</li>
                                    <li>✓ Lectura en sala</li>
                                    <li>✓ Consulta de catálogo en línea</li>
                                    <li>✓ Reserva de libros</li>
                                    <li>✓ Material de referencia</li>
                                </ul>
                            </div>

                            {/* Card 2: Horarios */}
                            <div style={styles.infoCard}>
                                <div style={styles.infoCardIcon}>
                                    <FaClock size={32} color="#2CA792" />
                                </div>
                                <h3 style={styles.infoCardTitle}>Horarios de Atención</h3>
                                <div style={styles.infoCardContent}>
                                    <p><strong>Lunes a Viernes:</strong></p>
                                    <p>8:00 AM - 6:00 PM</p>
                                    <p style={{marginTop: '10px'}}><strong>Sábados:</strong></p>
                                    <p>9:00 AM - 1:00 PM</p>
                                    <p style={{marginTop: '10px', fontSize: '14px', color: '#F44336'}}>
                                        <strong>Domingos y feriados:</strong> Cerrado
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Ubicación */}
                            <div style={styles.infoCard}>
                                <div style={styles.infoCardIcon}>
                                    <FaMapMarkerAlt size={32} color="#F0C84F" />
                                </div>
                                <h3 style={styles.infoCardTitle}>Ubicación y Contacto</h3>
                                <div style={styles.infoCardContent}>
                                    <p><FaMapMarkerAlt style={{marginRight: '8px'}} />
                                        <strong>Dirección:</strong><br/>
                                        <span style={{marginLeft: '24px'}}>
                                            Plaza de Armas, Centro Histórico<br/>
                                            Cusco, Perú
                                        </span>
                                    </p>
                                    <p style={{marginTop: '15px'}}>
                                        <FaPhone style={{marginRight: '8px'}} />
                                        <strong>Teléfono:</strong><br/>
                                        <span style={{marginLeft: '24px'}}>
                                            (084) 123-4567
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Card 4: Requisitos */}
                            <div style={styles.infoCard}>
                                <div style={styles.infoCardIcon}>
                                    <FaCheckCircle size={32} color="#4CAF50" />
                                </div>
                                <h3 style={styles.infoCardTitle}>Requisitos para Préstamo</h3>
                                <div style={styles.infoCardContent}>
                                    <p><strong>Para préstamo a domicilio:</strong></p>
                                    <ul style={styles.infoCardList}>
                                        <li>✓ DNI o documento de identidad</li>
                                        <li>✓ Comprobante de domicilio</li>
                                        <li>✓ Número de teléfono</li>
                                        <li>✓ Garantía (DNI o carnet)</li>
                                    </ul>
                                    <p style={{marginTop: '10px', fontSize: '13px', color: '#666'}}>
                                        <strong>Nota:</strong> Préstamos de hasta 15 días renovables
                                    </p>
                                </div>
                            </div>

                            {/* Card 5: Colecciones Especiales */}
                            <div style={styles.infoCard}>
                                <div style={styles.infoCardIcon}>
                                    <FaBook size={32} color="#9C27B0" />
                                </div>
                                <h3 style={styles.infoCardTitle}>Colecciones Destacadas</h3>
                                <ul style={styles.infoCardList}>
                                    <li>📖 Literatura peruana y cusqueña</li>
                                    <li>📚 Historia del Cusco e Incas</li>
                                    <li>🎓 Material educativo escolar</li>
                                    <li>🌍 Literatura universal clásica</li>
                                    <li>👶 Literatura infantil y juvenil</li>
                                </ul>
                            </div>

                            {/* Card 6: Normas */}
                            <div style={styles.infoCard}>
                                <div style={styles.infoCardIcon}>
                                    <FaBookReader size={32} color="#FF9800" />
                                </div>
                                <h3 style={styles.infoCardTitle}>Normas de la Biblioteca</h3>
                                <ul style={styles.infoCardList}>
                                    <li>• Silencio y respeto en salas de lectura</li>
                                    <li>• No ingresar con alimentos ni bebidas</li>
                                    <li>• Cuidar el material bibliográfico</li>
                                    <li>• Devolver los libros en la fecha indicada</li>
                                    <li>• Reportar cualquier daño o extravío</li>
                                </ul>
                            </div>
                        </div>
                    </div>
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
        background: 'linear-gradient(135deg, #3484A5 0%, #2CA792 100%)',
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
        borderRadius: '50px',
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
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
        display: 'none',
        padding: '10px 20px',
        backgroundColor: '#3484A5',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        gap: '8px',
    },
    resultCount: { fontSize: '20px', color: '#333', fontWeight: '700' },
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
        backgroundColor: '#2CA792',
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
        marginBottom: '40px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s ease',
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
        color: '#3484A5',
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
        flexGrow: 1,
    },
    metaItem: {
        fontSize: '14px',
        color: '#666',
    },
    cardFooter: {
        paddingTop: '15px',
        borderTop: '1px solid #e0e0e0',
        marginTop: 'auto',
    },
    verMas: {
        color: '#3484A5',
        fontSize: '14px',
        fontWeight: '600',
    },

    // ===== ESTILOS DE FRASE MOTIVACIONAL =====
    fraseSection: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px',
        marginTop: '40px',
        marginBottom: '40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        textAlign: 'center',
        borderLeft: '5px solid #2CA792',
    },
    fraseIcon: {
        fontSize: '48px',
        color: '#2CA792',
        marginBottom: '20px',
    },
    fraseTexto: {
        fontSize: '24px',
        fontStyle: 'italic',
        color: '#333',
        lineHeight: '1.6',
        marginBottom: '15px',
        fontWeight: '300',
    },
    fraseAutor: {
        fontSize: '16px',
        color: '#666',
        fontStyle: 'normal',
        fontWeight: '600',
    },

    // ===== ESTILOS DE SECCIÓN INFORMATIVA =====
    infoSection: {
        marginTop: '40px',
    },
    infoTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '30px',
        textAlign: 'center',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '25px',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default',
    },
    infoCardIcon: {
        marginBottom: '15px',
    },
    infoCardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #e0e0e0',
    },
    infoCardContent: {
        fontSize: '15px',
        color: '#555',
        lineHeight: '1.6',
    },
    infoCardList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        fontSize: '15px',
        color: '#555',
        lineHeight: '2',
    },
};

// Media query para responsive
if (window.innerWidth <= 768) {
    styles.mainContent.gridTemplateColumns = '1fr';
    styles.toggleFiltersBtn.display = 'flex';
}

export default CatalogoPublico;
