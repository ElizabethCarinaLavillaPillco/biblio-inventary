import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Layout = ({ children, user, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Obtener el token CSRF cuando el componente se monta
        const getCsrfToken = async () => {
            try {
                const response = await axios.get('/csrf-token');
                axios.defaults.headers.common['X-CSRF-TOKEN'] = response.data.token;
            } catch (error) {
                console.error('Error al obtener el token CSRF:', error);
            }
        };

        getCsrfToken();
    }, []);

    const menuItems = [
        { path: '/', icon: '📊', label: 'Dashboard', color: '#4CAF50' },
        { path: '/libros', icon: '📚', label: 'Libros', color: '#2196F3' },
        { path: '/libros/registrar', icon: '➕', label: 'Registrar Libro', color: '#FF9800' },
        { path: '/libros/carga-masiva', icon: '📤', label: 'Carga Masiva', color: '#9C27B0' },
        { path: '/categorias', icon: '🏷️', label: 'Categorías', color: '#FFEB3B' },
        { path: '/ubicaciones', icon: '📍', label: 'Ubicaciones', color: '#00BCD4' },
        { path: '/autores', icon: '✍️', label: 'Autores', color: '#FF5722' },
        { path: '/colecciones', icon: '📚', label: 'Colecciones', color: '#9C27B0' },
        { path: '/prestamos', icon: '📋', label: 'Préstamos', color: '#FFC107' },
        { path: '/exportaciones', icon: '📤', label: 'Exportaciones BNP', color: '#00BCD4' },
        { path: '/usuarios', icon: '👥', label: 'Usuarios', color: '#9C27B0' },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            onLogout();
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <aside style={{
                ...styles.sidebar,
                width: sidebarOpen ? '280px' : '80px',
            }}>
                <div style={styles.sidebarHeader}>
                    <h1 style={{
                        ...styles.logo,
                        display: sidebarOpen ? 'block' : 'none'
                    }}>
                        📖 BiblioSystem
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={styles.toggleBtn}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav style={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                ...styles.navItem,
                                backgroundColor: isActive(item.path) ? item.color : 'transparent',
                                color: isActive(item.path) ? '#fff' : '#333',
                                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                            }}
                        >
                            <span style={styles.icon}>{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <h2 style={styles.headerTitle}>Sistema de Gestión de Biblioteca</h2>
                    <div style={styles.userInfo}>
                        <div style={styles.userRole}>
                            {user.rol === 'admin' ? '👑 Admin' : '📚 Bibliotecario'}
                        </div>
                        <span style={styles.userName}>👤 {user?.name}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </header>

                <div style={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
    },
    sidebar: {
        backgroundColor: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        overflow: 'auto',
        zIndex: 1000,
    },
    sidebarHeader: {
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #e0e0e0',
    },
    logo: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2196F3',
        margin: 0,
    },
    toggleBtn: {
        background: '#2196F3',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    nav: {
        padding: '20px 10px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px 20px',
        marginBottom: '8px',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.3s',
        gap: '15px',
    },
    icon: {
        fontSize: '24px',
    },
    main: {
        marginLeft: '280px',
        flex: 1,
        transition: 'margin-left 0.3s ease',
        width: 'calc(100% - 280px)',
    },
    header: {
        backgroundColor: '#fff',
        padding: '20px 40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        margin: 0,
        fontSize: '24px',
        color: '#333',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    userRole: {
        padding: '6px 12px',
        backgroundColor: '#9C27B0',
        color: '#fff',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600'
    },
    userName: {
        fontSize: '16px',
        color: '#666',
        fontWeight: '600',
    },
    logoutBtn: {
        padding: '8px 16px',
        backgroundColor: '#F44336',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'all 0.3s',
    },
    content: {
        padding: '30px 40px',
        maxWidth: '1400px',
    },
};

export default Layout;
