const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  console.log('Ruta raíz accedida');
  res.send('¡Bienvenido a la API!');
});

app.use((err, req, res, next) => {
    console.error('Error en la ruta:', err);
    res.status(500).send('Algo salió mal');
  });

const PORT = process.env.PORT || 5000;
 server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});