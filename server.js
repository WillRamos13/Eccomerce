const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Arrays para almacenar datos en memoria (solo para desarrollo, no persistente)
let products = [];
let sales = [];
let orders = [];

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    // Enviar datos actuales al nuevo cliente conectado
    socket.emit('update-products', products);
    socket.emit('update-sales', sales);
    socket.emit('update-orders', orders);

    // Cuando el cliente agrega un producto
    socket.on('add-product', (product) => {
        // Validación básica del producto
        if (product && product.name && typeof product.price === 'number' && product.price > 0) {
            products.push(product);
            io.emit('update-products', products); // Emitir a todos los clientes la lista actualizada
            console.log('Producto agregado:', product);
        } else {
            socket.emit('error-message', 'Producto inválido.');
        }
    });

    // Registrar una venta
    socket.on('add-sale', (sale) => {
        if (sale && sale.name && typeof sale.price === 'number' && sale.price > 0) {
            sales.push(sale);
            io.emit('update-sales', sales);
            console.log('Venta registrada:', sale);
        } else {
            socket.emit('error-message', 'Venta inválida.');
        }
    });

    // Registrar un pedido
    socket.on('add-order', (order) => {
        if (order && order.name && typeof order.price === 'number' && order.price > 0) {
            orders.push(order);
            io.emit('update-orders', orders);
            console.log('Pedido registrado:', order);
        } else {
            socket.emit('error-message', 'Pedido inválido.');
        }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
