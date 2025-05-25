const bcrypt = require('bcrypt');

// Usuarios simulados
const users = [
    {
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10), // contraseña cifrada
        role: 'admin'
    },
    {
        username: 'cliente',
        password: bcrypt.hashSync('cliente123', 10),
        role: 'cliente'
    }
];

module.exports = users;
