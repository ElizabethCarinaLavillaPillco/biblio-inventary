import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [currentUserRol, setCurrentUserRol] = useState(null);
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
        rol: 'bibliotecario',
        activo: true
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('/usuarios');
            setUsuarios(response.data.usuarios.data || response.data.data);
            setCurrentUserRol(response.data.current_user_rol);
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
            if (error.response?.status === 403) {
                Swal.fire('Acceso Denegado', error.response.data.message, 'error');
            } else {
                Swal.fire('Error', error.response?.data?.message || error.response?.data?.errors?.email?.[0], 'error');
            }
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
            rol: usuario.rol,
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
        setFormData({ name: '', email: '', dni: '', telefono: '', password: '', rol: 'bibliotecario', activo: true });
        setEditMode(false);
        setCurrentId(null);
        setShowModal(false);
    };

    const isAdmin = currentUserRol === 'admin';

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>👥 Gestión de Usuarios</h1>
                {isAdmin && (
                    <button onClick={() => setShowModal(true)} style={styles.btnAdd}>
                        ➕ Nuevo Usuario
                    </button>
                )}
            </div>

            {!isAdmin && (
                <div style={styles.infoBox}>
                    ℹ️ Como bibliotecario, solo puedes editar tu propio perfil.
                </div>
            )}

            {loading ? (
                <div style={styles.loading}>Cargando...</div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.theadRow}>
                                <th style={styles.th}>Nombre</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>DNI</th>
                                <th style={styles.th}>Rol</th>
                                <th style={styles.th}>Registros</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((user) => (
                                <tr key={user.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.userName}>{user.name}</div>
                                        {user.creado_por && (
                                            <div style={styles.userMeta}>Creado por: {user.creado_por?.name}</div>
                                        )}
                                    </td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>{user.dni}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: user.rol === 'admin' ? '#9C27B0' : '#2196F3'
                                        }}>
                                            {user.rol === 'admin' ? '👑 Admin' : '📚 Bibliotecario'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.stats}>
                                            <span style={styles.stat}>{user.libros_registrados_count} libros</span>
                                            <span style={styles.stat}>{user.prestamos_realizados_count} préstamos</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {isAdmin ? (
                                            <label style={styles.toggleLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={user.activo}
                                                    onChange={() => toggleActivo(user.id)}
                                                    style={styles.checkbox}
                                                />
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: user.activo ? '#4CAF50' : '#F44336'
                                                }}>
                                                    {user.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </label>
                                        ) : (
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: user.activo ? '#4CAF50' : '#F44336'
                                            }}>
                                                {user.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                style={styles.btnEdit}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    style={styles.btnDelete}
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>
                            {editMode ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nombre completo *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>DNI (8 dígitos) *</label>
                                    <input
                                        type="text"
                                        value={formData.dni}
                                        onChange={(e) => setFormData({...formData, dni: e.target.value})}
                                        maxLength="8"
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                        style={styles.input}
                                    />
                                </div>

                                {isAdmin && (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Rol *</label>
                                        <select
                                            value={formData.rol}
                                            onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                            style={styles.select}
                                            required
                                        >
                                            <option value="bibliotecario">📚 Bibliotecario</option>
                                            <option value="admin">👑 Administrador</option>
                                        </select>
                                    </div>
                                )}

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        {editMode ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña *'}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        style={styles.input}
                                        required={!editMode}
                                        minLength="6"
                                    />
                                </div>
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={resetForm} style={styles.btnCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" style={styles.btnSubmit}>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '32px', margin: 0 },
    btnAdd: { padding: '12px 24px', backgroundColor: '#9C27B0', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    infoBox: { padding: '15px', backgroundColor: '#e3f2fd', border: '2px solid #2196F3', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#1976D2' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
    tableContainer: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    theadRow: { backgroundColor: '#f5f5f5' },
    th: { padding: '15px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #e0e0e0' },
    tr: { borderBottom: '1px solid #e0e0e0' },
    td: { padding: '15px' },
    userName: { fontWeight: '600', marginBottom: '4px' },
    userMeta: { fontSize: '12px', color: '#999' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff', display: 'inline-block' },
    stats: { display: 'flex', flexDirection: 'column', gap: '4px' },
    stat: { fontSize: '14px', color: '#666' },
    toggleLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
    statusBadge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff' },
    actions: { display: 'flex', gap: '8px' },
    btnEdit: { padding: '8px 12px', backgroundColor: '#FF9800', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnDelete: { padding: '8px 12px', backgroundColor: '#F44336', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', minWidth: '600px', maxHeight: '90vh', overflow: 'auto' },
    modalTitle: { marginBottom: '20px', fontSize: '24px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
    input: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px' },
    select: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' },
    modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
    btnCancel: { padding: '12px 24px', backgroundColor: '#9E9E9E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    btnSubmit: { padding: '12px 24px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
};

export default Usuarios;
