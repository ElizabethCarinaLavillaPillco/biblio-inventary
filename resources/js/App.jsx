// resources/js/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Componentes staff
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
import Exportaciones from './pages/Exportaciones';
import Auditoria from './pages/Auditoria';

import Colecciones from './pages/Colecciones';


// Componentes públicos y cliente
import PublicLayout from './components/PublicLayout';
import CatalogoPublico from './pages/publico/CatalogoPublico';
import DetalleLibroPublico from './pages/publico/DetalleLibroPublico';
import RegistroCliente from './pages/cliente/RegistroCliente';
import FormularioReserva from './pages/cliente/FormularioReserva';
import PerfilCliente from './pages/cliente/PerfilCliente';
import MisReservas from './pages/cliente/MisReservas';
import '../css/app.css';

// Configuración Axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.withCredentials = true;

function App() {
    const [user, setUser] = useState(null);
    const [cliente, setCliente] = useState(null);
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const { data } = await axios.get('/csrf-token');
                axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;

                const res = await axios.get('/check');

                if (res.data.authenticated) {
                    if (res.data.user_type === 'staff') {
                        setUser(res.data.user);
                        setUserType('staff');
                    } else if (res.data.user_type === 'cliente') {
                        setCliente(res.data.cliente);
                        setUserType('cliente');
                    }
                }
            } catch (e) {
                console.error('Init error', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleLogin = (data) => {
        if (data.user_type === 'staff') {
            setUser(data.user);
            setUserType('staff');
            setCliente(null);
        } else if (data.user_type === 'cliente') {
            setCliente(data.cliente);
            setUserType('cliente');
            setUser(null);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
        } catch (e) {
            console.error('Logout error:', e);
        }
        setUser(null);
        setCliente(null);
        setUserType(null);
    };

    const handleUpdateCliente = (updatedCliente) => {
        setCliente(updatedCliente);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Cargando...
            </div>
        );
    }

    // ============================================
    // RUTAS PARA CLIENTES AUTENTICADOS
    // ============================================
    if (userType === 'cliente') {
        return (
            <Routes>
                <Route element={<PublicLayout cliente={cliente} onLogout={handleLogout} />}>
                    {/* Rutas públicas accesibles por cliente */}
                    <Route path="/" element={<Navigate to="/publico" replace />} />
                    <Route path="/publico" element={<CatalogoPublico cliente={cliente} />} />
                    <Route path="/publico/libro/:id" element={<DetalleLibroPublico cliente={cliente} />} />

                    {/* Rutas privadas de cliente */}
                    <Route path="/cliente/perfil" element={<PerfilCliente cliente={cliente} onUpdateCliente={handleUpdateCliente} />} />
                    <Route path="/cliente/reservas" element={<MisReservas cliente={cliente} />} />
                    <Route path="/cliente/reservar/:libroId" element={<FormularioReserva cliente={cliente} />} />
                    <Route path="/publico/libro/:id/reservar" element={<FormularioReserva cliente={cliente} />} />
                </Route>

                {/* Redirigir cualquier otra ruta al catálogo */}
                <Route path="*" element={<Navigate to="/publico" replace />} />
            </Routes>
        );
    }

    // ============================================
    // RUTAS PARA STAFF AUTENTICADO
    // ============================================
    if (userType === 'staff') {
        return (
            <Layout user={user} onLogout={handleLogout}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/libros" element={<Libros />} />
                    <Route path="/libros/registrar" element={<RegistrarLibro />} />
                    <Route path="/libros/editar/:id" element={<EditarLibro />} />
                    <Route path="/libros/ver/:id" element={<VerLibro />} />
                    <Route path="/libros/carga-masiva" element={<CargaMasiva />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/colecciones" element={<Colecciones />}/>


                    <Route path="/ubicaciones" element={<Ubicaciones />} />
                    <Route path="/autores" element={<Autores />} />
                    <Route path="/prestamos" element={<Prestamos />} />
                    <Route path="/prestamos/registrar/:libroId" element={<RegistrarPrestamo />} />
                    <Route path="/usuarios" element={<Usuarios />} />
                    <Route path="/exportaciones" element={<Exportaciones />} />
                    <Route path="/auditoria" element={<Auditoria />} />

                    {/* Redirigir rutas de cliente al dashboard de staff */}
                    <Route path="/publico/*" element={<Navigate to="/" replace />} />
                    <Route path="/cliente/*" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        );
    }

    // ============================================
    // RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
    // ============================================
    return (
        <Routes>
            {/* Rutas con PublicLayout */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Navigate to="/publico" replace />} />
                <Route path="/publico" element={<CatalogoPublico />} />
                <Route path="/publico/libro/:id" element={<DetalleLibroPublico />} />
            </Route>

            {/* Rutas sin layout (Login y Registro) */}
            <Route path="/registro" element={<RegistroCliente />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />

            {/* Redirigir cualquier otra ruta al catálogo público */}
            <Route path="*" element={<Navigate to="/publico" replace />} />
        </Routes>
    );
}

export default App;
