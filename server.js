const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let products = [];
let sales = [];
let orders = [];

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Enviar datos actuales al nuevo cliente
  socket.emit('update-products', products);
  socket.emit('update-sales', sales);
  socket.emit('update-orders', orders);

  // Cuando recibimos producto nuevo
  socket.on('add-product', (product) => {
    products.push(product);
    io.emit('update-products', products);
  });

  // Registrar venta
  socket.on('add-sale', (sale) => {
    sales.push(sale);
    io.emit('update-sales', sales);
  });

  // Registrar pedido
  socket.on('add-order', (order) => {
    orders.push(order);
    io.emit('update-orders', orders);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
