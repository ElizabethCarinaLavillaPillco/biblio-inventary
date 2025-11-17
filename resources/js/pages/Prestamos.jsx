import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Prestamos = () => {
    const [prestamos, setPrestamos] = useState([]);

    useEffect(() => {
        fetchPrestamos();
    }, []);

    const fetchPrestamos = async () => {
        const response = await axios.get('/prestamos');
        setPrestamos(response.data.data);
    };

    const marcarDevuelto = async (id) => {
        const result = await Swal.fire({
            title: 'Marcar como devuelto?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50'
        });
        if (result.isConfirmed) {
            await axios.put(`/prestamos/${id}/devuelto`);
            Swal.fire('¡Devuelto!', 'Libro marcado como devuelto', 'success');
            fetchPrestamos();
        }
    };

    const marcarPerdido = async (id) => {
        const result = await Swal.fire({
            title: 'Marcar como perdido?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336'
        });
        if (result.isConfirmed) {
            await axios.put(`/prestamos/${id}/perdido`);
            Swal.fire('Marcado como perdido', '', 'info');
            fetchPrestamos();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>📋 Préstamos Activos</h1>
            <div style={{ display: 'grid', gap: '15px' }}>
                {prestamos.map((p) => (
                    <div key={p.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #FFC107' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '18px' }}>{p.libro?.titulo}</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>{p.libro?.autor?.nombre}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: '600' }}>{p.nombres} {p.apellidos}</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>DNI: {p.dni} • {p.telefono}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '14px' }}>Inicio: {new Date(p.fecha_inicio).toLocaleDateString()}</div>
                                <div style={{ fontSize: '14px' }}>Fin: {new Date(p.fecha_fin).toLocaleDateString()}</div>
                                <div style={{ fontSize: '12px', color: '#FF9800', fontWeight: '600' }}>{p.tipo_prestamo}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => marcarDevuelto(p.id)} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✅ Devuelto</button>
                                <button onClick={() => marcarPerdido(p.id)} style={{ padding: '10px 20px', backgroundColor: '#F44336', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>❌ Perdido</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Prestamos;
