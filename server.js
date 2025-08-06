const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Página principal (carga index.html desde raíz)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de prueba
app.get('/test', (req, res) => {
  res.redirect('/payment/callback/KinposPay');
});

// Ruta exacta del callback
app.all('/payment/callback/KinposPay', (req, res) => {
  const callbackData = {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    body: req.body,
  };

  console.log("Callback recibido Exitosamente");
  console.log(JSON.stringify(callbackData, null, 2));

  const body = req.body;
  const statusLabel = body.responseCode === "00" ? "✅ Transacción Exitosa" : "❌ Transacción Rechazada";
  const statusColor = body.responseCode === "00" ? "#2ecc71" : "#e74c3c";

  const generateFields = (data) => {
    return Object.entries(data)
      .map(([key, value]) => {
        return `
          <div class="field">
            <span class="label">${key}:</span> 
            <span class="value">${value !== null ? value : '<i>(vacío)</i>'}</span>
          </div>
        `;
      })
      .join('');
  };

  res.send(`
    <html>
      <head>
        <title>Respuesta de Pago - Kinpos Pay</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #f0f2f5;
            color: #2d3436;
            padding: 40px;
            margin: 0;
          }

          .container {
            background: #ffffff;
            padding: 30px 35px;
            border-radius: 16px;
            max-width: 750px;
            margin: auto;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
            animation: fadeIn 0.5s ease;
          }

          h2 {
            text-align: center;
            color: ${statusColor};
            font-size: 26px;
            margin-bottom: 30px;
          }

          .field {
            margin-bottom: 14px;
          }

          .label {
            font-weight: 600;
            color: #636e72;
            display: inline-block;
            min-width: 160px;
          }

          .value {
            font-family: 'Courier New', Courier, monospace;
            background: #f1f2f6;
            padding: 6px 10px;
            border-radius: 8px;
            display: inline-block;
            color: #2d3436;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .copy-button {
            display: block;
            margin: 25px auto 0;
            padding: 12px 20px;
            background-color: #0984e3;
            color: #fff;
            border: none;
            font-size: 15px;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.3s ease;
          }

          .copy-button:hover {
            background-color: #0652dd;
          }

          .footer {
            margin-top: 30px;
            text-align: center;
            color: #aaa;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${statusLabel}</h2>

          <div id="callback-data">
            ${generateFields(body)}
          </div>

          <button class="copy-button" onclick="copyToClipboard()">📋 Copiar datos del callback</button>

          <div class="footer">Kinpos Pay Callback Viewer</div>
        </div>

        <script>
          function copyToClipboard() {
            const data = ${JSON.stringify(body, null, 2)};
            navigator.clipboard.writeText(JSON.stringify(data, null, 2))
              .then(() => {
                alert("✅ Datos copiados al portapapeles");
              })
              .catch(err => {
                alert("❌ Error al copiar");
                console.error(err);
              });
          }
        </script>
      </body>
    </html>
  `);
});

// Función para detectar IP local automáticamente
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

// Iniciar el servidor y mostrar IP local en consola
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor KinPOS corriendo en:`);
  console.log(`→ http://localhost:${PORT}`);
  console.log(`→ http://${localIP}:${PORT}`);
});