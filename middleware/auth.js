const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'fila-app-super-secret-key-2026';

// Middleware para verificar token
function authenticateToken(req, res, next) {
    const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) return res.status(401).json({ error: 'Acesso negado. Faça login.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
        req.user = user;
        next();
    });
}

// Middleware para verificar papel (Role)
function authorizeRole(roles) {
    return (req, res, next) => {
        // SUPER_ADMIN tem acesso a tudo
        if (req.user && req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Acesso não autorizado para seu perfil.' });
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeRole, SECRET_KEY };
