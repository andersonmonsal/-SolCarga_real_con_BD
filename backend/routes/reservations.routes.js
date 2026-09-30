const express = require("express");
const crypto = require("crypto");
const QRCode = require("qrcode");

const { run, get, all } = require("../database");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// GET /my — Get current user's active or checked-in reservation
router.get("/my", authenticate, async (req, res) => {
    try {
        const reservation = await get(
            `SELECT
                r.id,
                r.reservation_code AS code,
                r.arrival_time AS arrival,
                r.duration,
                r.status,
                r.qr_data AS qr,
                r.created_at,
                b.code AS bay,
                b.vehicle_type
             FROM reservations r
             JOIN bays b ON b.id = r.bay_id
             WHERE r.user_id = $1
               AND r.status IN ('active', 'checked_in')
             ORDER BY r.created_at DESC
             LIMIT 1`,
            [req.user.id]
        );

        if (!reservation) {
            return res.status(404).json(null);
        }

        res.json(reservation);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error consultando reserva"
        });
    }
});

// GET /history — Get all reservations for the current user (history)
router.get("/history", authenticate, async (req, res) => {
    try {
        const reservations = await all(
            `SELECT
                r.id,
                r.reservation_code AS code,
                r.arrival_time AS arrival,
                r.duration,
                r.status,
                r.created_at,
                b.code AS bay,
                b.vehicle_type
             FROM reservations r
             JOIN bays b ON b.id = r.bay_id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC
             LIMIT 20`,
            [req.user.id]
        );

        res.json(reservations);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error consultando historial de reservas"
        });
    }
});


// POST / — Create a reservation
router.post("/", authenticate, async (req, res) => {
    try {
        const {
            bayId,
            arrival,
            duration = "1 h",
            vehicleType = "Patineta"
        } = req.body;

        if (!bayId || !arrival) {
            return res.status(400).json({
                error: "Selecciona una bahía y hora de llegada"
            });
        }
        
        const [hours, minutes] = arrival.split(":");
        const hourInt = parseInt(hours, 10);
        if (isNaN(hourInt) || hourInt < 5 || hourInt >= 22) {
            return res.status(400).json({
                error: "Horario de servicio de 05:00 a 22:00"
            });
        }

        // Check if user already has active reservation
        const existing = await get(
            `SELECT id FROM reservations
             WHERE user_id = $1 AND status = 'active'`,
            [req.user.id]
        );

        if (existing) {
            return res.status(409).json({
                error: "Ya tienes una reserva activa. Cancélala antes de crear otra."
            });
        }

        // Check bay availability
        const bay = await get(
            "SELECT * FROM bays WHERE id = $1",
            [bayId]
        );

        if (!bay) {
            return res.status(404).json({
                error: "Bahía no encontrada"
            });
        }

        if (bay.status !== "available") {
            return res.status(409).json({
                error: "La bahía no está disponible"
            });
        }

        // Generate unique reservation code
        const randomHex = crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase();

        const reservationCode =
            `SC-${bay.code}-${randomHex}`;

        // Generate QR code as data URL
        const qrData = await QRCode.toDataURL(
            JSON.stringify({
                code: reservationCode,
                bay: bay.code,
                vehicleType,
                arrival,
                duration
            }),
            {
                width: 280,
                margin: 2,
                color: {
                    dark: "#152c24",
                    light: "#ffffff"
                }
            }
        );

        // Insert reservation
        const result = await run(
            `INSERT INTO reservations
             (user_id, bay_id, reservation_code, arrival_time, duration, qr_data)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [
                req.user.id,
                bayId,
                reservationCode,
                arrival,
                duration,
                qrData
            ]
        );

        // Update bay status
        await run(
            `UPDATE bays
             SET status = 'reserved',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [bayId]
        );

        // Emit Socket.IO event
        const io = req.app.get("io");

        if (io) {
            io.emit("bayUpdated", {
                bayId,
                status: "reserved"
            });
        }

        res.status(201).json({
            message: "Reserva creada",
            reservation: {
                id: result.id,
                code: reservationCode,
                bay: bay.code,
                vehicle_type: vehicleType,
                arrival,
                duration
            },
            qr: qrData
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error creando reserva"
        });
    }
});

