// resources/js/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Importa todos tus componentes
import Login from './pages/Login'; 
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Libros from './pages/Libros';
import RegistrarLibro from './pages/RegistrarLibro';
import EditarLibro from './pages/EditarLibro';
import VerLibro from './pages/VerLibro';
import CargaMasiva from './pages/CargaMasiva';
import Categorias from './pages/Categorias';
import Ubicaciones from './pages/Ubicaciones';
import Autores from './pages/Autores';
import Prestamos from './pages/Prestamos';
import RegistrarPrestamo from './pages/RegistrarPrestamo';
import Usuarios from './pages/Usuarios';
import '../css/app.css';

// Configuración global de Axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.withCredentials = true; // ¡MUY IMPORTANTE para las sesiones!

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect principal que se ejecuta solo una vez al cargar la app
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // 1. Obtener el token CSRF y configurarlo para todas las peticiones futuras
                const csrfResponse = await axios.get('/csrf-token');
                axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfResponse.data.token;

                // 2. Verificar si ya hay una sesión activa en el backend
                const authResponse = await axios.get('/check');
                
                if (authResponse.data.authenticated) {
                    setUser(authResponse.data.user);
                }
            } catch (error) {
                console.error("La aplicación no pudo inicializarse:", error);
                // Si falla, el usuario permanecerá no autenticado, lo cual es correcto.
            } finally {
                setLoading(false);
            }
        };

        initializeApp();
    }, []); // El array vacío asegura que solo se ejecute una vez

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        try {
            // Llamar al backend para destruir la sesión
            await axios.post('/logout');
        } catch (error) {
            console.error("Error al cerrar sesión en el backend:", error);
        } finally {
            // Siempre limpiar el estado del frontend
            setUser(null);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>Cargando...</div>;
    }

    return (
        <>
            {!user ? (
                <Login onLogin={handleLogin} />
            ) : (
                <Layout user={user} onLogout={handleLogout}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/libros" element={<Libros />} />
                        <Route path="/libros/registrar" element={<RegistrarLibro />} />
                        <Route path="/libros/editar/:id" element={<EditarLibro />} />
                        <Route path="/libros/ver/:id" element={<VerLibro />} />
                        <Route path="/libros/carga-masiva" element={<CargaMasiva />} />
                        <Route path="/categorias" element={<Categorias />} />
                        <Route path="/ubicaciones" element={<Ubicaciones />} />
                        <Route path="/autores" element={<Autores />} />
                        <Route path="/prestamos" element={<Prestamos />} />
                        <Route path="/prestamos/registrar/:libroId" element={<RegistrarPrestamo />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            )}
        </>
    );
}

export default App;