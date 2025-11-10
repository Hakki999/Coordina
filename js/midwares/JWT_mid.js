// js/midwares/JWT_mid.js
const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
    // Primeiro tenta pegar do cookie
    const token = req.cookies.token;
    
    // Se não encontrou no cookie, tenta no header Authorization
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];
    
    const finalToken = token || tokenFromHeader;
    
    if (!finalToken) {
        return res.status(401).json({ erro: 'Token ausente' });
    }

    jwt.verify(finalToken, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ erro: 'Token inválido ou expirado' });
        req.user = user;
        next();
    });
}

module.exports = { autenticarToken, jwt }