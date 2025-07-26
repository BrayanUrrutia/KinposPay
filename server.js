const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

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

res.send(`
  <html>
    <head><title>Callback KinposPay</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h2>Callback recibido exitosamente</h2>
      <pre>${JSON.stringify(callbackData, null, 2)}</pre>
    </body>
  </html>
`);

});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor KinPOS corriendo en http://localhost:${PORT}`);
});
