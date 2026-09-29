const jwt = require("jsonwebtoken");
const { get } = require("../database");

function authenticate(req, res, next) {

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Token no proporcionado"
        });
    }

    const token = header.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
        };

        next();

    } catch (error) {

        return res.status(401).json({
            error: "Token inválido o expirado"
        });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            error: "Acceso denegado. Se requiere rol de administrador."
        });
    }
    next();
}

module.exports = { authenticate, requireAdmin };
