import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import Swal from 'sweetalert2';

const Autores = () => {
    const navigate = useNavigate();
    const [autores, setAutores] = useState([]);
    const [search, setSearch] = useState('');

    const handleVerLibros = (autorId) => {
        navigate(`/libros?autor_id=${autorId}`);
    };

    useEffect(() => {
        fetchAutores();
    }, [search]);

    const fetchAutores = async () => {
        const response = await axios.get('/autores', { params: { search } });
        setAutores(response.data.data);
    };

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: '¿Eliminar autor?',
            text: nombre,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`/autores/${id}`);
                Swal.fire('¡Eliminado!', 'Autor eliminado', 'success');
                fetchAutores();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message, 'error');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>✍️ Autores</h1>
            <input
                type="text"
                placeholder="🔍 Buscar autor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', maxWidth: '500px', padding: '12px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '20px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {autores.map((autor) => (
                    <div key={autor.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #FF5722' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{autor.nombre}</div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{autor.libros_count} libros</div>
                        <button onClick={() => handleVerLibros(autor.id)} style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer',marginRight:'10px' }}>📚 Ver </button>
                        <button onClick={() => handleDelete(autor.id, autor.nombre)} style={{ padding: '8px 16px', backgroundColor: '#F44336', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Eliminar</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Autores;
