import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    FaBook, FaUser, FaCalendar, FaMapMarkerAlt, FaLanguage, 
    FaBarcode, FaDownload, FaCheckCircle, FaTimesCircle, FaClock 
} from 'react-icons/fa';

const DetalleLibroPublico = ({ cliente }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [libro, setLibro] = useState(null);
    const [disponibilidad, setDisponibilidad] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLibro();
    }, [id]);

    const fetchLibro = async () => {
        try {
            const response = await axios.get(`/publico/libros/${id}`);
            setLibro(response.data.libro);
            setDisponibilidad(response.data.disponibilidad);
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
                    navigate('/cliente/login', { state: { returnTo: `/publico/libro/${id}` } });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    navigate('/cliente/registro');
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
        return <div style={styles.loading}>Cargando información del libro...</div>;
    }

    if (!libro) {
        return <div style={styles.loading}>Libro no encontrado</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.breadcrumb}>
                <Link to="/publico" style={styles.breadcrumbLink}>Catálogo</Link> 
                <span style={styles.breadcrumbSeparator}>/</span>
                <span style={styles.breadcrumbCurrent}>{libro.titulo}</span>
            </div>

            <div style={styles.content}>
                {/* Columna principal */}
                <div style={styles.mainColumn}>
                    {/* Header con título y disponibilidad */}
                    <div style={styles.card}>
                        <div>
                            <h1 style={styles.title}>{libro.titulo}</h1>
                            {libro.tipo_item !== 'libro' && (
                                <span style={styles.tipoBadge}>{libro.tipo_item}</span>
                            )}
                        </div>
                        
                        <div style={{
                            ...styles.disponibilidadCard,
                            backgroundColor: disponibilidad?.disponible ? '#e8f5e9' : '#fff8e1', // Colores más suaves
                            borderColor: disponibilidad?.disponible ? '#2CA792' : '#F0C84F',
                        }}>
                            {disponibilidad?.disponible ? (
                                <>
                                    <FaCheckCircle style={{ color: '#2CA792', fontSize: '24px' }} />
                                    <div>
                                        <div style={styles.dispLabel}>Disponible</div>
                                        <div style={styles.dispSub}>Puedes reservarlo ahora</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FaClock style={{ color: '#F0C84F', fontSize: '24px' }} />
                                    <div>
                                        <div style={styles.dispLabel}>Prestado</div>
                                        {disponibilidad?.fecha_estimada && (
                                            <div style={styles.dispSub}>
                                                Disponible aprox: {new Date(disponibilidad.fecha_estimada).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Información bibliográfica */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>Información Bibliográfica</h2>
                        <div style={styles.infoGrid}>
                            <InfoItem icon={<FaUser />} label="Autor" value={libro.autor?.nombre || 'Desconocido'} />
                            <InfoItem icon={<FaBook />} label="Categoría" value={libro.categoria?.nombre || 'Sin categoría'} />
                            
                            {libro.coleccion && (
                                <InfoItem icon={<FaBook />} label="Colección" value={libro.coleccion.nombre} />
                            )}
                            
                            {libro.clasificacion_cdd && (
                                <InfoItem 
                                    icon={<FaBook />} 
                                    label="Clasificación CDD" 
                                    value={`${libro.clasificacion_cdd}${libro.codigo_cdd ? `/${libro.codigo_cdd}` : ''}`} 
                                />
                            )}
                            
                            {libro.isbn && (
                                <InfoItem icon={<FaBarcode />} label="ISBN" value={libro.isbn} />
                            )}
                            
                            {libro.issn && (
                                <InfoItem icon={<FaBarcode />} label="ISSN" value={libro.issn} />
                            )}
                            
                            {libro.editorial && (
                                <InfoItem icon={<FaBook />} label="Editorial" value={libro.editorial} />
                            )}
                            
                            {libro.anio_publicacion && (
                                <InfoItem icon={<FaCalendar />} label="Año" value={libro.anio_publicacion} />
                            )}
                            
                            {libro.numero_paginas && (
                                <InfoItem icon={<FaBook />} label="Páginas" value={libro.numero_paginas} />
                            )}
                            
                            {libro.idioma && (
                                <InfoItem icon={<FaLanguage />} label="Idioma" value={libro.idioma} />
                            )}
                            
                            {libro.ubicacion && (
                                <InfoItem icon={<FaMapMarkerAlt />} label="Ubicación" value={libro.ubicacion.codigo} />
                            )}
                        </div>
                    </div>

                    {/* Resumen */}
                    {libro.resumen && (
                        <div style={styles.card}>
                            <h2 style={styles.sectionTitle}>Resumen</h2>
                            <p style={styles.resumen}>{libro.resumen}</p>
                        </div>
                    )}

                    {/* Notas */}
                    {libro.notas && (
                        <div style={styles.card}>
                            <h2 style={styles.sectionTitle}>Notas</h2>
                            <p style={styles.notas}>{libro.notas}</p>
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
                                opacity: !disponibilidad?.disponible ? 0.8 : 1
                            }}
                        >
                            {disponibilidad?.disponible ? '📚 Hacer Reserva' : '📅 Reservar para después'}
                        </button>
                        {!disponibilidad?.disponible && (
                            <p style={styles.actionNote}>
                                Puedes reservar este libro para una fecha posterior a su disponibilidad estimada
                            </p>
                        )}
                    </div>

                    {/* Exportar referencias */}
                    <div style={styles.card}>
                        <h3 style={styles.actionTitle}>
                            <FaDownload /> Exportar Referencia
                        </h3>
                        <p style={styles.actionSubtitle}>
                            Para gestores bibliográficos (Zotero, Mendeley, etc.)
                        </p>
                        <div style={styles.exportButtons}>
                            <button onClick={() => handleExportar('bibtex')} style={styles.exportBtn}>BibTeX</button>
                            <button onClick={() => handleExportar('ris')} style={styles.exportBtn}>RIS</button>
                            <button onClick={() => handleExportar('dublin-core')} style={styles.exportBtn}>Dublin Core</button>
                            <button onClick={() => handleExportar('marcxml')} style={styles.exportBtn}>MARCXML</button>
                            <button onClick={() => handleExportar('marc')} style={styles.exportBtn}>MARC</button>
                            <button onClick={() => handleExportar('mods')} style={styles.exportBtn}>MODS</button>
                        </div>
                    </div>

                    {/* Detalles físicos */}
                    <div style={styles.card}>
                        <h3 style={styles.actionTitle}>Detalles Físicos</h3>
                        {libro.tamanio && (
                            <div style={styles.detailItem}>
                                <strong>Tamaño:</strong> {libro.tamanio}
                            </div>
                        )}
                        {libro.color_forro && (
                            <div style={styles.detailItem}>
                                <strong>Color de forro:</strong> {libro.color_forro}
                            </div>
                        )}
                        {libro.procedencia && (
                            <div style={styles.detailItem}>
                                <strong>Procedencia:</strong> {libro.procedencia}
                            </div>
                        )}
                        <div style={styles.detailItem}>
                            <strong>Estado:</strong> {libro.estado_libro}
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
        <div>
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
    },
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    breadcrumbLink: {
        color: '#3484A5', // Color primario
        textDecoration: 'none',
        fontWeight: '500',
    },
    breadcrumbSeparator: {
        color: '#999',
    },
    breadcrumbCurrent: {
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
        gridTemplateColumns: '1fr 350px',
        gap: '30px',
    },
    mainColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
    },
    card: { // Estilo de tarjeta reutilizable
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Sombra suave
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    tipoBadge: {
        display: 'inline-block',
        padding: '6px 16px',
        backgroundColor: '#e1f5fe',
        color: '#3484A5', // Color primario
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    disponibilidadCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        border: '2px solid',
        transition: 'all 0.3s ease',
    },
    dispLabel: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
    },
    dispSub: {
        fontSize: '14px',
        color: '#666',
        marginTop: '4px',
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #e0e0e0',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    infoItem: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: '20px',
        color: '#3484A5', // Color primario
        marginTop: '2px',
    },
    infoLabel: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '4px',
    },
    infoValue: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#333',
    },
    resumen: {
        fontSize: '16px',
        lineHeight: '1.8',
        color: '#444',
    },
    notas: {
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#666',
        fontStyle: 'italic',
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
        fontSize: '14px',
        color: '#666',
        marginBottom: '15px',
    },
    btnReservar: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#2CA792', // Color secundario
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    actionNote: {
        fontSize: '13px',
        color: '#666',
        marginTop: '10px',
        lineHeight: '1.4',
    },
    exportButtons: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
    },
    exportBtn: {
        padding: '10px',
        backgroundColor: '#f1f8e9',
        color: '#2CA792', // Color secundario
        border: '1px solid #2CA792',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    detailItem: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #f0f0f0',
    },
};

export default DetalleLibroPublico;