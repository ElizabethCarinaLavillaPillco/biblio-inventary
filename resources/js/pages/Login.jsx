// resources/js/pages/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    
    const testUsers = [
        { email: 'maria@biblioteca.com', password: 'biblioteca2024', name: 'Maria Gonzales' },
        { email: 'rosa@biblioteca.com', password: 'biblioteca2024', name: 'Rosa Flores' },
        { email: 'carmen@biblioteca.com', password: 'biblioteca2024', name: 'Carmen Flores' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await axios.post('/login', formData);
            
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido/a!',
                text: `Hola ${response.data.user.name}`,
                timer: 1500,
                showConfirmButton: false
            });
            
            // Notificar al componente App para que actualice el estado
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
                        <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="tu@email.com" style={styles.input} required autoFocus />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" style={styles.input} required />
                    </div>
                    <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>
                        {loading ? '⏳ Iniciando sesión...' : '🔓 Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.info}>
                    <p style={styles.infoText}>🔐 Credenciales de prueba:</p>
                    {testUsers.map((user, index) => (
                        <button key={index} type="button" onClick={() => handleSelectUser(user)} style={styles.userButton}>{user.name}</button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... (tus estilos sin cambios)
const styles = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    header: { textAlign: 'center', marginBottom: '30px' },
    icon: { fontSize: '64px', marginBottom: '20px' },
    title: { fontSize: '32px', color: '#2196F3', margin: '0 0 10px 0', fontWeight: 'bold' },
    subtitle: { fontSize: '16px', color: '#666', margin: 0 },
    form: { marginBottom: '20px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' },
    input: { width: '100%', padding: '14px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '10px', outline: 'none' },
    button: { width: '100%', padding: '16px', fontSize: '18px', fontWeight: '600', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '10px', transition: 'all 0.3s' },
    info: { backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '10px', marginTop: '20px' },
    infoText: { fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '10px' },
    userButton: { display: 'block', width: '100%', padding: '10px', marginBottom: '5px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', textAlign: 'left', fontSize: '13px', color: '#666' },
};

export default Login;