import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './bootstrap';

const root = document.getElementById('app');

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </React.StrictMode>
    );
} else {
    console.error("No se encontró el elemento #app en el DOM");
}
