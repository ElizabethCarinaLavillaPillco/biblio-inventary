// resources/js/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// Componentes públicos (descomenta cuando los tengas)
import PublicLayout from './components/PublicLayout';
import CatalogoPublico from './pages/publico/CatalogoPublico';
import DetalleLibroPublico from './pages/publico/DetalleLibroPublico';
import RegistroCliente from './pages/cliente/RegistroCliente';
import FormularioReserva from './pages/cliente/FormularioReserva';
import PerfilCliente from './pages/cliente/PerfilCliente';
import MisReservas from './pages/cliente/MisReservas';
import '../css/app.css';

// Configuración Axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api'; // ❌ sin espacio
axios.defaults.withCredentials = true;

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const { data } = await axios.get('/csrf-token');
                axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;

                const res = await axios.get('/check');
                if (res.data.authenticated) setUser(res.data.user);
            } catch (e) {
                console.error('Init error', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleLogin = (u) => setUser(u);
    const handleLogout = async () => {
        try { await axios.post('/logout'); } catch {}
        setUser(null);
    };

    if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Cargando...</div>;

    // Rutas que NO requieren login
    const pathname = window.location.pathname;
    const esPublica = pathname === '/' ||
                      pathname.startsWith('/publico') ||
                      pathname === '/login' ||
                      pathname === '/registro';

                      if (esPublica && !user) {
                        return (
                          <Routes>
                            <Route element={<PublicLayout />}>   {/* 👈 envoltorio */}
                              <Route path="/" element={<Navigate to="/publico" replace />} />
                              <Route path="/publico" element={<CatalogoPublico />} />
                              <Route path="/publico/libro/:id" element={<DetalleLibroPublico />} />
                              <Route path="/registro" element={<RegistroCliente />} />
                            </Route>
                            <Route path="/login" element={<Login onLogin={handleLogin} />} />
                            <Route path="*" element={<Navigate to="/publico" replace />} />
                          </Routes>
                        );
                      }

    // Si no hay usuario y la ruta NO es pública → login
    if (!user) return <Login onLogin={handleLogin} />;

    // Usuario staff logueado → Layout completo
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
                <Route path="/ubicaciones" element={<Ubicaciones />} />
                <Route path="/autores" element={<Autores />} />
                <Route path="/prestamos" element={<Prestamos />} />
                <Route path="/prestamos/registrar/:libroId" element={<RegistrarPrestamo />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/exportaciones" element={<Exportaciones />} />
                <Route path="/auditoria" element={<Auditoria />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default App;