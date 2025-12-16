import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const VerLibro = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [libro, setLibro] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLibro();
    }, [id]);

    const fetchLibro = async () => {
        try {
            const response = await axios.get(`/libros/${id}`);
            setLibro(response.data.libro);
            setLoading(false);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar el libro', 'error');
            navigate('/libros');
        }
    };

    const eliminarLibro = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar libro?',
            text: `¿Estás segura de eliminar "${libro.titulo}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/libros/${id}`);
                Swal.fire('¡Eliminado!', 'El libro ha sido eliminado', 'success');
                navigate('/libros');
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message, 'error');
            }
        }
    };

    if (loading) return <div style={styles.loading}>Cargando...</div>;
    if (!libro) return <div>No se encontró el libro</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📖 Detalles del Libro</h1>
                <button onClick={() => navigate('/libros')} style={styles.backBtn}>
                    ← Volver
                </button>
            </div>

            <div style={styles.card}>
                <div style={styles.mainInfo}>
                    <h2 style={styles.bookTitle}>{libro.titulo}</h2>
                    <div style={{ ...styles.badge, backgroundColor: getEstadoColor(libro.estado_actual) }}>
                        {libro.estado_actual}
                    </div>
                </div>

                <div style={styles.grid}>
                    {/* INFORMACIÓN PRINCIPAL */}
                    <InfoItem label="Autor" value={libro.autor?.nombre} icon="✍️" />
                    <InfoItem label="Categoría" value={libro.categoria?.nombre} icon="🏷️" />
                    <InfoItem label="Precio" value={`S/. ${libro.precio || '0.00'}`} icon="💰" />
                    <InfoItem label="Ubicación" value={libro.ubicacion?.codigo || 'Sin ubicación'} icon="📍" />

                    {/* IDENTIFICADORES BIBLIOGRÁFICOS */}
                    <InfoItem label="ISBN" value={libro.isbn || 'N/A'} icon="📖" />
                    <InfoItem label="ISSN" value={libro.issn || 'N/A'} icon="📰" />
                    <InfoItem label="Colección" value={libro.coleccion?.nombre || 'N/A'} icon="📚" />
                    <InfoItem label="Clasificación CDD" value={libro.clasificacion_cdd || 'N/A'} icon="📊" />
                    <InfoItem label="Código CDD" value={libro.codigo_cdd || 'N/A'} icon="🔢" />

                    {/* INFORMACIÓN DE PUBLICACIÓN */}
                    <InfoItem label="Editorial" value={libro.editorial || 'N/A'} icon="📚" />
                    <InfoItem label="Año Publicación" value={libro.anio_publicacion || 'N/A'} icon="📅" />
                    <InfoItem label="Idioma" value={libro.idioma || 'N/A'} icon="🌍" />
                    <InfoItem label="Páginas" value={libro.numero_paginas || 'N/A'} icon="📄" />

                    {/* CARACTERÍSTICAS FÍSICAS */}
                    <InfoItem label="Tamaño" value={libro.tamanio || 'N/A'} icon="📐" />
                    <InfoItem label="Color Forro" value={libro.color_forro || 'N/A'} icon="🎨" />
                    <InfoItem label="Procedencia" value={libro.procedencia || 'N/A'} icon="📦" />
                    <InfoItem label="Estado Libro" value={libro.estado_libro} icon="⭐" />

                    {/* INFORMACIÓN ADICIONAL */}
                    <InfoItem label="Resumen" value={libro.resumen || 'N/A'} icon="📝" />
                    <InfoItem label="Notas" value={libro.notas || 'N/A'} icon="📋" />

                    {/* INFORMACIÓN DEL SISTEMA */}
                    <InfoItem label="Registrado por" value={libro.registrado_por?.name} icon="👤" />
                    <InfoItem label="Fecha registro" value={new Date(libro.created_at).toLocaleDateString()} icon="📅" />
                    <InfoItem label="Código Inventario" value={libro.codigo_inventario || 'N/A'} icon="🏷️" />
                    <InfoItem label="Destino Mal Estado" value={libro.destino_mal_estado || 'N/A'} icon="⚠️" />
                </div>

                {libro.prestamo_activo && (
                    <div style={styles.prestamoInfo}>
                        <h3>📋 Información del Préstamo Activo</h3>
                        <div style={styles.grid}>
                            <InfoItem label="Nombre" value={libro.prestamo_activo.nombres} />
                            <InfoItem label="Apellidos" value={libro.prestamo_activo.apellidos} />
                            <InfoItem label="DNI" value={libro.prestamo_activo.dni} />
                            <InfoItem label="Teléfono" value={libro.prestamo_activo.telefono} />
                            <InfoItem label="Fecha Inicio" value={new Date(libro.prestamo_activo.fecha_inicio).toLocaleDateString()} />
                            <InfoItem label="Fecha Fin" value={new Date(libro.prestamo_activo.fecha_fin).toLocaleDateString()} />
                        </div>
                    </div>
                )}

                <div style={styles.actions}>
                    <Link to={`/libros/editar/${id}`} style={{...styles.btn, backgroundColor: '#FF9800'}}>
                        ✏️ Editar
                    </Link>
                    {libro.estado_actual === 'en biblioteca' && (
                        <Link to={`/prestamos/registrar/${id}`} style={{...styles.btn, backgroundColor: '#4CAF50'}}>
                            📤 Prestar
                        </Link>
                    )}
                    <button onClick={eliminarLibro} style={{...styles.btn, backgroundColor: '#F44336'}}>
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, icon }) => (
    <div style={styles.infoItem}>
        <div style={styles.infoLabel}>
            {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
            {label}
        </div>
        <div style={styles.infoValue}>{value || 'N/A'}</div>
    </div>
);

const getEstadoColor = (estado) => {
    const colors = {
        'en biblioteca': '#4CAF50',
        'prestado': '#FF9800',
        'perdido': '#F44336',
        'biblioteca comunitaria': '#9E9E9E'
    };
    return colors[estado] || '#2196F3';
};

const styles = {
    container: { padding: '20px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '32px', margin: 0 },
    backBtn: { padding: '10px 20px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    mainInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e0e0e0' },
    bookTitle: { fontSize: '28px', margin: 0, color: '#333' },
    badge: { padding: '8px 16px', borderRadius: '20px', color: '#fff', fontWeight: '600' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' },
    infoItem: { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' },
    infoLabel: { fontSize: '14px', color: '#666', marginBottom: '8px', fontWeight: '600' },
    infoValue: { fontSize: '16px', color: '#333', fontWeight: '500' },
    prestamoInfo: { marginTop: '30px', padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid #FF9800' },
    actions: { display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'center' },
    btn: { padding: '14px 28px', color: '#fff', border: 'none', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }
};

export default VerLibro;
