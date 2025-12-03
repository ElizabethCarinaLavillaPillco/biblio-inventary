import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const testUsers = [
        { email: 'maria@biblioteca.com', password: 'biblioteca2024', name: 'María González', rol: 'Admin' },
        { email: 'rosa@biblioteca.com', password: 'biblioteca2024', name: 'Rosa Mendoza', rol: 'Bibliotecario' },
        { email: 'carmen@biblioteca.com', password: 'biblioteca2024', name: 'Carmen Flores', rol: 'Bibliotecario' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/login', formData);

            const rolEmoji = response.data.user.rol === 'admin' ? '👑' : '📚';

            Swal.fire({
                icon: 'success',
                title: `¡Bienvenido/a!`,
                html: `<div style="font-size: 48px; margin: 20px 0;">${rolEmoji}</div>
                       <p><strong>${response.data.user.name}</strong></p>
                       <p style="color: #666;">${response.data.user.rol === 'admin' ? 'Administrador' : 'Bibliotecario'}</p>`,
                timer: 2000,
                showConfirmButton: false
            });

            onLogin(response.data.user);

        } catch (error) {
            console.error('Error en login:', error);
            Swal.fire('Error', error.response?.data?.message || 'Credenciales incorrectas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setFormData({ email: user.email, password: user.password });
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.icon}>📚</div>
                    <h1 style={styles.title}>BiblioSystem</h1>
                    <p style={styles.subtitle}>Sistema de Gestión de Biblioteca</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Correo Electrónico</label>
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
                        <label style={styles.label}>Contraseña</label>
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
                        {loading ? '⏳ Iniciando sesión...' : '🔓 Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.info}>
                    <p style={styles.infoText}>🔐 Credenciales de prueba:</p>
                    {testUsers.map((user, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            style={{
                                ...styles.userButton,
                                borderLeft: `4px solid ${user.rol === 'Admin' ? '#9C27B0' : '#2196F3'}`
                            }}
                        >
                            <div style={styles.userButtonHeader}>
                                <span style={styles.userButtonName}>{user.name}</span>
                                <span style={{
                                    ...styles.userButtonRol,
                                    backgroundColor: user.rol === 'Admin' ? '#9C27B0' : '#2196F3'
                                }}>
                                    {user.rol === 'Admin' ? '👑 Admin' : '📚 Bibliotecario'}
                                </span>
                            </div>
                            <div style={styles.userButtonEmail}>{user.email}</div>
                        </button>
                    ))}
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    header: { textAlign: 'center', marginBottom: '30px' },
    icon: { fontSize: '64px', marginBottom: '20px' },
    title: { fontSize: '32px', color: '#2196F3', margin: '0 0 10px 0', fontWeight: 'bold' },
    subtitle: { fontSize: '16px', color: '#666', margin: 0 },
    form: { marginBottom: '30px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' },
    input: {
        width: '100%',
        padding: '14px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    button: {
        width: '100%',
        padding: '16px',
        fontSize: '18px',
        fontWeight: '600',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        transition: 'all 0.3s',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
    },
    info: {
        backgroundColor: '#f5f5f5',
        padding: '25px',
        borderRadius: '12px',
        border: '2px solid #e0e0e0'
    },
    infoText: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '15px',
        textAlign: 'center'
    },
    userButton: {
        display: 'block',
        width: '100%',
        padding: '15px',
        marginBottom: '10px',
        backgroundColor: '#fff',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.3s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    userButtonHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    userButtonName: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#333'
    },
    userButtonRol: {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        color: '#fff'
    },
    userButtonEmail: {
        fontSize: '13px',
        color: '#666'
    }
};

export default Login;
