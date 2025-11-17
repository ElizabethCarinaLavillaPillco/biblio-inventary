// resources/js/pages/Ubicaciones.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const Ubicaciones = () => {
    const navigate = useNavigate();
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        anaquel: '',
        lado: '',
        nivel: 1,
        seccion: '',
        activo: true
    });

    useEffect(() => {
        fetchUbicaciones();
    }, []);

    const fetchUbicaciones = async () => {
        try {
            const response = await axios.get('/ubicaciones');
            setUbicaciones(response.data.data);
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
                await axios.put(`/ubicaciones/${currentId}`, formData);
                Swal.fire('¡Actualizado!', 'Ubicación actualizada', 'success');
            } else {
                await axios.post('/ubicaciones', formData);
                Swal.fire('¡Registrado!', 'Ubicación creada', 'success');
            }
            fetchUbicaciones();
            resetForm();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message, 'error');
        }
    };

    const handleEdit = (ubicacion) => {
        setEditMode(true);
        setCurrentId(ubicacion.id);
        setFormData({
            anaquel: ubicacion.anaquel,
            lado: ubicacion.lado,
            nivel: ubicacion.nivel,
            seccion: ubicacion.seccion,
            activo: ubicacion.activo
        });
        setShowModal(true);
    };

    const handleDelete = async (id, codigo) => {
        const result = await Swal.fire({
            title: '¿Eliminar ubicación?',
            text: `Ubicación: ${codigo}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/ubicaciones/${id}`);
                Swal.fire('¡Eliminado!', 'Ubicación eliminada', 'success');
                fetchUbicaciones();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message, 'error');
            }
        }
    };

    // ----- FUNCIÓN CORREGIDA -----
    const handleVerLibros = (ubicacionId) => {
        navigate(`/libros?ubicacion_id=${ubicacionId}`);
    };

    const resetForm = () => {
        setFormData({ anaquel: '', lado: '', nivel: 1, seccion: '', activo: true });
        setEditMode(false);
        setCurrentId(null);
        setShowModal(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📍 Ubicaciones</h1>
                <button onClick={() => setShowModal(true)} style={styles.btnAdd}>
                    ➕ Nueva Ubicación
                </button>
            </div>

            {loading ? (
                <div style={styles.loading}>Cargando...</div>
            ) : (
                <div style={styles.grid}>
                    {ubicaciones.map((ub) => (
                        <div key={ub.id} style={{...styles.card, opacity: ub.activo ? 1 : 0.6 }}>
                            <div style={styles.cardCode}>{ub.codigo}</div>
                            <div style={styles.cardDetails}>
                                <div>Anaquel: <strong>{ub.anaquel}</strong></div>
                                <div>Lado: <strong>{ub.lado === 'A' ? 'Izquierdo' : 'Derecho'}</strong></div>
                                <div>Nivel: <strong>{ub.nivel}°</strong></div>
                                <div>Sección: <strong>{ub.seccion}</strong></div>
                            </div>
                            <div style={styles.cardCount}>{ub.libros_count} libros</div>
                            <div style={styles.cardActions}>
                                {/* ----- LÍNEA CORREGIDA ----- */}
                                <button onClick={() => handleVerLibros(ub.id)} style={{...styles.btn, ...styles.btnView}}>
                                    📚 Ver Libros
                                </button>
                                <button onClick={() => handleEdit(ub)} style={{...styles.btn, ...styles.btnEdit}}>
                                    ✏️ Editar
                                </button>
                                <button onClick={() => handleDelete(ub.id, ub.codigo)} style={{...styles.btn, ...styles.btnDelete}}>
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h2>{editMode ? '✏️ Editar Ubicación' : '➕ Nueva Ubicación'}</h2>
                        <form onSubmit={handleSubmit}>
                            <select value={formData.anaquel} onChange={(e) => setFormData({...formData, anaquel: e.target.value})} style={styles.input} required>
                                <option value="">Anaquel</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                            <select value={formData.lado} onChange={(e) => setFormData({...formData, lado: e.target.value})} style={styles.input} required>
                                <option value="">Lado</option>
                                <option value="A">A (Izquierdo)</option>
                                <option value="B">B (Derecho)</option>
                            </select>
                            <input type="number" value={formData.nivel} onChange={(e) => setFormData({...formData, nivel: e.target.value})} placeholder="Nivel" min="1" style={styles.input} required />
                            <input type="text" value={formData.seccion} onChange={(e) => setFormData({...formData, seccion: e.target.value.toUpperCase()})} placeholder="Sección (A, B, C...)" maxLength="1" style={styles.input} required />
                            <div style={styles.modalActions}>
                                <button type="button" onClick={resetForm} style={{...styles.btn, ...styles.btnCancel}}>Cancelar</button>
                                <button type="submit" style={{...styles.btn, ...styles.btnSubmit}}>{editMode ? 'Actualizar' : 'Crear'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// He limpiado y organizado los estilos para mayor consistencia
const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '32px', margin: 0, color: '#333' },
    btnAdd: { padding: '12px 24px', backgroundColor: '#00BCD4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '3px solid #00BCD4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    cardCode: { fontSize: '24px', fontWeight: 'bold', color: '#00BCD4', marginBottom: '10px', textAlign: 'center' },
    cardDetails: { fontSize: '14px', color: '#666', marginBottom: '15px' },
    cardCount: { fontSize: '16px', fontWeight: '600', color: '#4CAF50', marginBottom: '15px', textAlign: 'center' },
    cardActions: { display: 'flex', gap: '8px' },
    btn: { padding: '8px 12px', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s' },
    btnView: { backgroundColor: '#2196F3', flex: 1 },
    btnEdit: { backgroundColor: '#FF9800', flex: 1 },
    btnDelete: { backgroundColor: '#F44336', flex: 1 },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', minWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
    input: { width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '15px', outline: 'none' },
    modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
    btnCancel: { backgroundColor: '#9E9E9E' },
    btnSubmit: { backgroundColor: '#4CAF50' },
};

export default Ubicaciones;