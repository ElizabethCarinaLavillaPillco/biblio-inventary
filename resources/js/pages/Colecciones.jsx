import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const Colecciones = () => {
    const navigate = useNavigate();
    const [colecciones, setColecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [nombre, setNombre] = useState('');

    useEffect(() => {
        fetchColecciones();
    }, []);

    const fetchColecciones = async () => {
        try {
            const response = await axios.get('/colecciones');
            setColecciones(response.data.data);
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
                await axios.put(`/colecciones/${currentId}`, { nombre });
                Swal.fire('¡Actualizado!', 'Colección actualizada', 'success');
            } else {
                await axios.post('/colecciones', { nombre });
                Swal.fire('¡Registrado!', 'Colección creada', 'success');
            }
            fetchColecciones();
            resetForm();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        }
    };

    const handleEdit = (col) => {
        setEditMode(true);
        setCurrentId(col.id);
        setNombre(col.nombre);
        setShowModal(true);
    };

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: '¿Eliminar colección?',
            text: nombre,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/colecciones/${id}`);
                Swal.fire('¡Eliminado!', 'Colección eliminada', 'success');
                fetchColecciones();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message, 'error');
            }
        }
    };

    const handleVerLibros = (coleccionId) => {
        navigate(`/libros?coleccion_id=${coleccionId}`);
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
                <h1 style={styles.title}>📚 Colecciones</h1>
                <button onClick={() => setShowModal(true)} style={styles.btnAdd}>
                    ➕ Nueva Colección
                </button>
            </div>

            {loading ? (
                <div style={styles.loading}>Cargando...</div>
            ) : (
                <div style={styles.grid}>
                    {colecciones.map((col) => (
                        <div key={col.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>{col.nombre}</h3>
                                <div style={styles.badge}>{col.libros_count} libros</div>
                            </div>
                            <div style={styles.cardActions}>
                                <button onClick={() => handleVerLibros(col.id)} style={{...styles.btn, backgroundColor: '#2196F3'}}>
                                    📚 Ver Libros
                                </button>
                                <button onClick={() => handleEdit(col)} style={{...styles.btn, backgroundColor: '#FF9800'}}>
                                    ✏️ Editar
                                </button>
                                <button onClick={() => handleDelete(col.id, col.nombre)} style={{...styles.btn, backgroundColor: '#F44336'}}>
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
                        <h2>{editMode ? '✏️ Editar Colección' : '➕ Nueva Colección'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre de la colección"
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
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #9C27B0' },
    cardHeader: { marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: '18px', margin: 0, color: '#333' },
    badge: { padding: '4px 12px', backgroundColor: '#9C27B0', color: '#fff', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
    cardActions: { display: 'flex', gap: '10px' },
    btn: { padding: '8px 16px', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', minWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
    input: { width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '20px' },
    modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' }
};

export default Colecciones;
