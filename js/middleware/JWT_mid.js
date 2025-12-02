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
        return res.redirect('/');
        console.log("🔴Token não encontrado. Redirecionando...");
        
    }

    jwt.verify(finalToken, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.redirect('/');
        console.log("🟢Token válido. Acesso concedido.");
        
        req.user = user;
        next();
    });
}

function gotoHome(req, res, next) {

    const token = req.cookies.token;

    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];

    const finalToken = token || tokenFromHeader;

    if (!finalToken) {
        return next(); // sem token → deixa seguir
    }

    jwt.verify(finalToken, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(); // token inválido → segue normalmente
        }

        req.user = user;

        console.log("🟢Token válido encontrado no login.\nRedirecionando...");
        

        // token OK → redireciona
        return res.redirect('/home');
    });
}

module.exports = { autenticarToken, jwt, gotoHome}