// DELETE /:id — Cancel a reservation
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const reservation = await get(
            `SELECT * FROM reservations
             WHERE id = $1 AND user_id = $2 AND status = 'active'`,
            [req.params.id, req.user.id]
        );

        if (!reservation) {
            return res.status(404).json({
                error: "Reserva no encontrada o ya cancelada"
            });
        }

        // Cancel reservation
        await run(
            `UPDATE reservations
             SET status = 'cancelled'
             WHERE id = $1`,
            [reservation.id]
        );

        // Set bay back to available
        await run(
            `UPDATE bays
             SET status = 'available',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [reservation.bay_id]
        );

        // Emit Socket.IO event
        const io = req.app.get("io");

        if (io) {
            io.emit("bayUpdated", {
                bayId: reservation.bay_id,
                status: "available"
            });
        }

        res.json({
            message: "Reserva cancelada"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error cancelando reserva"
        });
    }
});

// POST /checkin — Confirm arrival by scanning bay's physical QR
router.post("/checkin", authenticate, async (req, res) => {
    try {
        const { scannedCode } = req.body;

        if (!scannedCode) {
            return res.status(400).json({
                error: "Código QR no recibido"
            });
        }

        // Get user's active reservation
        const reservation = await get(
            `SELECT
                r.id,
                r.reservation_code AS code,
                r.bay_id,
                r.status,
                b.code AS bay_code
             FROM reservations r
             JOIN bays b ON b.id = r.bay_id
             WHERE r.user_id = $1
               AND r.status = 'active'
             ORDER BY r.created_at DESC
             LIMIT 1`,
            [req.user.id]
        );

        if (!reservation) {
            return res.status(404).json({
                error: "No tienes una reserva activa"
            });
        }

        // Validate scanned code matches the reserved bay
        // New Physical QR format is a URL like: http://.../?bahia={bay.code}
        // Keep support for old format: RideNow-BAY-{bay.code}
        const scannedClean = scannedCode.trim().toUpperCase();
        const oldExpectedCode = `RIDENOW-BAY-${reservation.bay_code.toUpperCase()}`;
        const newExpectedCodeEnd = `BAHIA=${reservation.bay_code.toUpperCase()}`;

        if (scannedClean !== oldExpectedCode && !scannedClean.endsWith(newExpectedCodeEnd) && !scannedClean.includes(newExpectedCodeEnd)) {
            return res.status(400).json({
                error: `Este QR no corresponde a tu bahía reservada (${reservation.bay_code}). Busca el QR de la bahía correcta.`
            });
        }

        // Update reservation status to checked_in
        await run(
            `UPDATE reservations
             SET status = 'checked_in'
             WHERE id = $1`,
            [reservation.id]
        );

        // Update bay status to occupied
        await run(
            `UPDATE bays
             SET status = 'occupied',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [reservation.bay_id]
        );

        // Add 3 points to user
        await run(
            `UPDATE users SET points = points + 3 WHERE id = $1`,
            [req.user.id]
        );

        // Emit Socket.IO event
        const io = req.app.get("io");
        if (io) {
            io.emit("bayUpdated", {
                bayId: reservation.bay_id,
                status: "occupied"
            });
        }

        res.json({
            message: "¡Llegada confirmada! Tu vehículo puede comenzar a cargarse. +3 Pts",
            pointsEarned: 3,
            reservation: {
                id: reservation.id,
                code: reservation.code,
                bay: reservation.bay_code,
                status: "checked_in"
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error confirmando llegada"
        });
    }
});

// GET /bay-qr/:bayCode — Generate printable QR for a physical bay
router.get("/bay-qr/:bayCode", async (req, res) => {
    try {
        const { bayCode } = req.params;

        const bay = await get(
            "SELECT * FROM bays WHERE code = $1",
            [bayCode.toUpperCase()]
        );

        if (!bay) {
            return res.status(404).json({ error: "Bahía no encontrada" });
        }

        const host = req.get('host');
        // If behind proxy like localtunnel, protocol might be http, but we should try to detect
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const physicalQRText = `${protocol}://${host}/?bahia=${bay.code}`;

        const qrDataURL = await QRCode.toDataURL(
            physicalQRText,
            {
                width: 400,
                margin: 3,
                color: {
                    dark: "#152c24",
                    light: "#ffffff"
                }
            }
        );

        res.json({
            bay: bay.code,
            vehicle_type: bay.vehicle_type,
            location: bay.location,
            qr_text: physicalQRText,
            qr_image: qrDataURL
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generando QR de bahía" });
    }
});

// GET /all-bay-qr — Generate QR codes for ALL ports (for printing)
router.get("/all-bay-qr", async (req, res) => {
    try {
        const allBays = await all("SELECT * FROM bays ORDER BY id");
        const host = req.get('host');
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';

        const results = [];
        for (const bay of allBays) {
            const physicalQRText = `${protocol}://${host}/?bahia=${bay.code}`;
            const qrDataURL = await QRCode.toDataURL(
                physicalQRText,
                {
                    width: 400,
                    margin: 3,
                    color: {
                        dark: "#152c24",
                        light: "#ffffff"
                    }
                }
            );
            results.push({
                bay: bay.code,
                vehicle_type: bay.vehicle_type,
                location: bay.location,
                status: bay.status,
                qr_text: physicalQRText,
                qr_image: qrDataURL
            });
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generando QR de puertos" });
    }
});


// ============================================
// ADMIN ROUTES
// ============================================

const adminRouter = express.Router();

// GET /all — List all active/checked_in reservations (admin only)
adminRouter.get("/all", authenticate, requireAdmin, async (req, res) => {
    try {
        const reservations = await all(
            `SELECT
                r.id,
                r.reservation_code AS code,
                r.arrival_time AS arrival,
                r.duration,
                r.status,
                r.created_at,
                b.code AS bay,
                b.vehicle_type,
                u.name AS user_name,
                u.last_name AS user_last_name,
                u.email AS user_email
             FROM reservations r
             JOIN bays b ON b.id = r.bay_id
             JOIN users u ON u.id = r.user_id
             WHERE r.status IN ('active', 'checked_in')
             ORDER BY r.created_at DESC`
        );
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error listando reservas" });
    }
});

// DELETE /:id — Admin cancels any reservation
adminRouter.delete("/:id", authenticate, requireAdmin, async (req, res) => {
    try {
        const reservation = await get(
            `SELECT r.id, r.bay_id, r.status FROM reservations r WHERE r.id = $1`,
            [req.params.id]
        );

        if (!reservation) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        if (reservation.status !== 'active' && reservation.status !== 'checked_in') {
            return res.status(400).json({ error: "La reserva ya fue cancelada o completada" });
        }

        await run(
            `UPDATE reservations SET status = 'cancelled' WHERE id = $1`,
            [req.params.id]
        );

        await run(
            `UPDATE bays SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [reservation.bay_id]
        );

        // Emit socket event if io is available
        if (req.app.get('io')) {
            req.app.get('io').emit('bayUpdated');
        }

        res.json({ message: "Reserva cancelada exitosamente por el administrador" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error cancelando reserva" });
    }
});

module.exports = { router, adminRouter };