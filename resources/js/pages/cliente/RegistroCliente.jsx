import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaCalendar, FaUserPlus } from 'react-icons/fa';

const RegistroCliente = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        dni: '',
        email: '',
        password: '',
        password_confirmation: '',
        fecha_nacimiento: '',
        telefono: '',
        domicilio: '',
        distrito: '',
        provincia: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/register', formData);
            
            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: response.data.message,
                confirmButtonColor: '#2CA792' // Color de la paleta
            }).then(() => {
                navigate('/cliente/login');
            });

        } catch (error) {
            console.error('Error en registro:', error);
            
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Validación',
                    text: 'Por favor, corrige los errores en el formulario',
                    confirmButtonColor: '#F44336'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Error al registrar. Intenta nuevamente.',
                    confirmButtonColor: '#F44336'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <FaUserPlus style={styles.icon} />
                    <h1 style={styles.title}>Crear Cuenta de Cliente</h1>
                    <p style={styles.subtitle}>Completa tus datos para registrarte en la biblioteca</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Datos Personales */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>👤 Datos Personales</h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaUser style={styles.labelIcon} /> Nombres *</label>
                                <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} style={{...styles.input, borderColor: errors.nombres ? '#e74c3c' : '#e0e0e0'}} required />
                                {errors.nombres && <span style={styles.error}>{errors.nombres[0]}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaUser style={styles.labelIcon} /> Apellidos *</label>
                                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} style={{...styles.input, borderColor: errors.apellidos ? '#e74c3c' : '#e0e0e0'}} required />
                                {errors.apellidos && <span style={styles.error}>{errors.apellidos[0]}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaIdCard style={styles.labelIcon} /> DNI *</label>
                                <input type="text" name="dni" value={formData.dni} onChange={handleChange} maxLength="8" style={{...styles.input, borderColor: errors.dni ? '#e74c3c' : '#e0e0e0'}} placeholder="12345678" required />
                                {errors.dni && <span style={styles.error}>{errors.dni[0]}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaCalendar style={styles.labelIcon} /> Fecha de Nacimiento *</label>
                                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} style={{...styles.input, borderColor: errors.fecha_nacimiento ? '#e74c3c' : '#e0e0e0'}} required />
                                {errors.fecha_nacimiento && <span style={styles.error}>{errors.fecha_nacimiento[0]}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Contacto */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>📞 Información de Contacto</h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaEnvelope style={styles.labelIcon} /> Correo Electrónico *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} style={{...styles.input, borderColor: errors.email ? '#e74c3c' : '#e0e0e0'}} placeholder="tu@email.com" required />
                                {errors.email && <span style={styles.error}>{errors.email[0]}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaPhone style={styles.labelIcon} /> Teléfono *</label>
                                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} style={{...styles.input, borderColor: errors.telefono ? '#e74c3c' : '#e0e0e0'}} placeholder="987 654 321" required />
                                {errors.telefono && <span style={styles.error}>{errors.telefono[0]}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaMapMarkerAlt style={styles.labelIcon} /> Domicilio *</label>
                                <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} style={{...styles.input, borderColor: errors.domicilio ? '#e74c3c' : '#e0e0e0'}} placeholder="Calle Principal 123" required />
                                {errors.domicilio && <span style={styles.error}>{errors.domicilio[0]}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaMapMarkerAlt style={styles.labelIcon} /> Distrito</label>
                                <input type="text" name="distrito" value={formData.distrito} onChange={handleChange} style={styles.input} placeholder="Ej: Wanchaq" />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaMapMarkerAlt style={styles.labelIcon} /> Provincia</label>
                                <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} style={styles.input} placeholder="Ej: Cusco" />
                            </div>
                        </div>
                    </div>

                    {/* Seguridad */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>🔒 Seguridad</h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaLock style={styles.labelIcon} /> Contraseña *</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} style={{...styles.input, borderColor: errors.password ? '#e74c3c' : '#e0e0e0'}} placeholder="Mínimo 6 caracteres" required />
                                {errors.password && <span style={styles.error}>{errors.password[0]}</span>}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}><FaLock style={styles.labelIcon} /> Confirmar Contraseña *</label>
                                <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} style={styles.input} placeholder="Repite tu contraseña" required />
                            </div>
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <Link to="/login" style={styles.btnOutline}>← Volver al Login</Link>
                        <button type="submit" disabled={loading} style={{...styles.btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>
                            {loading ? '⏳ Registrando...' : '✅ Crear Cuenta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #3484A5 0%, #2CA792 100%)', // Gradiente con la paleta
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '24px', // Bordes más redondeados
        padding: '40px',
        maxWidth: '900px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', // Sombra más pronunciada
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    icon: {
        fontSize: '48px',
        color: '#3484A5', // Color primario
        marginBottom: '15px',
    },
    title: {
        fontSize: '32px',
        color: '#333',
        margin: '0 0 10px 0',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
    },
    section: {
        padding: '25px',
        backgroundColor: '#f8f9fa', // Fondo sutil para las secciones
        borderRadius: '12px',
        border: '1px solid #e9ecef',
    },
    sectionTitle: {
        fontSize: '20px',
        color: '#3484A5', // Color primario para los títulos de sección
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: `2px solid #3484A5`, // Borde inferior con color primario
        fontWeight: '600',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
    },
    labelIcon: {
        color: '#2CA792', // Color turquesa para los íconos
    },
    input: {
        padding: '14px 16px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '10px', // Bordes más redondeados
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
    },
    error: {
        color: '#e74c3c', // Rojo más suave para errores
        fontSize: '12px',
        marginTop: '5px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '10px',
    },
    btnPrimary: {
        padding: '14px 32px',
        fontSize: '18px',
        fontWeight: '600',
        backgroundColor: '#3484A5', // Color primario
        color: '#fff',
        border: 'none',
        borderRadius: '50px', // Bordes de píldora
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(52, 132, 165, 0.3)', // Sombra con color del botón
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    btnOutline: {
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#2CA792', // Color turquesa
        textDecoration: 'none',
        borderRadius: '50px', // Bordes de píldora
        border: '2px solid #2CA792', // Borde turquesa
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
    },
};

export default RegistroCliente;