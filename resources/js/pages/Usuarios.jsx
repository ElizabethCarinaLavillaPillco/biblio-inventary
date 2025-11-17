import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dni: '',
        telefono: '',
        password: '',
        activo: true
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('/usuarios');
            setUsuarios(response.data.data);
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
                await axios.put(`/usuarios/${currentId}`, formData);
                Swal.fire('¡Actualizado!', 'Usuario actualizado', 'success');
            } else {
                await axios.post('/usuarios', formData);
                Swal.fire('¡Registrado!', 'Usuario creado exitosamente', 'success');
            }
            fetchUsuarios();
            resetForm();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || error.response?.data?.errors?.email?.[0], 'error');
        }
    };

    const handleEdit = (usuario) => {
        setEditMode(true);
        setCurrentId(usuario.id);
        setFormData({
            name: usuario.name,
            email: usuario.email,
            dni: usuario.dni,
            telefono: usuario.telefono || '',
            password: '',
            activo: usuario.activo
        });
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: '¿Eliminar usuario?',
            text: name,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/usuarios/${id}`);
                Swal.fire('¡Eliminado!', 'Usuario eliminado', 'success');
                fetchUsuarios();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message, 'error');
            }
        }
    };

    const toggleActivo = async (id) => {
        try {
            await axios.put(`/usuarios/${id}/toggle-activo`);
            fetchUsuarios();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message, 'error');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', dni: '', telefono: '', password: '', activo: true });
        setEditMode(false);
        setCurrentId(null);
        setShowModal(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>👥 Gestión de Usuarios</h1>
                <button onClick={() => setShowModal(true)} style={{ padding: '12px 24px', backgroundColor: '#9C27B0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    ➕ Nuevo Usuario
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>
            ) : (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Nombre</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>DNI</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Teléfono</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Registros</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: '600', color: '#333' }}>{user.name}</div>
                                        {user.creado_por && (
                                            <div style={{ fontSize: '12px', color: '#999' }}>Creado por: {user.creado_por?.name}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px', color: '#666' }}>{user.email}</td>
                                    <td style={{ padding: '15px', color: '#666' }}>{user.dni}</td>
                                    <td style={{ padding: '15px', color: '#666' }}>{user.telefono || 'N/A'}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '14px', color: '#2196F3', fontWeight: '600' }}>
                                            {user.libros_registrados_count} libros
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#FF9800', fontWeight: '600' }}>
                                            {user.prestamos_realizados_count} préstamos
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={user.activo}
                                                onChange={() => toggleActivo(user.id)}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                            <span style={{ marginLeft: '8px', color: user.activo ? '#4CAF50' : '#F44336', fontWeight: '600' }}>
                                                {user.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </label>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => handleEdit(user)} style={{ padding: '8px 12px', backgroundColor: '#FF9800', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️</button>
                                            <button onClick={() => handleDelete(user.id, user.name)} style={{ padding: '8px 12px', backgroundColor: '#F44336', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', minWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2>{editMode ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nombre completo" style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }} required />
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email" style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }} required />
                            <input type="text" value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} placeholder="DNI (8 dígitos)" maxLength="8" style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }} required />
                            <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} placeholder="Teléfono (opcional)" style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }} />
                            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editMode ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'} style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '2px solid #e0e0e0', borderRadius: '8px' }} required={!editMode} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#9E9E9E', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{editMode ? 'Actualizar' : 'Crear'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
