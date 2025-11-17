// resources/js/pages/EditarLibro.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const EditarLibro = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [autores, setAutores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);

    const [formData, setFormData] = useState({
        titulo: '', autor_id: '', categoria_id: '', precio: '', numero_paginas: '',
        editorial: '', tamanio: 'mediano', color_forro: '', procedencia: '',
        estado_libro: 'normal', destino_mal_estado: 'n/a', estado_actual: 'en biblioteca',
    });

    // NUEVO: Estado para las partes de la ubicación
    const [ubicacionParts, setUbicacionParts] = useState({ anaquel: '', lado: '', nivel: '', seccion: '' });
    // NUEVO: Estado para el ID de la ubicación
    const [ubicacionId, setUbicacionId] = useState('');

    useEffect(() => {
        fetchLibro();
        fetchAutores();
        fetchCategorias();
        fetchUbicaciones();
    }, [id]);

    const fetchLibro = async () => {
        try {
            const response = await axios.get(`/libros/${id}`);
            setFormData(response.data);
            setLoading(false);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar el libro', 'error');
            navigate('/libros');
        }
    };

    const fetchAutores = async () => {
        const response = await axios.get('/autores');
        setAutores(response.data.data || response.data);
    };

    const fetchCategorias = async () => {
        const response = await axios.get('/categorias/all');
        setCategorias(response.data);
    };

    const fetchUbicaciones = async () => {
        const response = await axios.get('/ubicaciones/activas');
        setUbicaciones(response.data);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/libros/${id}`, formData);
            Swal.fire('¡Actualizado!', 'El libro ha sido actualizado correctamente.', 'success');
            navigate('/libros');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar el libro', 'error');
        }
    };

    if (loading) return <div style={styles.loading}>Cargando datos del libro...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>✏️ Editar Libro</h1>
                <Link to="/libros" style={styles.backButton}>← Volver a Libros</Link>
            </div>
            
            <div style={styles.card}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.grid}>
                        {/* Columna Izquierda */}
                        <div style={styles.column}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Título del Libro</label>
                                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Autor</label>
                                <select name="autor_id" value={formData.autor_id} onChange={handleChange} required style={styles.select}>
                                    <option value="">Seleccionar Autor</option>
                                    {autores.map(autor => (
                                        <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Categoría</label>
                                <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required style={styles.select}>
                                    <option value="">Seleccionar Categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Ubicación</label>
                                <select name="ubicacion_id" value={formData.ubicacion_id} onChange={handleChange} style={styles.select}>
                                    <option value="">Sin Ubicación</option>
                                    {ubicaciones.map(ub => (
                                        <option key={ub.id} value={ub.id}>{ub.codigo}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Estado Actual</label>
                                <select name="estado_actual" value={formData.estado_actual} onChange={handleChange} required style={styles.select}>
                                    <option value="en biblioteca">En Biblioteca</option>
                                    <option value="prestado">Prestado</option>
                                    <option value="perdido">Perdido</option>
                                    <option value="biblioteca comunitaria">Biblioteca Comunitaria</option>
                                </select>
                            </div>
                        </div>

                        {/* Columna Derecha */}
                        <div style={styles.column}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Precio (S/.)</label>
                                <input type="number" name="precio" value={formData.precio} onChange={handleChange} step="0.01" min="0" style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Número de Páginas</label>
                                <input type="number" name="numero_paginas" value={formData.numero_paginas} onChange={handleChange} min="1" style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Editorial</label>
                                <input type="text" name="editorial" value={formData.editorial} onChange={handleChange} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tamaño</label>
                                <select name="tamanio" value={formData.tamanio} onChange={handleChange} style={styles.select}>
                                    <option value="pequeño">Pequeño</option>
                                    <option value="mediano">Mediano</option>
                                    <option value="grande">Grande</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Color del Forro</label>
                                <input type="text" name="color_forro" value={formData.color_forro} onChange={handleChange} style={styles.input} />
                            </div>
                        </div>
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Estado Físico del Libro</label>
                        <select name="estado_libro" value={formData.estado_libro} onChange={handleChange} required style={styles.select}>
                            <option value="nuevo">Nuevo</option>
                            <option value="normal">Normal</option>
                            <option value="mal estado">Mal Estado</option>
                        </select>
                    </div>

                    {formData.estado_libro === 'mal estado' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Destino si está en Mal Estado</label>
                            <select name="destino_mal_estado" value={formData.destino_mal_estado} onChange={handleChange} style={styles.select}>
                                <option value="aun en biblioteca">Aún en Biblioteca</option>
                                <option value="descartado a biblioteca comunitaria">Descartado a Bib. Comunitaria</option>
                                <option value="n/a">N/A</option>
                            </select>
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Procedencia</label>
                        <select name="procedencia" value={formData.procedencia} onChange={handleChange} style={styles.select}>
                            <option value="">Seleccionar</option>
                            <option value="ministerio de cultura">Ministerio de Cultura</option>
                            <option value="donaciones">Donaciones</option>
                        </select>
                    </div>

                    <div style={styles.actions}>
                        <button type="button" onClick={() => navigate('/libros')} style={{...styles.button, ...styles.buttonCancel}}>Cancelar</button>
                        <button type="submit" style={{...styles.button, ...styles.buttonSubmit}}>💾 Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '32px', color: '#333', margin: 0 },
    backButton: { padding: '10px 20px', backgroundColor: '#2196F3', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
    column: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' },
    input: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', transition: 'border-color 0.3s' },
    select: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
    actions: { display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' },
    button: { padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' },
    buttonCancel: { backgroundColor: '#9E9E9E', color: '#fff' },
    buttonSubmit: { backgroundColor: '#4CAF50', color: '#fff' },
};

export default EditarLibro;