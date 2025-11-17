// resources/js/pages/RegistrarPrestamo.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const RegistrarPrestamo = () => {
    const { libroId } = useParams();
    const navigate = useNavigate();
    const [libro, setLibro] = useState(null);
    const [formData, setFormData] = useState({
        libro_id: libroId,
        nombres: '',
        apellidos: '',
        dni: '',
        fecha_nacimiento: '',
        telefono: '',
        domicilio: '',
        fecha_inicio: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
        fecha_fin: '',
        garantia: '',
        tipo_prestamo: 'a domicilio'
    });

    useEffect(() => {
        fetchLibro();
    }, []);

    const fetchLibro = async () => {
        try {
            const response = await axios.get(`/libros/${libroId}`);
            setLibro(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar la información del libro', 'error');
            navigate('/libros');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/prestamos', formData);
            Swal.fire('¡Préstamo registrado!', 'El préstamo ha sido registrado exitosamente.', 'success');
            navigate('/prestamos');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar el préstamo', 'error');
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>📤 Registrar Préstamo</h1>
            
            {libro && (
                <div style={styles.bookInfo}>
                    <h3 style={styles.bookTitle}>{libro.titulo}</h3>
                    <p style={styles.bookDetails}>{libro.autor?.nombre} • {libro.categoria?.nombre}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <h4 style={styles.sectionTitle}>Datos del Solicitante</h4>
                <div style={styles.grid}>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="nombres">Nombres</label>
                        <input id="nombres" type="text" name="nombres" value={formData.nombres} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="apellidos">Apellidos</label>
                        <input id="apellidos" type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="dni">DNI</label>
                        <input id="dni" type="text" name="dni" value={formData.dni} onChange={handleChange} maxLength="8" style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                        <input id="fecha_nacimiento" type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="telefono">Teléfono</label>
                        <input id="telefono" type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="domicilio">Domicilio</label>
                        <input id="domicilio" type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} style={styles.input} required />
                    </div>
                </div>

                <h4 style={styles.sectionTitle}>Detalles del Préstamo</h4>
                <div style={styles.grid}>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="fecha_inicio">Fecha de Inicio</label>
                        <input id="fecha_inicio" type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="fecha_fin">Fecha de Devolución</label>
                        <input id="fecha_fin" type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="garantia">Garantía Dejada</label>
                        <input id="garantia" type="text" name="garantia" value={formData.garantia} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="tipo_prestamo">Tipo de Préstamo</label>
                        <select id="tipo_prestamo" name="tipo_prestamo" value={formData.tipo_prestamo} onChange={handleChange} style={styles.select} required>
                            <option value="a domicilio">A Domicilio</option>
                            <option value="en biblioteca">En Biblioteca</option>
                        </select>
                    </div>
                </div>

                <div style={styles.actions}>
                    <button type="button" onClick={() => navigate(`/libros/ver/${libroId}`)} style={{...styles.button, ...styles.buttonCancel}}>Cancelar</button>
                    <button type="submit" style={{...styles.button, ...styles.buttonSubmit}}>✅ Registrar Préstamo</button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
    title: { fontSize: '32px', marginBottom: '20px', color: '#333' },
    bookInfo: { backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #2196F3' },
    bookTitle: { margin: '0 0 5px 0', fontSize: '20px', color: '#2196F3' },
    bookDetails: { margin: 0, color: '#555' },
    form: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    sectionTitle: { fontSize: '18px', color: '#333', borderBottom: '2px solid #e0e0e0', paddingBottom: '5px', marginTop: '30px', marginBottom: '15px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' },
    input: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', transition: 'border-color 0.3s' },
    select: { padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
    actions: { display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' },
    button: { padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' },
    buttonCancel: { backgroundColor: '#9E9E9E', color: '#fff' },
    buttonSubmit: { backgroundColor: '#4CAF50', color: '#fff' },
};

export default RegistrarPrestamo;