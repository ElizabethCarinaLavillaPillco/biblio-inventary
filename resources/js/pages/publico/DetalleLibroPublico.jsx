import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    FaBook, FaUser, FaCalendar, FaMapMarkerAlt, FaLanguage,
    FaBarcode, FaDownload, FaCheckCircle, FaClock, FaBookOpen,
    FaLayerGroup, FaMoneyBillWave, FaRulerCombined, FaPalette,
    FaBox, FaStar, FaInfoCircle
} from 'react-icons/fa';

const DetalleLibroPublico = ({ cliente }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [libro, setLibro] = useState(null);
    const [stockInfo, setStockInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLibro();
    }, [id]);

    const fetchLibro = async () => {
        try {
            const response = await axios.get(`/publico/libros/${id}`);
            setLibro(response.data.libro);
            setStockInfo(response.data.stock_info);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo cargar el libro', 'error');
            navigate('/publico');
        }
    };

    const handleReservar = () => {
        if (!cliente) {
            Swal.fire({
                title: 'Inicia sesión',
                text: 'Necesitas una cuenta para hacer reservas',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Iniciar sesión',
                cancelButtonText: 'Registrarse',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login', { state: { returnTo: `/publico/libro/${id}` } });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    navigate('/registro');
                }
            });
            return;
        }

        navigate(`/cliente/reservar/${id}`);
    };

    const handleExportar = async (formato) => {
        try {
            const response = await axios.get(`/publico/libros/${id}/exportar/${formato}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extensiones = {
                'bibtex': 'bib',
                'dublin-core': 'xml',
                'ris': 'ris',
                'marcxml': 'xml',
                'marc': 'mrc',
                'marc-utf8': 'mrc',
                'mods': 'xml',
            };

            link.setAttribute('download', `libro-${libro.id}.${extensiones[formato] || 'txt'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            Swal.fire('¡Descargado!', `Archivo exportado en formato ${formato.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Error al exportar:', error);
            Swal.fire('Error', 'No se pudo exportar el archivo', 'error');
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Cargando información del libro...</p>
            </div>
        );
    }

    if (!libro) {
        return <div style={styles.loading}>Libro no encontrado</div>;
    }

    const hayDisponibles = stockInfo?.stock_disponible > 0;

    return (
        <div style={styles.container}>
            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
                <Link to="/publico" style={styles.breadcrumbLink}>
                    <FaBook style={{ marginRight: '5px' }} />
                    Catálogo
                </Link>
                <span style={styles.breadcrumbSeparator}>›</span>
                <span style={styles.breadcrumbCurrent}>{libro.titulo}</span>
            </div>

            <div style={styles.content}>
                {/* Columna principal */}
                <div style={styles.mainColumn}>
                    {/* Header con título y tipo */}
                    <div style={styles.card}>
                        <div style={styles.headerContent}>
                            <div>
                                <h1 style={styles.title}>{libro.titulo}</h1>
                                <div style={styles.metaTags}>
                                    {libro.tipo_item && libro.tipo_item !== 'libro' && (
                                        <span style={styles.tipoBadge}>
                                            {libro.tipo_item.charAt(0).toUpperCase() + libro.tipo_item.slice(1)}
                                        </span>
                                    )}
                                    {libro.coleccion && (
                                        <span style={{...styles.tipoBadge, backgroundColor: '#9C27B0'}}>
                                            <FaLayerGroup style={{ marginRight: '5px' }} />
                                            {libro.coleccion.nombre}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Estado de disponibilidad */}
                        <div style={{
                            ...styles.disponibilidadCard,
                            backgroundColor: hayDisponibles ? '#e8f5e9' : '#fff8e1',
                            borderColor: hayDisponibles ? '#2CA792' : '#F0C84F',
                        }}>
                            {hayDisponibles ? (
                                <>
                                    <FaCheckCircle style={{ color: '#2CA792', fontSize: '28px' }} />
                                    <div>
                                        <div style={styles.dispLabel}>Disponible para préstamo</div>
                                        <div style={styles.dispSub}>
                                            {stockInfo.stock_disponible} {stockInfo.stock_disponible === 1 ? 'copia disponible' : 'copias disponibles'}
                                            {stockInfo.stock_total > 1 && ` de ${stockInfo.stock_total} total`}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FaClock style={{ color: '#F0C84F', fontSize: '28px' }} />
                                    <div>
                                        <div style={styles.dispLabel}>No disponible</div>
                                        <div style={styles.dispSub}>
                                            {stockInfo?.stock_prestado > 0
                                                ? `${stockInfo.stock_prestado} ${stockInfo.stock_prestado === 1 ? 'copia prestada' : 'copias prestadas'}`
                                                : 'Todas las copias están prestadas'
                                            }
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Información bibliográfica principal */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <FaBook style={{ marginRight: '10px' }} />
                            Información Bibliográfica
                        </h2>
                        <div style={styles.infoGrid}>
                            <InfoItem
                                icon={<FaUser />}
                                label="Autor"
                                value={libro.autor?.nombre || 'Desconocido'}
                            />
                            <InfoItem
                                icon={<FaLayerGroup />}
                                label="Categoría"
                                value={libro.categoria?.nombre || 'Sin categoría'}
                            />

                            {libro.editorial && (
                                <InfoItem
                                    icon={<FaBookOpen />}
                                    label="Editorial"
                                    value={libro.editorial}
                                />
                            )}

                            {libro.anio_publicacion && (
                                <InfoItem
                                    icon={<FaCalendar />}
                                    label="Año de Publicación"
                                    value={libro.anio_publicacion}
                                />
                            )}

                            {libro.idioma && (
                                <InfoItem
                                    icon={<FaLanguage />}
                                    label="Idioma"
                                    value={libro.idioma}
                                />
                            )}

                            {libro.numero_paginas && (
                                <InfoItem
                                    icon={<FaBookOpen />}
                                    label="Páginas"
                                    value={libro.numero_paginas}
                                />
                            )}
                        </div>
                    </div>

                    {/* Identificadores (si existen) */}
                    {(libro.isbn || libro.issn || libro.clasificacion_cdd) && (
                        <div style={styles.card}>
                            <h2 style={styles.sectionTitle}>
                                <FaBarcode style={{ marginRight: '10px' }} />
                                Identificadores y Clasificación
                            </h2>
                            <div style={styles.infoGrid}>
                                {libro.isbn && (
                                    <InfoItem
                                        icon={<FaBarcode />}
                                        label="ISBN"
                                        value={libro.isbn}
                                    />
                                )}
                                {libro.issn && (
                                    <InfoItem
                                        icon={<FaBarcode />}
                                        label="ISSN"
                                        value={libro.issn}
                                    />
                                )}
                                {libro.clasificacion_cdd && (
                                    <InfoItem
                                        icon={<FaLayerGroup />}
                                        label="Clasificación Dewey"
                                        value={`${libro.clasificacion_cdd}${libro.codigo_cdd ? ` / ${libro.codigo_cdd}` : ''}`}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Resumen */}
                    {libro.resumen && (
                        <div style={styles.card}>
                            <h2 style={styles.sectionTitle}>
                                <FaInfoCircle style={{ marginRight: '10px' }} />
                                Resumen
                            </h2>
                            <p style={styles.resumen}>{libro.resumen}</p>
                        </div>
                    )}

                    {/* Notas */}
                    {libro.notas && (
                        <div style={styles.card}>
                            <h2 style={styles.sectionTitle}>
                                <FaInfoCircle style={{ marginRight: '10px' }} />
                                Notas
                            </h2>
                            <p style={styles.notas}>{libro.notas}</p>
                        </div>
                    )}

                    {/* Stock de copias */}
                    {stockInfo && stockInfo.stock_total > 1 && (
                        <div style={styles.card}>
                            <h2 style={styles.sectionTitle}>
                                <FaBook style={{ marginRight: '10px' }} />
                                Stock de Copias
                            </h2>
                            <div style={styles.stockGrid}>
                                <div style={styles.stockItem}>
                                    <div style={styles.stockNumber}>{stockInfo.stock_total}</div>
                                    <div style={styles.stockLabel}>Total de copias</div>
                                </div>
                                <div style={styles.stockItem}>
                                    <div style={{...styles.stockNumber, color: '#2CA792'}}>
                                        {stockInfo.stock_disponible}
                                    </div>
                                    <div style={styles.stockLabel}>Disponibles</div>
                                </div>
                                <div style={styles.stockItem}>
                                    <div style={{...styles.stockNumber, color: '#FF9800'}}>
                                        {stockInfo.stock_prestado}
                                    </div>
                                    <div style={styles.stockLabel}>Prestadas</div>
                                </div>
                                {stockInfo.stock_perdido > 0 && (
                                    <div style={styles.stockItem}>
                                        <div style={{...styles.stockNumber, color: '#F44336'}}>
                                            {stockInfo.stock_perdido}
                                        </div>
                                        <div style={styles.stockLabel}>Perdidas</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar de acciones */}
                <aside style={styles.sidebar}>
                    {/* Botón de reserva */}
                    <div style={styles.card}>
                        <h3 style={styles.actionTitle}>¿Quieres leer este libro?</h3>
                        <button
                            onClick={handleReservar}
                            style={{
                                ...styles.btnReservar,
                                opacity: !hayDisponibles ? 0.8 : 1
                            }}
                        >
                            {hayDisponibles ? '📚 Hacer Reserva' : '📅 Reservar para después'}
                        </button>
                        {!hayDisponibles && (
                            <p style={styles.actionNote}>
                                Puedes reservar este libro. Te notificaremos cuando esté disponible.
                            </p>
                        )}
                        {hayDisponibles && (
                            <p style={styles.actionNote}>
                                ✓ Hay copias disponibles para préstamo inmediato
                            </p>
                        )}
                    </div>

                    {/* Ubicación física */}
                    {libro.ubicacion && (
                        <div style={styles.card}>
                            <h3 style={styles.actionTitle}>
                                <FaMapMarkerAlt /> Ubicación en Biblioteca
                            </h3>
                            <div style={styles.ubicacionBox}>
                                <div style={styles.ubicacionCodigo}>
                                    {libro.ubicacion.codigo}
                                </div>
                                <div style={styles.ubicacionDetail}>
                                    <strong>Anaquel:</strong> {libro.ubicacion.anaquel}
                                </div>
                                <div style={styles.ubicacionDetail}>
                                    <strong>Lado:</strong> {libro.ubicacion.lado}
                                </div>
                                <div style={styles.ubicacionDetail}>
                                    <strong>Nivel:</strong> {libro.ubicacion.nivel}
                                </div>
                                <div style={styles.ubicacionDetail}>
                                    <strong>Sección:</strong> {libro.ubicacion.seccion}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detalles físicos */}
                    <div style={styles.card}>
                        <h3 style={styles.actionTitle}>
                            <FaInfoCircle /> Detalles Físicos
                        </h3>
                        <div style={styles.detailsList}>
                            {libro.tamanio && (
                                <div style={styles.detailItem}>
                                    <FaRulerCombined style={styles.detailIcon} />
                                    <div>
                                        <div style={styles.detailLabel}>Tamaño</div>
                                        <div style={styles.detailValue}>{libro.tamanio}</div>
                                    </div>
                                </div>
                            )}
                            {libro.color_forro && (
                                <div style={styles.detailItem}>
                                    <FaPalette style={styles.detailIcon} />
                                    <div>
                                        <div style={styles.detailLabel}>Color de forro</div>
                                        <div style={styles.detailValue}>{libro.color_forro}</div>
                                    </div>
                                </div>
                            )}
                            {libro.procedencia && (
                                <div style={styles.detailItem}>
                                    <FaBox style={styles.detailIcon} />
                                    <div>
                                        <div style={styles.detailLabel}>Procedencia</div>
                                        <div style={styles.detailValue}>{libro.procedencia}</div>
                                    </div>
                                </div>
                            )}
                            <div style={styles.detailItem}>
                                <FaStar style={styles.detailIcon} />
                                <div>
                                    <div style={styles.detailLabel}>Estado</div>
                                    <div style={styles.detailValue}>
                                        {libro.estado_libro === 'nuevo' ? '⭐ Nuevo' :
                                         libro.estado_libro === 'normal' ? '✓ Bueno' :
                                         'Regular'}
                                    </div>
                                </div>
                            </div>
                            {libro.precio && (
                                <div style={styles.detailItem}>
                                    <FaMoneyBillWave style={styles.detailIcon} />
                                    <div>
                                        <div style={styles.detailLabel}>Precio de referencia</div>
                                        <div style={styles.detailValue}>S/. {parseFloat(libro.precio).toFixed(2)}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Exportar referencias */}
                    <div style={styles.card}>
                        <h3 style={styles.actionTitle}>
                            <FaDownload /> Exportar Referencia
                        </h3>
                        <p style={styles.actionSubtitle}>
                            Para gestores bibliográficos
                        </p>
                        <div style={styles.exportButtons}>
                            <button onClick={() => handleExportar('bibtex')} style={styles.exportBtn}>
                                BibTeX
                            </button>
                            <button onClick={() => handleExportar('ris')} style={styles.exportBtn}>
                                RIS
                            </button>
                            <button onClick={() => handleExportar('dublin-core')} style={styles.exportBtn}>
                                Dublin Core
                            </button>
                            <button onClick={() => handleExportar('marcxml')} style={styles.exportBtn}>
                                MARCXML
                            </button>
                            <button onClick={() => handleExportar('marc')} style={styles.exportBtn}>
                                MARC
                            </button>
                            <button onClick={() => handleExportar('mods')} style={styles.exportBtn}>
                                MODS
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div style={styles.infoItem}>
        <div style={styles.infoIcon}>{icon}</div>
        <div style={styles.infoContent}>
            <div style={styles.infoLabel}>{label}</div>
            <div style={styles.infoValue}>{value}</div>
        </div>
    </div>
);

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
    },
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        fontSize: '14px',
        padding: '10px 0',
    },
    breadcrumbLink: {
        color: '#3484A5',
        textDecoration: 'none',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.3s',
    },
    breadcrumbSeparator: {
        color: '#999',
        fontSize: '18px',
    },
    breadcrumbCurrent: {
        color: '#666',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '500px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #3484A5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        fontSize: '18px',
        color: '#666',
    },
    loading: {
        textAlign: 'center',
        padding: '100px 20px',
        fontSize: '18px',
        color: '#666',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '30px',
    },
    mainColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
    },
    card: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    headerContent: {
        marginBottom: '20px',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '15px',
        lineHeight: '1.3',
    },
    metaTags: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    tipoBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#3484A5',
        color: '#fff',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    disponibilidadCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '25px',
        borderRadius: '12px',
        border: '2px solid',
        transition: 'all 0.3s ease',
    },
    dispLabel: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '5px',
    },
    dispSub: {
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.5',
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
    },
    infoItem: {
        display: 'flex',
        gap: '15px',
        alignItems: 'flex-start',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        transition: 'transform 0.2s',
    },
    infoIcon: {
        fontSize: '24px',
        color: '#3484A5',
        marginTop: '2px',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '5px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    infoValue: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#333',
        wordBreak: 'break-word',
    },
    resumen: {
        fontSize: '16px',
        lineHeight: '1.8',
        color: '#444',
        textAlign: 'justify',
    },
    notas: {
        fontSize: '14px',
        lineHeight: '1.7',
        color: '#666',
        fontStyle: 'italic',
        padding: '15px',
        backgroundColor: '#fff9e6',
        borderLeft: '4px solid #F0C84F',
        borderRadius: '4px',
    },
    stockGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '15px',
    },
    stockItem: {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        border: '2px solid #e0e0e0',
    },
    stockNumber: {
        fontSize: '36px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '5px',
    },
    stockLabel: {
        fontSize: '13px',
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    actionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    actionSubtitle: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '15px',
        lineHeight: '1.5',
    },
    btnReservar: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#2CA792',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(44, 167, 146, 0.3)',
    },
    actionNote: {
        fontSize: '13px',
        color: '#666',
        marginTop: '12px',
        lineHeight: '1.5',
        textAlign: 'center',
    },
    ubicacionBox: {
        padding: '20px',
        backgroundColor: '#f1f8ff',
        borderRadius: '8px',
        border: '2px solid #3484A5',
    },
    ubicacionCodigo: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#3484A5',
        marginBottom: '15px',
        textAlign: 'center',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '6px',
    },
    ubicacionDetail: {
        fontSize: '14px',
        color: '#333',
        marginBottom: '8px',
        paddingLeft: '10px',
    },
    detailsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    detailItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
    },
    detailIcon: {
        fontSize: '20px',
        color: '#3484A5',
    },
    detailLabel: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '3px',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: '15px',
        color: '#333',
        fontWeight: '500',
    },
    exportButtons: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
    },
    exportBtn: {
        padding: '12px',
        backgroundColor: '#f1f8ff',
        color: '#3484A5',
        border: '2px solid #3484A5',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
};

// Agregar animación del spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
        .content { grid-template-columns: 1fr !important; }
    }
`;
document.head.appendChild(styleSheet);

export default DetalleLibroPublico;
