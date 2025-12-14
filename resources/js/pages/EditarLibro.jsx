// resources/js/pages/EditarLibro.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const EditarLibro = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autores, setAutores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [colecciones, setColecciones] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [mostrarCamposAvanzados, setMostrarCamposAvanzados] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        tipo_item: 'libro',
        autor_id: '',
        isbn: '',
        issn: '',
        coleccion_id: '',
        categoria_id: '',
        clasificacion_cdd: '',
        codigo_cdd: '',
        precio: '',
        numero_paginas: '',
        editorial: '',
        anio_publicacion: '',
        idioma: '',
        resumen: '',
        notas: '',
        tamanio: '',
        color_forro: '',
        procedencia: '',
        estado_libro: 'normal',
        destino_mal_estado: 'n/a',
        estado_actual: 'en biblioteca',
        ubicacion_id: '',
    });

    useEffect(() => {
        fetchLibro();
        fetchAutores();
        fetchCategorias();
        fetchColecciones();
        fetchUbicaciones();
    }, [id]);

    const fetchLibro = async () => {
        try {
            const response = await axios.get(`/libros/${id}`);
            const libro = response.data;
            
            setFormData({
                titulo: libro.titulo || '',
                tipo_item: libro.tipo_item || 'libro',
                autor_id: libro.autor_id || '',
                isbn: libro.isbn || '',
                issn: libro.issn || '',
                coleccion_id: libro.coleccion_id || '',
                categoria_id: libro.categoria_id || '',
                clasificacion_cdd: libro.clasificacion_cdd || '',
                codigo_cdd: libro.codigo_cdd || '',
                precio: libro.precio || '',
                numero_paginas: libro.numero_paginas || '',
                editorial: libro.editorial || '',
                anio_publicacion: libro.anio_publicacion || '',
                idioma: libro.idioma || '',
                resumen: libro.resumen || '',
                notas: libro.notas || '',
                tamanio: libro.tamanio || '',
                color_forro: libro.color_forro || '',
                procedencia: libro.procedencia || '',
                estado_libro: libro.estado_libro || 'normal',
                destino_mal_estado: libro.destino_mal_estado || 'n/a',
                estado_actual: libro.estado_actual || 'en biblioteca',
                ubicacion_id: libro.ubicacion_id || '',
            });
            
            // Auto-activar modo avanzado si hay datos en campos avanzados
            if (libro.isbn || libro.issn || libro.clasificacion_cdd || libro.resumen) {
                setMostrarCamposAvanzados(true);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar libro:', error);
            Swal.fire('Error', 'No se pudo cargar el libro', 'error');
            navigate('/libros');
        }
    };

    const fetchAutores = async () => {
        try {
            const response = await axios.get('/autores');
            setAutores(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar autores:', error);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await axios.get('/categorias/all');
            setCategorias(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const fetchColecciones = async () => {
        try {
            const response = await axios.get('/colecciones');
            setColecciones(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar colecciones:', error);
        }
    };

    const fetchUbicaciones = async () => {
        try {
            const response = await axios.get('/ubicaciones/activas');
            setUbicaciones(response.data);
        } catch (error) {
            console.error('Error al cargar ubicaciones:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updates = { [name]: value };

        if (name === 'estado_libro') {
            if (value === 'mal estado') {
                updates.destino_mal_estado = 'aun en biblioteca';
            } else {
                updates.destino_mal_estado = 'n/a';
            }
        }

        if (name === 'destino_mal_estado' && value === 'descartado a biblioteca comunitaria') {
            updates.estado_actual = 'biblioteca comunitaria';
            updates.ubicacion_id = '';
        }

        setFormData({ ...formData, ...updates });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.titulo || !formData.autor_id || !formData.categoria_id) {
            Swal.fire('Error', 'Por favor completa los campos obligatorios (Título, Autor, Categoría)', 'error');
            return;
        }

        setSaving(true);

        try {
            // Preparar datos - convertir valores vacíos a null
            const dataToSend = {
                titulo: formData.titulo,
                tipo_item: formData.tipo_item,
                autor_id: formData.autor_id,
                categoria_id: formData.categoria_id,
                
                // Campos opcionales - enviar null si están vacíos
                isbn: formData.isbn || null,
                issn: formData.issn || null,
                coleccion_id: formData.coleccion_id || null,
                clasificacion_cdd: formData.clasificacion_cdd || null,
                codigo_cdd: formData.codigo_cdd || null,
                editorial: formData.editorial || null,
                anio_publicacion: formData.anio_publicacion || null,
                idioma: formData.idioma || null,
                precio: formData.precio || null,
                ubicacion_id: formData.ubicacion_id || null,
                resumen: formData.resumen || null,
                notas: formData.notas || null,
                numero_paginas: formData.numero_paginas || null,
                tamanio: formData.tamanio || null,
                color_forro: formData.color_forro || null,
                procedencia: formData.procedencia || null,
                estado_libro: formData.estado_libro,
                destino_mal_estado: formData.destino_mal_estado,
                estado_actual: formData.estado_actual,
            };

            console.log('Datos a enviar:', dataToSend);

            await axios.put(`/libros/${id}`, dataToSend);
            
            Swal.fire('¡Actualizado!', 'El libro ha sido actualizado correctamente.', 'success');
            navigate('/libros');
        } catch (error) {
            console.error('Error al actualizar:', error);
            
            let errorMessage = 'No se pudo actualizar el libro';
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                errorMessage = Object.values(errors).flat().join('\n');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            
            Swal.fire('Error', errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={styles.loading}>Cargando datos del libro...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <h1 style={styles.title}>✏️ Editar Material Bibliográfico</h1>
                <div style={styles.headerActions}>
                    <button
                        type="button"
                        onClick={() => setMostrarCamposAvanzados(!mostrarCamposAvanzados)}
                        style={styles.toggleBtn}
                    >
                        {mostrarCamposAvanzados ? '📋 Modo Simple' : '🔧 Modo Avanzado'}
                    </button>
                    <Link to="/libros" style={styles.backButton}>← Volver a Libros</Link>
                </div>
            </div>
            
            <div style={styles.card}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* SECCIÓN 1: INFORMACIÓN PRINCIPAL */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📖 Información Principal</h2>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Título *</label>
                                <input 
                                    type="text" 
                                    name="titulo" 
                                    value={formData.titulo} 
                                    onChange={handleChange} 
                                    required 
                                    style={styles.input} 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tipo de Material *</label>
                                <select
                                    name="tipo_item"
                                    value={formData.tipo_item}
                                    onChange={handleChange}
                                    style={styles.select}
                                    required
                                >
                                    <option value="libro">Libro</option>
                                    <option value="folleto">Folleto</option>
                                    <option value="traduccion">Traducción</option>
                                    <option value="revista">Revista</option>
                                    <option value="tesis">Tesis</option>
                                    <option value="manual">Manual</option>
                                    <option value="diccionario">Diccionario</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Autor *</label>
                                <select 
                                    name="autor_id" 
                                    value={formData.autor_id} 
                                    onChange={handleChange} 
                                    required 
                                    style={styles.select}
                                >
                                    <option value="">Seleccionar Autor</option>
                                    {autores.map(autor => (
                                        <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Categoría *</label>
                                <select 
                                    name="categoria_id" 
                                    value={formData.categoria_id} 
                                    onChange={handleChange} 
                                    required 
                                    style={styles.select}
                                >
                                    <option value="">Seleccionar Categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: IDENTIFICADORES (Modo Avanzado) */}
                    {mostrarCamposAvanzados && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>🔖 Identificadores Bibliográficos</h2>
                            <div style={styles.grid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>ISBN</label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="978-3-16-148410-0"
                                        maxLength="20"
                                    />
                                    <small style={styles.helpText}>International Standard Book Number</small>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>ISSN</label>
                                    <input
                                        type="text"
                                        name="issn"
                                        value={formData.issn}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="1234-5678"
                                        maxLength="20"
                                    />
                                    <small style={styles.helpText}>Serial Number (revistas)</small>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Colección</label>
                                    <select
                                        name="coleccion_id"
                                        value={formData.coleccion_id}
                                        onChange={handleChange}
                                        style={styles.select}
                                    >
                                        <option value="">Sin colección</option>
                                        {colecciones.map(col => (
                                            <option key={col.id} value={col.id}>{col.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Clasificación Dewey (CDD)</label>
                                    <select
                                        name="clasificacion_cdd"
                                        value={formData.clasificacion_cdd}
                                        onChange={handleChange}
                                        style={styles.select}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="000">000 - Informática, conocimiento y sistemas</option>
                                        <option value="100">100 - Filosofía y psicología</option>
                                        <option value="200">200 - Religión</option>
                                        <option value="300">300 - Ciencias sociales</option>
                                        <option value="400">400 - Lenguas</option>
                                        <option value="500">500 - Ciencias naturales y matemáticas</option>
                                        <option value="600">600 - Tecnología y ciencias aplicadas</option>
                                        <option value="700">700 - Artes y recreación</option>
                                        <option value="800">800 - Literatura</option>
                                        <option value="900">900 - Historia y geografía</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Código CDD Específico</label>
                                    <input
                                        type="text"
                                        name="codigo_cdd"
                                        value={formData.codigo_cdd}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Ej: 823.914"
                                        maxLength="50"
                                    />
                                    <small style={styles.helpText}>Código Dewey específico</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN 3: PUBLICACIÓN */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📚 Información de Publicación</h2>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Editorial</label>
                                <input 
                                    type="text" 
                                    name="editorial" 
                                    value={formData.editorial} 
                                    onChange={handleChange} 
                                    style={styles.input} 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Año de Publicación</label>
                                <input
                                    type="number"
                                    name="anio_publicacion"
                                    value={formData.anio_publicacion}
                                    onChange={handleChange}
                                    style={styles.input}
                                    min="1000"
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Idioma</label>
                                <select
                                    name="idioma"
                                    value={formData.idioma}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Español">Español</option>
                                    <option value="Inglés">Inglés</option>
                                    <option value="Francés">Francés</option>
                                    <option value="Italiano">Italiano</option>
                                    <option value="Portugués">Portugués</option>
                                    <option value="Alemán">Alemán</option>
                                    <option value="Quechua">Quechua</option>
                                    <option value="Aymara">Aymara</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Precio (S/.)</label>
                                <input 
                                    type="number" 
                                    name="precio" 
                                    value={formData.precio} 
                                    onChange={handleChange} 
                                    style={styles.input} 
                                    step="0.01" 
                                    min="0" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 4: UBICACIÓN */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📍 Ubicación Física</h2>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Ubicación</label>
                            <select 
                                name="ubicacion_id" 
                                value={formData.ubicacion_id} 
                                onChange={handleChange} 
                                style={styles.select}
                            >
                                <option value="">Sin Ubicación</option>
                                {ubicaciones.map(ub => (
                                    <option key={ub.id} value={ub.id}>{ub.codigo}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* SECCIÓN 5: DESCRIPCIÓN (Modo Avanzado) */}
                    {mostrarCamposAvanzados && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>📝 Descripción</h2>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Resumen</label>
                                <textarea
                                    name="resumen"
                                    value={formData.resumen}
                                    onChange={handleChange}
                                    style={styles.textarea}
                                    rows="4"
                                    placeholder="Breve resumen del contenido..."
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Notas Adicionales</label>
                                <textarea
                                    name="notas"
                                    value={formData.notas}
                                    onChange={handleChange}
                                    style={styles.textarea}
                                    rows="3"
                                    placeholder="Notas internas, observaciones..."
                                />
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN 6: CARACTERÍSTICAS FÍSICAS */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📐 Características Físicas</h2>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Número de Páginas</label>
                                <input 
                                    type="number" 
                                    name="numero_paginas" 
                                    value={formData.numero_paginas} 
                                    onChange={handleChange} 
                                    style={styles.input} 
                                    min="1" 
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tamaño</label>
                                <select 
                                    name="tamanio" 
                                    value={formData.tamanio} 
                                    onChange={handleChange} 
                                    style={styles.select}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="pequeño">Pequeño</option>
                                    <option value="mediano">Mediano</option>
                                    <option value="grande">Grande</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Color de Forro</label>
                                <input 
                                    type="text" 
                                    name="color_forro" 
                                    value={formData.color_forro} 
                                    onChange={handleChange} 
                                    style={styles.input} 
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Procedencia</label>
                                <select 
                                    name="procedencia" 
                                    value={formData.procedencia} 
                                    onChange={handleChange} 
                                    style={styles.select}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="ministerio de cultura">Ministerio de Cultura</option>
                                    <option value="donaciones">Donaciones</option>
                                    <option value="compra">Compra</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 7: ESTADO */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>⚡ Estado del Material</h2>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Estado Físico *</label>
                                <select 
                                    name="estado_libro" 
                                    value={formData.estado_libro} 
                                    onChange={handleChange} 
                                    required 
                                    style={styles.select}
                                >
                                    <option value="nuevo">Nuevo</option>
                                    <option value="normal">Normal</option>
                                    <option value="mal estado">Mal Estado</option>
                                </select>
                            </div>

                            {formData.estado_libro === 'mal estado' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Destino del Material *</label>
                                    <select 
                                        name="destino_mal_estado" 
                                        value={formData.destino_mal_estado} 
                                        onChange={handleChange} 
                                        style={styles.select} 
                                        required
                                    >
                                        <option value="aun en biblioteca">Aún en Biblioteca</option>
                                        <option value="descartado a biblioteca comunitaria">Descartado a Bib. Comunitaria</option>
                                    </select>
                                </div>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Estado Actual</label>
                                <select 
                                    name="estado_actual" 
                                    value={formData.estado_actual} 
                                    onChange={handleChange} 
                                    required 
                                    style={styles.select}
                                >
                                    <option value="en biblioteca">En Biblioteca</option>
                                    <option value="prestado">Prestado</option>
                                    <option value="perdido">Perdido</option>
                                    <option value="biblioteca comunitaria">Biblioteca Comunitaria</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div style={styles.actions}>
                        <button 
                            type="button" 
                            onClick={() => navigate('/libros')} 
                            style={{...styles.button, ...styles.buttonCancel}}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            style={{...styles.button, ...styles.buttonSubmit, opacity: saving ? 0.6 : 1}}
                            disabled={saving}
                        >
                            {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
    headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
    title: { fontSize: '32px', color: '#333', margin: 0 },
    toggleBtn: { 
        padding: '10px 20px', 
        backgroundColor: '#2196F3', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px'
    },
    backButton: { padding: '10px 20px', backgroundColor: '#2196F3', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    section: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e0e0e0' },
    sectionTitle: { fontSize: '22px', marginBottom: '20px', color: '#2196F3' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' },
    input: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', transition: 'border-color 0.3s' },
    textarea: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
    select: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
    helpText: { fontSize: '12px', color: '#666', marginTop: '4px' },
    actions: { display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' },
    button: { padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' },
    buttonCancel: { backgroundColor: '#9E9E9E', color: '#fff' },
    buttonSubmit: { backgroundColor: '#4CAF50', color: '#fff' },
};

export default EditarLibro;