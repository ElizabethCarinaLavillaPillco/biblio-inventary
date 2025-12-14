import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaBook, FaCalendar, FaShieldAlt, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const FormularioReserva = ({ cliente }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [libro, setLibro] = useState(null);
    const [disponibilidad, setDisponibilidad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [consentimiento, setConsentimiento] = useState(false);

    const [formData, setFormData] = useState({
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        garantia: '',
        tipo_prestamo: 'en biblioteca',
    });

    useEffect(() => {
        if (!cliente) {
            navigate('/cliente/login', { state: { returnTo: `/publico/libro/${id}` } });
            return;
        }
        fetchLibro();
    }, [id, cliente]);

    const fetchLibro = async () => {
        try {
            const response = await axios.get(`/publico/libros/${id}`);
            setLibro(response.data.libro);
            setDisponibilidad(response.data.disponibilidad);
            
            // Calcular fecha fin por defecto (7 días)
            const fechaInicio = new Date();
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + 7);
            
            setFormData(prev => ({
                ...prev,
                fecha_fin: fechaFin.toISOString().split('T')[0]
            }));
            
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo cargar el libro', 'error');
            navigate('/publico');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!consentimiento) {
            Swal.fire('Atención', 'Debes aceptar el tratamiento de datos personales', 'warning');
            return;
        }

        // Validar fechas
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        
        if (fin <= inicio) {
            Swal.fire('Error', 'La fecha de devolución debe ser posterior a la fecha de inicio', 'error');
            return;
        }

        const diasPrestamo = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
        
        if (diasPrestamo > 30) {
            Swal.fire('Error', 'El préstamo no puede exceder 30 días', 'error');
            return;
        }

        if (diasPrestamo < 1) {
            Swal.fire('Error', 'El préstamo debe ser de al menos 1 día', 'error');
            return;
        }

        setSubmitting(true);

        try {
            await axios.post('/cliente/reservas', {
                libro_id: id,
                ...formData
            });

            Swal.fire({
                icon: 'success',
                title: '¡Reserva creada!',
                html: `
                    <p>Tu solicitud de reserva ha sido enviada.</p>
                    <p><strong>Estado:</strong> Pendiente de aprobación</p>
                    <p>Recibirás una notificación cuando el personal revise tu solicitud.</p>
                `,
                confirmButtonText: 'Ver Mis Reservas',
                confirmButtonColor: '#4CAF50'
            }).then(() => {
                navigate('/cliente/reservas');
            });
        } catch (error) {
            const mensaje = error.response?.data?.message || 'No se pudo crear la reserva';
            Swal.fire('Error', mensaje, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Cargando información...</div>;
    }

    if (!libro) {
        return <div style={styles.loading}>Libro no encontrado</div>;
    }

    // Calcular días de préstamo
    const diasPrestamo = formData.fecha_inicio && formData.fecha_fin
        ? Math.ceil((new Date(formData.fecha_fin) - new Date(formData.fecha_inicio)) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div style={styles.container}>
            <div style={styles.breadcrumb}>
                <Link to="/publico" style={styles.breadcrumbLink}>Catálogo</Link>
                <span> / </span>
                <Link to={`/publico/libro/${libro.id}`} style={styles.breadcrumbLink}>{libro.titulo}</Link>
                <span> / </span>
                <span>Reservar</span>
            </div>

            <div style={styles.content}>
                {/* Información del libro */}
                <div style={styles.bookCard}>
                    <h2 style={styles.bookTitle}>{libro.titulo}</h2>
                    <div style={styles.bookInfo}>
                        <div style={styles.bookInfoItem}>
                            <strong>Autor:</strong> {libro.autor?.nombre}
                        </div>
                        <div style={styles.bookInfoItem}>
                            <strong>Categoría:</strong> {libro.categoria?.nombre}
                        </div>
                        {libro.ubicacion && (
                            <div style={styles.bookInfoItem}>
                                <strong>Ubicación:</strong> {libro.ubicacion.codigo}
                            </div>
                        )}
                    </div>

                    {/* Estado de disponibilidad */}
                    <div style={{
                        ...styles.disponibilidadBanner,
                        backgroundColor: disponibilidad?.disponible ? '#E8F5E9' : '#FFF3E0',
                        borderColor: disponibilidad?.disponible ? '#4CAF50' : '#FF9800'
                    }}>
                        {disponibilidad?.disponible ? (
                            <>
                                <FaCheckCircle style={{ color: '#4CAF50', fontSize: '24px' }} />
                                <div>
                                    <div style={styles.dispTitle}>Libro Disponible</div>
                                    <div style={styles.dispText}>Puedes reservarlo ahora</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <FaExclamationTriangle style={{ color: '#FF9800', fontSize: '24px' }} />
                                <div>
                                    <div style={styles.dispTitle}>Libro Prestado</div>
                                    {disponibilidad?.fecha_estimada && (
                                        <div style={styles.dispText}>
                                            Disponible aprox: {new Date(disponibilidad.fecha_estimada).toLocaleDateString()}
                                        </div>
                                    )}
                                    <div style={styles.dispText}>
                                        Tu reserva será para una fecha posterior
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Formulario de reserva */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2 style={styles.formTitle}>Datos de la Reserva</h2>

                    {/* Información del cliente */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FaInfoCircle /> Tus Datos
                        </h3>
                        <div style={styles.clientInfo}>
                            <div><strong>Nombre:</strong> {cliente.nombres} {cliente.apellidos}</div>
                            <div><strong>DNI:</strong> {cliente.dni}</div>
                            <div><strong>Teléfono:</strong> {cliente.telefono}</div>
                            <div><strong>Domicilio:</strong> {cliente.domicilio}</div>
                        </div>
                    </div>

                    {/* Tipo de préstamo */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FaBook /> Tipo de Préstamo
                        </h3>
                        <div style={styles.radioGroup}>
                            <label style={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="tipo_prestamo"
                                    value="en biblioteca"
                                    checked={formData.tipo_prestamo === 'en biblioteca'}
                                    onChange={handleChange}
                                    style={styles.radio}
                                />
                                <div>
                                    <div style={styles.radioTitle}>En Biblioteca</div>
                                    <div style={styles.radioDesc}>Leerás el libro dentro de la biblioteca</div>
                                </div>
                            </label>
                            
                            <label style={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="tipo_prestamo"
                                    value="a domicilio"
                                    checked={formData.tipo_prestamo === 'a domicilio'}
                                    onChange={handleChange}
                                    style={styles.radio}
                                />
                                <div>
                                    <div style={styles.radioTitle}>A Domicilio</div>
                                    <div style={styles.radioDesc}>Llevarás el libro a tu casa</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FaCalendar /> Fechas del Préstamo
                        </h3>
                        
                        <div style={styles.grid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Fecha de Inicio *</label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Fecha de Devolución *</label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    min={formData.fecha_inicio}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        {diasPrestamo > 0 && (
                            <div style={{
                                ...styles.diasInfo,
                                backgroundColor: diasPrestamo > 30 ? '#FFEBEE' : '#E3F2FD',
                                color: diasPrestamo > 30 ? '#C62828' : '#1565C0'
                            }}>
                                <strong>Días de préstamo:</strong> {diasPrestamo} días
                                {diasPrestamo > 30 && ' (Máximo 30 días permitidos)'}
                            </div>
                        )}
                    </div>

                    {/* Garantía */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FaShieldAlt /> Garantía
                        </h3>
                        <input
                            type="text"
                            name="garantia"
                            value={formData.garantia}
                            onChange={handleChange}
                            placeholder="Ej: DNI, Carnet universitario, Depósito de garantía"
                            style={styles.input}
                            required
                        />
                        <p style={styles.helpText}>
                            Indica qué dejarás como garantía al retirar el libro
                        </p>
                    </div>

                    {/* Consentimiento de datos */}
                    <div style={styles.consentSection}>
                        <label style={styles.consentLabel}>
                            <input
                                type="checkbox"
                                checked={consentimiento}
                                onChange={(e) => setConsentimiento(e.target.checked)}
                                style={styles.checkbox}
                            />
                            <span>
                                Acepto el <strong>tratamiento de mis datos personales</strong> conforme 
                                a la Ley N° 29733 (Protección de Datos Personales) para fines de gestión 
                                bibliotecaria. Mis datos serán utilizados únicamente para procesar esta 
                                reserva y comunicarme sobre el estado del préstamo.
                            </span>
                        </label>
                    </div>

                    {/* Información importante */}
                    <div style={styles.infoBox}>
                        <h4 style={styles.infoTitle}>⚠️ Información Importante</h4>
                        <ul style={styles.infoList}>
                            <li>Tu solicitud será revisada por el personal de la biblioteca</li>
                            <li>El préstamo no será efectivo hasta que sea aprobado</li>
                            <li>Debes devolver el libro en la fecha indicada</li>
                            <li>Los retrasos mayores a 30 días generan sanción automática</li>
                            <li>La sanción bloquea tu cuenta por 3 meses</li>
                            <li>Solo puedes tener máximo 3 préstamos activos simultáneos</li>
                        </ul>
                    </div>

                    {/* Botones */}
                    <div style={styles.actions}>
                        <Link to={`/publico/libro/${libro.id}`} style={styles.btnCancel}>
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || !consentimiento}
                            style={{
                                ...styles.btnSubmit,
                                opacity: (submitting || !consentimiento) ? 0.6 : 1,
                                cursor: (submitting || !consentimiento) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {submitting ? 'Creando reserva...' : '✅ Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px',
    },
    breadcrumb: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '20px',
    },
    breadcrumbLink: {
        color: '#2196F3',
        textDecoration: 'none',
    },
    loading: {
        textAlign: 'center',
        padding: '100px 20px',
        fontSize: '18px',
        color: '#666',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    bookCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    bookTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '15px',
    },
    bookInfo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '20px',
    },
    bookInfoItem: {
        fontSize: '14px',
        color: '#666',
    },
    disponibilidadBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid',
    },
    dispTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
    },
    dispText: {
        fontSize: '14px',
        color: '#666',
        marginTop: '3px',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    formTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e0e0e0',
    },
    section: {
        marginBottom: '30px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    clientInfo: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        display: 'grid',
        gap: '10px',
        fontSize: '14px',
        color: '#666',
    },
    radioGroup: {
        display: 'grid',
        gap: '15px',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px',
        padding: '15px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    radio: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        marginTop: '2px',
    },
    radioTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '3px',
    },
    radioDesc: {
        fontSize: '13px',
        color: '#666',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
    },
    input: {
        padding: '12px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        outline: 'none',
    },
    helpText: {
        fontSize: '13px',
        color: '#999',
        marginTop: '8px',
        fontStyle: 'italic',
    },
    diasInfo: {
        padding: '15px',
        borderRadius: '8px',
        marginTop: '15px',
        fontSize: '14px',
        fontWeight: '600',
    },
    consentSection: {
        padding: '20px',
        backgroundColor: '#FFF9E6',
        border: '2px solid #FFD54F',
        borderRadius: '8px',
        marginBottom: '25px',
    },
    consentLabel: {
        display: 'flex',
        gap: '15px',
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#333',
        cursor: 'pointer',
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        flexShrink: 0,
        marginTop: '2px',
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        border: '2px solid #2196F3',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '25px',
    },
    infoTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1565C0',
        marginBottom: '15px',
    },
    infoList: {
        margin: 0,
        paddingLeft: '20px',
        fontSize: '14px',
        color: '#333',
        lineHeight: '1.8',
    },
    actions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
    },
    btnCancel: {
        padding: '14px 28px',
        backgroundColor: '#9E9E9E',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s',
    },
    btnSubmit: {
        padding: '14px 28px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
};

export default FormularioReserva;