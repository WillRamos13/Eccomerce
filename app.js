const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const http = require('http');
const path = require('path');
const users = require('./users');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'clave_super_secreta',
    resave: false,
    saveUninitialized: true
}));

// Middleware para proteger rutas
function authMiddleware(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Login routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = { username: user.username, role: user.role };
        return res.redirect(user.role === 'admin' ? '/admin' : '/cliente');
    } else {
        return res.send('Credenciales inválidas');
    }
});

// Protected routes
app.get('/admin', authMiddleware, (req, res) => {
    if (req.session.user.role !== 'admin') return res.send('Acceso denegado');
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.get('/cliente', authMiddleware, (req, res) => {
    if (req.session.user.role !== 'cliente') return res.send('Acceso denegado');
    res.sendFile(path.join(__dirname, 'public/cliente.html'));
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Variables para productos, pedidos y ventas
let products = [];
let orders = [];
let sales = [];

// Socket.io logic
io.on('connection', (socket) => {
    // Enviar datos iniciales
    socket.emit('update-products', products);
    socket.emit('update-orders', orders);
    socket.emit('update-sales', sales);

    // Agregar producto
    socket.on('add-product', (product) => {
        if (!product.name || !product.price || product.price <= 0) {
            socket.emit('error-message', 'Datos de producto inválidos');
            return;
        }
        products.push(product);
        io.emit('update-products', products);
    });

    // Agregar pedido
    socket.on('add-order', (order) => {
        orders.push(order);
        io.emit('update-orders', orders);

        // Registrar venta
        sales.push(order);
        io.emit('update-sales', sales);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
