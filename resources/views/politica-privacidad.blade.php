<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidad - Biblioteca Municipal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
            border-radius: 15px;
            margin-bottom: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .content {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        h2 {
            color: #667eea;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        h3 {
            color: #764ba2;
            font-size: 1.3em;
            margin: 25px 0 15px 0;
        }
        ul {
            margin-left: 30px;
            margin-bottom: 20px;
        }
        li {
            margin-bottom: 10px;
        }
        .info-box {
            background: #e3f2fd;
            padding: 20px;
            border-left: 5px solid #2196F3;
            margin: 20px 0;
            border-radius: 5px;
        }
        .warning-box {
            background: #fff3e0;
            padding: 20px;
            border-left: 5px solid #FF9800;
            margin: 20px 0;
            border-radius: 5px;
        }
        .contact-box {
            background: #f3e5f5;
            padding: 30px;
            border-radius: 10px;
            margin-top: 40px;
        }
        .footer {
            text-align: center;
            padding: 30px;
            color: #666;
            font-size: 0.9em;
        }
        .btn-back {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            transition: all 0.3s;
        }
        .btn-back:hover {
            background: #764ba2;
            transform: translateY(-2px);
        }
        @media print {
            .btn-back { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Política de Privacidad y Protección de Datos</h1>
            <p>Sistema BiblioSystem - Biblioteca Municipal</p>
            <p><small>Última actualización: {{ date('d/m/Y') }}</small></p>
        </div>

        <div class="content">
            <div class="section">
                <h2>1. Marco Legal</h2>
                <p>Este documento se elabora en cumplimiento de:</p>
                <ul>
                    <li><strong>Ley N° 29733</strong> - Ley de Protección de Datos Personales</li>
                    <li><strong>Decreto Supremo N° 003-2013-JUS</strong> - Reglamento de la Ley N° 29733</li>
                    <li><strong>Ley N° 30034</strong> - Ley del Sistema Nacional de Bibliotecas</li>
                    <li><strong>Decreto Supremo N° 002-2014-MC</strong> - Reglamento de la Ley N° 30034</li>
                </ul>
            </div>

            <div class="section">
                <h2>2. Identificación del Responsable</h2>
                <div class="info-box">
                    <p><strong>Denominación:</strong> {{ env('BIBLIOTECA_NOMBRE', 'Biblioteca Municipal') }}</p>
                    <p><strong>Dirección:</strong> {{ env('BIBLIOTECA_DIRECCION', '[Dirección]') }}</p>
                    <p><strong>Teléfono:</strong> {{ env('BIBLIOTECA_TELEFONO', '[Teléfono]') }}</p>
                    <p><strong>Email:</strong> {{ env('BIBLIOTECA_EMAIL', '[Email]') }}</p>
                </div>
            </div>

            <div class="section">
                <h2>3. Finalidad del Tratamiento de Datos</h2>
                <p>Los datos personales recopilados serán utilizados exclusivamente para:</p>

                <h3>3.1 Gestión de la colección bibliográfica</h3>
                <ul>
                    <li>Registro y catalogación de libros</li>
                    <li>Control de inventario</li>
                    <li>Estadísticas de uso</li>
                </ul>

                <h3>3.2 Servicios de préstamo</h3>
                <ul>
                    <li>Registro de usuarios</li>
                    <li>Control de préstamos y devoluciones</li>
                    <li>Gestión de sanciones por pérdida o daño</li>
                </ul>

                <h3>3.3 Cumplimiento legal</h3>
                <ul>
                    <li>Reportes estadísticos a la Biblioteca Nacional del Perú</li>
                    <li>Auditorías internas y externas</li>
                    <li>Cumplimiento de normas del Sistema Nacional de Bibliotecas</li>
                </ul>
            </div>

            <div class="section">
                <h2>4. Datos Personales Recopilados</h2>

                <h3>4.1 Usuarios del sistema (personal)</h3>
                <ul>
                    <li>Nombre completo</li>
                    <li>DNI</li>
                    <li>Correo electrónico</li>
                    <li>Teléfono</li>
                    <li>Rol (administrador/bibliotecario)</li>
                </ul>

                <h3>4.2 Solicitantes de préstamos</h3>
                <ul>
                    <li>Nombre completo</li>
                    <li>DNI</li>
                    <li>Fecha de nacimiento</li>
                    <li>Teléfono</li>
                    <li>Domicilio</li>
                    <li>Garantía dejada</li>
                </ul>
            </div>

            <div class="section">
                <h2>5. Derechos de los Titulares</h2>
                <p>Conforme a la Ley N° 29733, los titulares tienen derecho a:</p>

                <ul>
                    <li><strong>Derecho de Información:</strong> Ser informado sobre el uso de sus datos personales</li>
                    <li><strong>Derecho de Acceso:</strong> Obtener información sobre sus datos almacenados</li>
                    <li><strong>Derecho de Rectificación:</strong> Solicitar la corrección de datos inexactos</li>
                    <li><strong>Derecho de Cancelación:</strong> Solicitar la eliminación de sus datos</li>
                    <li><strong>Derecho de Oposición:</strong> Oponerse al tratamiento para fines específicos</li>
                </ul>

                <div class="contact-box">
                    <h3>Para ejercer estos derechos, contactar a:</h3>
                    <p><strong>Email:</strong> {{ env('BIBLIOTECA_EMAIL', '[Email]') }}</p>
                    <p><strong>Teléfono:</strong> {{ env('BIBLIOTECA_TELEFONO', '[Teléfono]') }}</p>
                    <p><strong>Dirección:</strong> {{ env('BIBLIOTECA_DIRECCION', '[Dirección]') }}</p>
                </div>
            </div>

            <div class="section">
                <h2>6. Medidas de Seguridad</h2>

                <h3>6.1 Técnicas</h3>
                <ul>
                    <li>Acceso mediante usuario y contraseña</li>
                    <li>Registro de auditoría de todas las operaciones</li>
                    <li>Backup diario de la base de datos</li>
                    <li>Cifrado de comunicaciones (HTTPS)</li>
                </ul>

                <h3>6.2 Organizativas</h3>
                <ul>
                    <li>Acceso restringido por roles</li>
                    <li>Capacitación del personal</li>
                    <li>Políticas de uso aceptable</li>
                    <li>Procedimientos de respuesta a incidentes</li>
                </ul>
            </div>

            <div class="section">
                <h2>7. Conservación de Datos</h2>
                <ul>
                    <li><strong>Datos de usuarios del sistema:</strong> Durante su vinculación laboral + 5 años</li>
                    <li><strong>Datos de préstamos:</strong> 5 años desde la devolución</li>
                    <li><strong>Registros de auditoría:</strong> 5 años</li>
                    <li><strong>Reportes a la BNP:</strong> Permanente (archivo histórico)</li>
                </ul>
            </div>

            <div class="section">
                <h2>8. Autoridad de Control</h2>
                <div class="warning-box">
                    <p>En caso de considerar vulnerados sus derechos, puede presentar una reclamación ante:</p>
                    <p><strong>Autoridad Nacional de Protección de Datos Personales</strong><br>
                    Ministerio de Justicia y Derechos Humanos<br>
                    Jr. Scipión Llona 350, Miraflores, Lima<br>
                    Teléfono: (01) 2054800<br>
                    Web: www.minjus.gob.pe</p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="/" class="btn-back">← Volver al Sistema</a>
            </div>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} {{ env('BIBLIOTECA_NOMBRE', 'Biblioteca Municipal') }}</p>
            <p>Sistema BiblioSystem v2.0 - Cumplimiento Legal Ley N° 29733</p>
        </div>
    </div>
</body>
</html>
