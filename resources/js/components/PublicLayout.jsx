import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaBook, FaHome, FaUser, FaSignOutAlt, FaBookReader, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const PublicLayout = ({ cliente, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (onLogout) {
            await onLogout();
            navigate('/publico');
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.headerLeft}>
                        <img src="/images/logos/logo.png" alt="Logo Biblioteca Municipal" style={styles.logoImage} />
                        <div>
                            <h1 style={styles.logoText}>Biblioteca Municipal de San Jerónimo</h1>
                            <p style={styles.logoSubtext}>San Jerónimo, Cusco, Perú</p>
                        </div>
                    </div>

                    <div style={styles.headerRight}>
                        {cliente ? (
                            <>
                                <Link to="/publico" style={styles.headerLink}>
                                    <FaHome /> Inicio
                                </Link>
                                <Link to="/cliente/reservas" style={styles.headerLink}>
                                    <FaBookReader /> Mis Reservas
                                </Link>
                                <div style={styles.userMenu}>
                                    <Link to="/cliente/perfil" style={styles.userLink}>
                                        <FaUser />
                                        <span style={styles.userName}>{cliente.nombres}</span>
                                    </Link>
                                    <button onClick={handleLogout} style={styles.logoutBtn}>
                                        <FaSignOutAlt /> Cerrar Sesión
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/publico" style={styles.headerLink}>
                                    <FaHome /> Inicio
                                </Link>
                                <Link to="/login" style={styles.btnOutline}>
                                    <FaSignInAlt /> Iniciar Sesión
                                </Link>
                                <Link to="/registro" style={styles.btnPrimary}>
                                    <FaUserPlus /> Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerTitle}>Municipalidad Distrital de San Jerónimo</h3>
                        <p style={styles.footerText}>Sistema de Gestión de Biblioteca</p>
                        <p style={styles.footerText}>Biblioteca Municipal de San Jerónimo - Cusco, Perú</p>
                    </div>

                    <div style={styles.footerSection}>
                        <h3 style={styles.footerTitle}>Enlaces Rápidos</h3>
                        <Link to="/publico" style={styles.footerLink}>Inicio (Catálogo)</Link>
                        {!cliente && <Link to="/registro" style={styles.footerLink}>Crear Cuenta</Link>}
                        {cliente && <Link to="/cliente/perfil" style={styles.footerLink}>Mi Perfil</Link>}
                    </div>

                    <div style={styles.footerSection}>
                        <h3 style={styles.footerTitle}>Información Legal</h3>
                        <p style={styles.footerText}>Cumplimos con:</p>
                        <p style={styles.footerTextSmall}>• Ley N° 29733 - Protección de Datos</p>
                        <p style={styles.footerTextSmall}>• Ley N° 30034 - Sistema Nacional de Bibliotecas</p>
                    </div>
                </div>
                <div style={styles.footerBottom}>
                    <p>© 2025 Municipalidad Distrital de San Jerónimo. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    headerContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '15px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    logoImage: {
        height: '50px',
        width: 'auto',
    },
    logoText: {
        margin: 0,
        fontSize: '26px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    logoSubtext: {
        margin: 0,
        fontSize: '14px',
        color: '#7f8c8d',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    headerLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        color: '#555',
        textDecoration: 'none',
        fontWeight: '500',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
    },
    userMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    userLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#3484A5',
        textDecoration: 'none',
        fontWeight: '600',
        padding: '8px 12px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
    },
    userName: {
        fontSize: '15px',
    },
    btnPrimary: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        backgroundColor: '#3484A5',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '600',
        borderRadius: '50px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 10px rgba(52, 132, 165, 0.3)',
    },
    btnOutline: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        backgroundColor: 'transparent',
        color: '#2CA792',
        textDecoration: 'none',
        fontWeight: '600',
        borderRadius: '50px',
        border: '2px solid #2CA792',
        transition: 'all 0.3s ease',
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#e74c3c',
        color: '#fff',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)',
    },
    main: {
        flex: 1,
        width: '100%',
        margin: '0 auto',
    },
    footer: {
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        marginTop: 'auto',
    },
    footerContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
    },
    footerSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    footerTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#fff',
    },
    footerText: {
        fontSize: '14px',
        color: '#bdc3c7',
        margin: 0,
        lineHeight: '1.6',
    },
    footerTextSmall: {
        fontSize: '13px',
        color: '#95a5a6',
        margin: '4px 0',
    },
    footerLink: {
        color: '#2CA792',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'color 0.3s ease',
    },
    footerBottom: {
        borderTop: '1px solid #34495e',
        padding: '20px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#7f8c8d',
    },
};

export default PublicLayout;
