import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEnvelope, FaLock, FaSignInAlt, FaBook } from 'react-icons/fa';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/login', formData);
            
            const userType = response.data.user_type;
            
            if (userType === 'staff') {
                const rolEmoji = response.data.user.rol === 'admin' ? '👑' : '📚';
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido/a!',
                    html: `<div style="font-size: 48px; margin: 20px 0;">${rolEmoji}</div>
                           <p><strong>${response.data.user.name}</strong></p>
                           <p style="color: #666;">${response.data.user.rol === 'admin' ? 'Administrador' : 'Bibliotecario'}</p>`,
                    timer: 2000,
                    showConfirmButton: false
                });
                
                onLogin(response.data);
                navigate('/');
                
            } else if (userType === 'cliente') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido/a!',
                    html: `<div style="font-size: 48px; margin: 20px 0;">📚</div>
                           <p><strong>${response.data.cliente.nombres} ${response.data.cliente.apellidos}</strong></p>
                           <p style="color: #666;">Cliente de Biblioteca</p>`,
                    timer: 2000,
                    showConfirmButton: false
                });
                
                onLogin(response.data);
                const returnTo = location.state?.returnTo || '/publico';
                navigate(returnTo);
            }

        } catch (error) {
            console.error('Error en login:', error);
            Swal.fire('Error', error.response?.data?.message || 'Credenciales incorrectas', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <FaBook style={styles.icon} />
                    <h1 style={styles.title}>BiblioSystem</h1>
                    <p style={styles.subtitle}>Municipalidad Distrital de San Jerónimo</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <FaEnvelope style={styles.labelIcon} /> Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="tu@email.com"
                            style={styles.input}
                            required
                            autoFocus
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <FaLock style={styles.labelIcon} /> Contraseña
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="••••••••"
                            style={styles.input}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <FaSignInAlt /> {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.divider}>
                    <div style={styles.dividerLine}></div>
                    <span style={styles.dividerText}>O</span>
                    <div style={styles.dividerLine}></div>
                </div>

                <div style={styles.registerSection}>
                    <p style={styles.registerText}>¿Eres nuevo en la biblioteca?</p>
                    <Link to="/cliente/registro" style={styles.registerButton}>
                        Crear una cuenta
                    </Link>
                    <Link to="/publico" style={styles.backLink}>
                         ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #3484A5 0%, #2CA792 100%)', // Gradiente con la paleta
        padding: '20px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', // Sombra más pronunciada
    },
    header: {
        textAlign: 'center',
        marginBottom: '35px',
    },
    icon: {
        fontSize: '48px',
        color: '#3484A5', // Color primario
        marginBottom: '15px',
    },
    title: {
        fontSize: '32px',
        color: '#333',
        margin: '0 0 5px 0',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        margin: 0,
    },
    form: {
        marginBottom: '25px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
    },
    labelIcon: {
        color: '#3484A5', // Color primario para los íconos
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box', // Asegura que el padding no afecte el ancho total
    },
    button: {
        width: '100%',
        padding: '16px',
        fontSize: '18px',
        fontWeight: '600',
        backgroundColor: '#2CA792', // Color secundario/acentuado
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(44, 167, 146, 0.3)', // Sombra con color del botón
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '30px 0',
    },
    dividerLine: {
        flexGrow: 1,
        height: '1px',
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        padding: '0 15px',
        fontSize: '14px',
        color: '#999',
        fontWeight: '500',
    },
    registerSection: {
        textAlign: 'center',
    },
    registerText: {
        fontSize: '15px',
        color: '#555',
        marginBottom: '15px',
    },
    registerButton: {
        display: 'inline-block',
        padding: '12px 25px',
        backgroundColor: '#3484A5', // Color primario
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        marginBottom: '15px',
    },
    backLink: {
        display: 'inline-block',
        color: '#3484A5', // Color primario
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'color 0.3s ease',
    },
};

export default Login;