// js/midwares/JWT_mid.js
const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
    // Primeiro tenta pegar do cookie
    const token = req.cookies?.token;
    
    // Se não encontrou no cookie, tenta no header Authorization
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader?.split(' ')[1];

    // Salva última rota apenas para GET (exceto rotas de API)
    if (req.method === "GET" && !req.originalUrl.startsWith('/api/')) {
        res.cookie("lastRoute", req.originalUrl, { 
            httpOnly: true,
            maxAge: 5 * 60 * 1000 // 5 minutos
        });
    }

    const finalToken = token || tokenFromHeader;

    if (!finalToken) {
        console.log("🔴 Token não encontrado. Redirecionando...");
        
        // Verifica se é uma requisição de API
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ error: "Token não fornecido" });
        }
        
        return res.redirect('/');
    }

    try {
        const user = jwt.verify(finalToken, process.env.JWT_SECRET);
        console.log("🟢 Token válido. Acesso concedido.");
        console.log("📦 Token decodificado:", {
            id: user.id,
            role: user.role,
            exp: new Date(user.exp * 1000).toLocaleString()
        });
        
        req.user = user;
        next();
    } catch (err) {
        console.log("🔴 Token inválido:", err.message);
        
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(403).json({ error: "Token inválido" });
        }
        
        return res.redirect('/');
    }
}

function gotoHome(req, res, next) {
    const token = req.cookies?.token;
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader?.split(' ')[1];
    const finalToken = token || tokenFromHeader;

    if (!finalToken) {
        return next();
    }

    try {
        const user = jwt.verify(finalToken, process.env.JWT_SECRET);
        req.user = user;

        console.log("🟢 Token válido encontrado no login.");
        
        const last = req.cookies?.lastRoute;
        
        if (last && !last.startsWith('/api/')) {
            console.log("🔄 Redirecionando para última rota:", last);
            return res.redirect(last);
        }

        console.log("🔄 Redirecionando para home");
        return res.redirect('/home');
        
    } catch (err) {
        console.log("⚠️ Token inválido no gotoHome, seguindo normalmente");
        return next();
    }
}

function VerifyAcess(...rolesPermitidas) {
    return (req, res, next) => {
        if (!req.user) {
            console.log("🔴 Usuário não autenticado");
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (!rolesPermitidas.includes(req.user.role)) {
            console.log(`🔴 Acesso negado para role: ${req.user.role}`);
            
            // Se for API, retorna JSON
            if (req.originalUrl.startsWith('/api/')) {
                return res.status(403).json({ error: "Acesso negado" });
            }
            
            // Se for página, redireciona
            return res.status(403).redirect('/home');
        }
        
        console.log("🟢 Acesso autorizado por perfil:", req.user.role);
        next();
    };
}

module.exports = { autenticarToken, jwt, gotoHome, VerifyAcess };