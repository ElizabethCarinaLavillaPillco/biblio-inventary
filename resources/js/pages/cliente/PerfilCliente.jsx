import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUser, FaEnvelope, FaIdCard, FaPhone, FaMapMarkerAlt, FaCalendar, FaEdit, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const PerfilCliente = ({ cliente: clienteProp, onUpdateCliente }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [cliente, setCliente] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (clienteProp) {
            setCliente(clienteProp);
            setFormData({
                nombres: clienteProp.nombres || '',
                apellidos: clienteProp.apellidos || '',
                email: clienteProp.email || '',
                telefono: clienteProp.telefono || '',
                domicilio: clienteProp.domicilio || '',
                distrito: clienteProp.distrito || '',
                provincia: clienteProp.provincia || '',
            });
        } else {
            fetchPerfil();
        }
    }, [clienteProp]);

    const fetchPerfil = async () => {
        try {
            const response = await axios.get('/cliente/perfil');
            setCliente(response.data);
            setFormData({
                nombres: response.data.nombres || '',
                apellidos: response.data.apellidos || '',
                email: response.data.email || '',
                telefono: response.data.telefono || '',
                domicilio: response.data.domicilio || '',
                distrito: response.data.distrito || '',
                provincia: response.data.provincia || '',
            });
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            Swal.fire('Error', 'No se pudo cargar tu perfil', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put('/cliente/perfil', formData);
            setCliente(response.data.cliente);
            
            if (onUpdateCliente) {
                onUpdateCliente(response.data.cliente);
            }

            Swal.fire({
                icon: 'success',
                title: '¡Perfil actualizado!',
                text: 'Tus datos han sido actualizados correctamente',
                timer: 2000,
                showConfirmButton: false
            });
            
            setEditMode(false);
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            nombres: cliente.nombres || '',
            apellidos: cliente.apellidos || '',
            email: cliente.email || '',
            telefono: cliente.telefono || '',
            domicilio: cliente.domicilio || '',
            distrito: cliente.distrito || '',
            provincia: cliente.provincia || '',
        });
        setEditMode(false);
    };

    if (!cliente) {
        return <div style={styles.loading}>Cargando perfil...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Mi Perfil</h1>
                {!editMode && (
                    <button onClick={() => setEditMode(true)} style={styles.btnEdit}>
                        <FaEdit /> Editar Perfil
                    </button>
                )}
            </div>

            {/* Advertencia de sanción */}
            {cliente.sancionado && (
                <div style={styles.warningCard}>
                    <FaExclamationTriangle style={styles.warningIcon} />
                    <div>
                        <div style={styles.warningTitle}>Cuenta Sancionada</div>
                        <div style={styles.warningText}>
                            No puedes hacer reservas hasta: {new Date(cliente.fecha_fin_sancion).toLocaleDateString()}
                        </div>
                        {cliente.motivo_sancion && (
                            <div style={styles.warningText}>
                                Motivo: {cliente.motivo_sancion}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Estado de cuenta */}
            <div style={styles.statusCard}>
                <div style={styles.statusItem}>
                    <div style={styles.statusLabel}>Estado</div>
                    <div style={{
                        ...styles.statusBadge,
                        backgroundColor: cliente.activo ? '#4CAF50' : '#F44336'
                    }}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                    </div>
                </div>
                <div style={styles.statusItem}>
                    <div style={styles.statusLabel}>Préstamos Activos</div>
                    <div style={styles.statusValue}>{cliente.prestamos_activos_count || 0} / 3</div>
                </div>
                <div style={styles.statusItem}>
                    <div style={styles.statusLabel}>Reservas Pendientes</div>
                    <div style={styles.statusValue}>{cliente.reservas_pendientes_count || 0}</div>
                </div>
            </div>

            {/* Formulario de perfil */}
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Datos Personales</h2>
                    
                    <div style={styles.grid}>
                        <InfoField
                            icon={<FaUser />}
                            label="Nombres"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleChange}
                            editMode={editMode}
                            required
                        />
                        
                        <InfoField
                            icon={<FaUser />}
                            label="Apellidos"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            editMode={editMode}
                            required
                        />
                        
                        <InfoField
                            icon={<FaIdCard />}
                            label="DNI"
                            value={cliente.dni}
                            editMode={false}
                            disabled
                        />
                        
                        <InfoField
                            icon={<FaCalendar />}
                            label="Fecha de Nacimiento"
                            value={new Date(cliente.fecha_nacimiento).toLocaleDateString()}
                            editMode={false}
                            disabled
                        />
                        
                        <InfoField
                            icon={<FaCalendar />}
                            label="Edad"
                            value={`${cliente.edad} años`}
                            editMode={false}
                            disabled
                        />
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Datos de Contacto</h2>
                    
                    <div style={styles.grid}>
                        <InfoField
                            icon={<FaEnvelope />}
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            editMode={editMode}
                            type="email"
                            required
                        />
                        
                        <InfoField
                            icon={<FaPhone />}
                            label="Teléfono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            editMode={editMode}
                            required
                        />
                    </div>
                    
                    <InfoField
                        icon={<FaMapMarkerAlt />}
                        label="Domicilio"
                        name="domicilio"
                        value={formData.domicilio}
                        onChange={handleChange}
                        editMode={editMode}
                        required
                        fullWidth
                    />
                    
                    <div style={styles.grid}>
                        <InfoField
                            icon={<FaMapMarkerAlt />}
                            label="Distrito"
                            name="distrito"
                            value={formData.distrito}
                            onChange={handleChange}
                            editMode={editMode}
                        />
                        
                        <InfoField
                            icon={<FaMapMarkerAlt />}
                            label="Provincia"
                            name="provincia"
                            value={formData.provincia}
                            onChange={handleChange}
                            editMode={editMode}
                        />
                    </div>
                </div>

                {editMode && (
                    <div style={styles.actions}>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            style={styles.btnCancel}
                        >
                            <FaTimes /> Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.btnSave,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FaSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                )}
            </form>

            {/* Información de cuenta */}
            <div style={styles.accountInfo}>
                <div style={styles.infoItem}>
                    <strong>Miembro desde:</strong> {new Date(cliente.created_at).toLocaleDateString()}
                </div>
                <div style={styles.infoItem}>
                    <strong>ID de Cliente:</strong> #{cliente.id}
                </div>
            </div>
        </div>
    );
};

const InfoField = ({ icon, label, name, value, onChange, editMode, disabled, type = 'text', required, fullWidth }) => (
    <div style={{ ...styles.infoField, gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
        <label style={styles.fieldLabel}>
            {icon} {label} {required && editMode && <span style={{ color: '#F44336' }}>*</span>}
        </label>
        {editMode && !disabled ? (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                style={styles.fieldInput}
                required={required}
            />
        ) : (
            <div style={styles.fieldValue}>{value || 'No especificado'}</div>
        )}
    </div>
);

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
    },
    loading: {
        textAlign: 'center',
        padding: '100px 20px',
        fontSize: '18px',
        color: '#666',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    title: {
        fontSize: '32px',
        color: '#333',
        margin: 0,
    },
    btnEdit: {
        padding: '12px 24px',
        backgroundColor: '#2196F3',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s',
    },
    warningCard: {
        backgroundColor: '#FFF3E0',
        border: '2px solid #FF9800',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        gap: '15px',
        alignItems: 'flex-start',
    },
    warningIcon: {
        fontSize: '32px',
        color: '#FF9800',
    },
    warningTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#E65100',
        marginBottom: '8px',
    },
    warningText: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '5px',
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    statusItem: {
        textAlign: 'center',
    },
    statusLabel: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px',
    },
    statusValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2196F3',
    },
    statusBadge: {
        display: 'inline-block',
        padding: '8px 16px',
        borderRadius: '20px',
        color: '#fff',
        fontWeight: '600',
        fontSize: '14px',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
    },
    section: {
        marginBottom: '30px',
        paddingBottom: '30px',
        borderBottom: '1px solid #e0e0e0',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '20px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    infoField: {
        display: 'flex',
        flexDirection: 'column',
    },
    fieldLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#555',
        marginBottom: '8px',
    },
    fieldInput: {
        padding: '12px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    fieldValue: {
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        color: '#333',
    },
    actions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
        marginTop: '20px',
    },
    btnCancel: {
        padding: '12px 24px',
        backgroundColor: '#9E9E9E',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s',
    },
    btnSave: {
        padding: '12px 24px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s',
    },
    accountInfo: {
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '20px',
    },
    infoItem: {
        fontSize: '14px',
        color: '#666',
    },
};

export default PerfilCliente;