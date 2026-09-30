const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { run, get, all } = require("../database");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");
const { sendMail } = require("../utils/mailer");
const crypto = require("crypto");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            lastName = "",
            email,
            password,
            vehicleType = "Patineta"
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Nombre, correo y contraseña son obligatorios"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "La contraseña debe tener mínimo 8 caracteres"
            });
        }

        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\~`"]/;
        if (!specialCharRegex.test(password)) {
            return res.status(400).json({
                error: "La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await get(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser) {
            return res.status(409).json({
                error: "El correo ya está registrado"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        // No verification code needed anymore
        const verificationCode = null;
        
        const result = await run(
            `INSERT INTO users
            (name, last_name, email, password_hash, vehicle_type, is_verified, verification_code)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
                name.trim(),
                (lastName || "").trim(),
                normalizedEmail,
                passwordHash,
                vehicleType,
                true, // Automatically verified
                verificationCode
            ]
        );

        const user = await get(
            `SELECT id, name, last_name, email, vehicle_type, role, is_verified, points
             FROM users
             WHERE id = $1`,
            [result.id]
        );

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                is_verified: user.is_verified
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(201).json({
            message: "Usuario creado. Por favor verifica tu correo.",
            token,
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error creando usuario"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Correo y contraseña son obligatorios"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await get(
            "SELECT * FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (!user) {
            return res.status(401).json({
                error: "Correo o contraseña incorrectos"
            });
        }
        
        if (user.is_verified === false) {
            return res.status(403).json({
                error: "Por favor, verifica tu correo antes de iniciar sesión.",
                needsVerification: true
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                error: "Correo o contraseña incorrectos"
            });
        }

        // --- Enforce exclusive admin role ---
        let effectiveRole = 'user';
        if (user.email === 'andermonmon@gmail.com') {
            effectiveRole = 'admin';
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: effectiveRole,
                name: user.name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Inicio de sesión correcto",
            token,
            user: {
                id: user.id,
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                vehicle_type: user.vehicle_type,
                role: effectiveRole,
                points: user.points || 0
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error iniciando sesión"
        });
    }
});

router.post("/verify-email", async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ error: "Correo y código son obligatorios" });
        }
        
        const normalizedEmail = email.trim().toLowerCase();
        
        const user = await get(
            "SELECT id, verification_code FROM users WHERE email = $1",
            [normalizedEmail]
        );
        
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        if (user.verification_code !== code) {
            return res.status(400).json({ error: "Código de verificación incorrecto" });
        }
        
        await run(
            "UPDATE users SET is_verified = true, verification_code = NULL WHERE id = $1",
            [user.id]
        );
        
        res.json({ message: "Correo verificado correctamente. Ya puedes iniciar sesión." });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error verificando correo" });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "El correo es obligatorio" });
        }
        
        const normalizedEmail = email.trim().toLowerCase();
        const user = await get("SELECT id, name FROM users WHERE email = $1", [normalizedEmail]);
        
        if (!user) {
            // Retornamos 200 por seguridad (no revelar si existe o no el correo)
            return res.json({ message: "Si el correo está registrado, recibirás un enlace de recuperación." });
        }
        
        // Generar token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 3600000); // 1 hora
        
        await run(
            "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
            [resetToken, tokenExpires, user.id]
        );
        
        // Send email
        await sendMail(
            normalizedEmail,
            "Recuperación de contraseña en SolCarga",
            `Hola ${user.name},\n\nPara restablecer tu contraseña, usa este código o token:\n\n${resetToken}\n\nEste token expira en 1 hora.`
        );
        
        res.json({ message: "Si el correo está registrado, recibirás un enlace de recuperación." });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error procesando la solicitud" });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token y nueva contraseña son obligatorios" });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ error: "La contraseña debe tener mínimo 8 caracteres" });
        }
        
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\~`"]/;
        if (!specialCharRegex.test(newPassword)) {
            return res.status(400).json({ error: "La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)" });
        }
        
        const user = await get(
            "SELECT id, reset_token_expires FROM users WHERE reset_token = $1",
            [token]
        );
        
        if (!user) {
            return res.status(400).json({ error: "Token inválido" });
        }
        
        if (new Date() > new Date(user.reset_token_expires)) {
            return res.status(400).json({ error: "El token ha expirado" });
        }
        
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        await run(
            "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
            [passwordHash, user.id]
        );
        
        res.json({ message: "Contraseña actualizada correctamente" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error restableciendo contraseña" });
    }
});

// GET /users — Get all users for admin dashboard
router.get("/users", authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await all(
            `SELECT id, name, last_name, email, vehicle_type, role, created_at 
             FROM users 
             ORDER BY created_at DESC`
        );
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error obteniendo usuarios"
        });
    }
});

module.exports = router;