// resources/js/pages/RegistrarLibro.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const RegistrarLibro = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [autoresSugeridos, setAutoresSugeridos] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        autor_nombre: '',
        autor_id: '',
        categoria_id: '',
        precio: '',
        numero_paginas: '',
        editorial: '',
        tamanio: '',
        color_forro: '',
        procedencia: '',
        estado_libro: 'normal',
        destino_mal_estado: 'n/a',
        estado_actual: 'en biblioteca',
    });

    // --- ESTADO Y FUNCIONES PARA UBICACIÓN (AÑADIDAS) ---
    const [ubicacionParts, setUbicacionParts] = useState({
        anaquel: '',
        lado: '',
        nivel: '',
        seccion: '',
    });
    const [ubicacionId, setUbicacionId] = useState('');

    const findOrCreateUbicacion = async (parts) => {
        if (!parts.anaquel || !parts.lado || !parts.nivel || !parts.seccion) {
            setUbicacionId('');
            return;
        }

        const existente = ubicaciones.find(ub =>
            ub.anaquel === parts.anaquel &&
            ub.lado === parts.lado &&
            ub.nivel == parts.nivel &&
            ub.seccion === parts.seccion
        );

        if (existente) {
            setUbicacionId(existente.id);
            return;
        }

        const result = await Swal.fire({
            title: '¿Crear Nueva Ubicación?',
            html: `No se encontró una ubicación para:<br>
                   <strong>Anaquel ${parts.anaquel} | Lado ${parts.lado} | Nivel ${parts.nivel} | Sección ${parts.seccion}</strong><br>
                   ¿Deseas crearla automáticamente?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            confirmButtonText: 'Sí, crear',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.post('/ubicaciones', {
                    ...parts,
                    nivel: parseInt(parts.nivel, 10),
                    activo: true
                });
                const nuevaUbicacion = response.data.ubicacion;
                setUbicacionId(nuevaUbicacion.id);
                setUbicaciones(prev => [...prev, nuevaUbicacion]);
                Swal.fire('¡Creada!', 'La nueva ubicación ha sido registrada.', 'success');
            } catch (error) {
                console.error('Error al crear ubicación:', error);
                Swal.fire('Error', 'No se pudo crear la ubicación.', 'error');
                setUbicacionId('');
            }
        } else {
            setUbicacionId('');
        }
    };

    const handleUbicacionChange = (e) => {
        const { name, value } = e.target;
        // <-- CAMBIO 1: Convertir a mayúsculas si el campo es 'seccion'
        const processedValue = name === 'seccion' ? value.toUpperCase() : value;

        const newParts = { ...ubicacionParts, [name]: processedValue };
        setUbicacionParts(newParts);
        findOrCreateUbicacion(newParts);
    };
    // --- FIN DE LA LÓGICA DE UBICACIÓN ---


    useEffect(() => {
        fetchCategorias();
        fetchUbicaciones();
    }, []);

    const fetchCategorias = async () => {
        try {
            const response = await axios.get('/categorias/all');
            setCategorias(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
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

    const buscarAutores = async (query) => {
        if (query.length < 2) {
            setAutoresSugeridos([]);
            setMostrarSugerencias(false);
            return;
        }

        try {
            const response = await axios.get('/autores/search', {
                params: { q: query }
            });
            setAutoresSugeridos(response.data);
            setMostrarSugerencias(true);
        } catch (error) {
            console.error('Error al buscar autores:', error);
        }
    };

    const seleccionarAutor = (autor) => {
        setFormData({
            ...formData,
            autor_nombre: autor.nombre,
            autor_id: autor.id
        });
        setMostrarSugerencias(false);
    };

    const handleAutorChange = (e) => {
        const valor = e.target.value;
        setFormData({
            ...formData,
            autor_nombre: valor,
            autor_id: ''
        });
        buscarAutores(valor);
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
            setUbicacionId(''); // Limpiar ubicación si se descarta
        }

        setFormData({ ...formData, ...updates });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.titulo || !formData.autor_nombre || !formData.categoria_id) {
            Swal.fire('Error', 'Por favor completa los campos obligatorios (Título, Autor, Categoría)', 'error');
            return;
        }

        setLoading(true);

        try {
            let autorId = formData.autor_id;
            if (!autorId && formData.autor_nombre) {
                const autorResponse = await axios.post('/autores', {
                    nombre: formData.autor_nombre
                });
                autorId = autorResponse.data.autor.id;
            }

            const dataToSend = {
                ...formData,
                autor_id: autorId,
                precio: formData.precio || null,
                numero_paginas: formData.numero_paginas || null,
                ubicacion_id: ubicacionId || null, // <-- USAR EL ID CORRECTO
            };

            delete dataToSend.autor_nombre;

            await axios.post('/libros', dataToSend);

            Swal.fire({
                icon: 'success',
                title: '¡Libro registrado!',
                text: 'El libro ha sido registrado exitosamente',
                confirmButtonColor: '#4CAF50'
            });

            navigate('/libros');
        } catch (error) {
            console.error('Error al registrar:', error);
            Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar el libro', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>➕ Registrar Nuevo Libro</h1>

            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Información Principal */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📖 Información Principal</h2>
                    <div style={styles.grid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Título *</label>
                            <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} style={styles.input} required />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Autor *</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" value={formData.autor_nombre} onChange={handleAutorChange} onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)} style={styles.input} placeholder="Escribe el nombre del autor..." required />
                                {mostrarSugerencias && autoresSugeridos.length > 0 && (
                                    <div style={styles.suggestions}>
                                        {autoresSugeridos.map((autor) => (
                                            <div key={autor.id} style={styles.suggestionItem} onClick={() => seleccionarAutor(autor)}>{autor.nombre}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Categoría *</label>
                            <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} style={styles.select} required>
                                <option value="">Selecciona una categoría</option>
                                {categorias.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nombre}</option>))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Precio (S/.)</label>
                            <input type="number" name="precio" value={formData.precio} onChange={handleChange} style={styles.input} step="0.01" min="0" />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE UBICACIÓN CORREGIDA */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📍 Ubicación</h2>
                    <div style={styles.grid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Anaquel</label>
                            <select name="anaquel" value={ubicacionParts.anaquel} onChange={handleUbicacionChange} style={styles.select}>
                                <option value="">Seleccionar...</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Lado</label>
                            <select name="lado" value={ubicacionParts.lado} onChange={handleUbicacionChange} style={styles.select}>
                                <option value="">Seleccionar...</option>
                                <option value="A">A (Izquierdo)</option>
                                <option value="B">B (Derecho)</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nivel</label>
                            <input type="number" name="nivel" value={ubicacionParts.nivel} onChange={handleUbicacionChange} style={styles.input} min="1" placeholder="Ej: 1, 2, 3..." />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Sección</label>
                            {/* <-- CAMBIO 2: Añadir estilo para mostrar mayúsculas en el input */}
                            <input
                                type="text"
                                name="seccion"
                                value={ubicacionParts.seccion}
                                onChange={handleUbicacionChange}
                                style={{...styles.input, textTransform: 'uppercase'}}
                                maxLength="1"
                                placeholder="Ej: A, B, C..."
                            />
                        </div>
                    </div>
                    {ubicacionId && (
                        <div style={styles.ubicacionInfo}>
                            ✅ Ubicación seleccionada: <strong>{ubicaciones.find(ub => ub.id === ubicacionId)?.codigo}</strong>
                        </div>
                    )}
                </div>

                {/* Características Físicas */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📐 Características Físicas</h2>
                    <div style={styles.grid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Número de Páginas</label>
                            <input type="number" name="numero_paginas" value={formData.numero_paginas} onChange={handleChange} style={styles.input} min="1" />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Editorial</label>
                            <input type="text" name="editorial" value={formData.editorial} onChange={handleChange} style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tamaño</label>
                            <select name="tamanio" value={formData.tamanio} onChange={handleChange} style={styles.select}>
                                <option value="">Seleccionar...</option>
                                <option value="pequeño">Pequeño</option>
                                <option value="mediano">Mediano</option>
                                <option value="grande">Grande</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Color de Forro</label>
                            <input type="text" name="color_forro" value={formData.color_forro} onChange={handleChange} style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Procedencia</label>
                            <select name="procedencia" value={formData.procedencia} onChange={handleChange} style={styles.select}>
                                <option value="">Seleccionar...</option>
                                <option value="ministerio de cultura">Ministerio de Cultura</option>
                                <option value="donaciones">Donaciones</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Estado del Libro *</label>
                            <select name="estado_libro" value={formData.estado_libro} onChange={handleChange} style={styles.select} required>
                                <option value="nuevo">Nuevo</option>
                                <option value="normal">Normal</option>
                                <option value="mal estado">Mal Estado</option>
                            </select>
                        </div>

                        {formData.estado_libro === 'mal estado' && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Destino del Libro *</label>
                                <select name="destino_mal_estado" value={formData.destino_mal_estado} onChange={handleChange} style={styles.select} required>
                                    <option value="aun en biblioteca">Aún en Biblioteca</option>
                                    <option value="descartado a biblioteca comunitaria">Descartado a Bib. Comunitaria</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones */}
                <div style={styles.actions}>
                    <button type="button" onClick={() => navigate('/libros')} style={{...styles.btn, ...styles.btnCancel}}>Cancelar</button>
                    <button type="submit" disabled={loading} style={{...styles.btn, ...styles.btnSubmit}}>{loading ? 'Registrando...' : '✅ Registrar Libro'}</button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1200px' },
    title: { fontSize: '32px', marginBottom: '30px', color: '#333' },
    form: { backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    section: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e0e0e0' },
    sectionTitle: { fontSize: '22px', marginBottom: '20px', color: '#2196F3' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' },
    input: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', transition: 'border-color 0.3s' },
    select: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
    suggestions: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '2px solid #2196F3', borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    suggestionItem: { padding: '12px', cursor: 'pointer', borderBottom: '1px solid #e0e0e0', transition: 'background-color 0.2s' },
    actions: { display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' },
    btn: { padding: '14px 30px', fontSize: '16px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s' },
    btnCancel: { backgroundColor: '#9E9E9E', color: '#fff' },
    btnSubmit: { backgroundColor: '#4CAF50', color: '#fff' },
    ubicacionInfo: { marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', border: '1px solid #4CAF50', borderRadius: '8px', fontSize: '14px', color: '#2e7d32' },
};

export default RegistrarLibro;
