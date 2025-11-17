import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- IMPORTA useNavigate
import axios from 'axios';
import Swal from 'sweetalert2';

const Categorias = () => {
    const navigate = useNavigate(); 
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [nombre, setNombre] = useState('');

    useEffect(() => {
        fetchCategorias();
    }, []);

    const handleVerLibros = (categoriaId) => {
        navigate(`/libros?categoria_id=${categoriaId}`);
    };

    const fetchCategorias = async () => {
        try {
            const response = await axios.get('/categorias');
            setCategorias(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`/categorias/${currentId}`, { nombre });
                Swal.fire('¡Actualizado!', 'Categoría actualizada', 'success');
            } else {
                await axios.post('/categorias', { nombre });
                Swal.fire('¡Registrado!', 'Categoría creada', 'success');
            }
            fetchCategorias();
            resetForm();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        }
    };

    const handleEdit = (cat) => {
        setEditMode(true);
        setCurrentId(cat.id);
        setNombre(cat.nombre);
        setShowModal(true);
    };

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: '¿Eliminar categoría?',
            text: nombre,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/categorias/${id}`);
                Swal.fire('¡Eliminado!', 'Categoría eliminada', 'success');
                fetchCategorias();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message, 'error');
            }
        }
    };

    const resetForm = () => {
        setNombre('');
        setEditMode(false);
        setCurrentId(null);
        setShowModal(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🏷️ Categorías</h1>
                <button onClick={() => setShowModal(true)} style={styles.btnAdd}>
                    ➕ Nueva Categoría
                </button>
            </div>

            {loading ? (
                <div style={styles.loading}>Cargando...</div>
            ) : (
                <div style={styles.grid}>
                    {categorias.map((cat) => (
                        <div key={cat.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>{cat.nombre}</h3>
                                <div style={styles.badge}>{cat.libros_count} libros</div>
                            </div>
                            <div style={styles.cardActions}>
                                <button onClick={() => handleVerLibros(cat.id)} style={{...styles.btn, backgroundColor: '#2196F3'}}> {/* NUEVO BOTÓN */}
                                    📚 Ver Libros
                                </button>
                                <button onClick={() => handleEdit(cat)} style={{...styles.btn, backgroundColor: '#FF9800'}}>
                                    ✏️ Editar
                                </button>
                                <button onClick={() => handleDelete(cat.id, cat.nombre)} style={{...styles.btn, backgroundColor: '#F44336'}}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h2>{editMode ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre de la categoría"
                                style={styles.input}
                                required
                                autoFocus
                            />
                            <div style={styles.modalActions}>
                                <button type="button" onClick={resetForm} style={{...styles.btn, backgroundColor: '#9E9E9E'}}>
                                    Cancelar
                                </button>
                                <button type="submit" style={{...styles.btn, backgroundColor: '#4CAF50'}}>
                                    {editMode ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '32px', margin: 0 },
    btnAdd: { padding: '12px 24px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #FFEB3B' },
    cardHeader: { marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: '18px', margin: 0, color: '#333' },
    badge: { padding: '4px 12px', backgroundColor: '#FFEB3B', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
    cardActions: { display: 'flex', gap: '10px' },
    btn: { padding: '8px 16px', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', minWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
    input: { width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '20px' },
    modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' }
};

export default Categorias;
