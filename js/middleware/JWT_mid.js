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
        console.log("TOKEN DECODIFICADO:", user); 
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

function VerifyAcess(...rolesPermitidas) {
    
    
  return (req, res, next) => {
    if (!rolesPermitidas.includes(req.user.role)) {
      return res.status(403).redirect('/home').json({ error: "Acesso negado" });
    }
    console.log("🟢Acesso autorizado a rota por perfil:", req.user.role);
    next();
  };
}


module.exports = { autenticarToken, jwt, gotoHome, VerifyAcess }