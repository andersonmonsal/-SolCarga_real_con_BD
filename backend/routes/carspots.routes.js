const express = require("express");
const { all, get, run } = require("../database");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");
const router = express.Router();
router.get("/", async (req, res) => {
    try {
        const spots = await all(`
            SELECT id, code, zone, status, sensor_id, sensor_active, last_updated
            FROM car_spots
            ORDER BY zone, code
        `);
        const zones = {};
        spots.forEach(spot => {
            if (!zones[spot.zone]) zones[spot.zone] = [];
            zones[spot.zone].push(spot);
        });
        const free    = spots.filter(s => s.status === "free").length;
        const occupied = spots.filter(s => s.status === "occupied").length;
        res.json({ spots, zones, summary: { total: spots.length, free, occupied } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error consultando parqueaderos" });
    }
});
router.post("/sensor-update", async (req, res) => {
    try {
        const { sensorId, status } = req.body; 
        if (!sensorId || !["free", "occupied"].includes(status)) {
            return res.status(400).json({ error: "sensorId y status requeridos (free|occupied)" });
        }
        const spot = await get(
            "SELECT * FROM car_spots WHERE sensor_id = $1 AND sensor_active = true",
            [sensorId]
        );
        if (!spot) {
            return res.status(404).json({ error: "Sensor no registrado o inactivo" });
        }
        await run(
            "UPDATE car_spots SET status = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2",
            [status, spot.id]
        );
        const io = req.app.get("io");
        if (io) {
            io.emit("carSpotUpdated", { spotId: spot.id, code: spot.code, zone: spot.zone, status });
        }
        res.json({ message: `Parqueadero ${spot.code} actualizado a: ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error actualizando sensor" });
    }
});
router.post("/simulate", authenticate, requireAdmin, async (req, res) => {
    try {
        const { spotId } = req.body;
        const spot = await get("SELECT * FROM car_spots WHERE id = $1", [spotId]);
        if (!spot) return res.status(404).json({ error: "Parqueadero no encontrado" });
        const newStatus = spot.status === "free" ? "occupied" : "free";
        await run(
            "UPDATE car_spots SET status = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2",
            [newStatus, spotId]
        );
        const io = req.app.get("io");
        if (io) {
            io.emit("carSpotUpdated", { spotId: spot.id, code: spot.code, zone: spot.zone, status: newStatus });
        }
        res.json({ message: `Sensor simulado: ${spot.code} → ${newStatus}`, newStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error simulando sensor" });
    }
});
router.put("/:id/maintenance", authenticate, requireAdmin, async (req, res) => {
    try {
        const spot = await get("SELECT * FROM car_spots WHERE id = $1", [req.params.id]);
        if (!spot) return res.status(404).json({ error: "Parqueadero no encontrado" });
        const newStatus = spot.status === "maintenance" ? "free" : "maintenance";
        await run(
            "UPDATE car_spots SET status = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2",
            [newStatus, spot.id]
        );
        const io = req.app.get("io");
        if (io) {
            io.emit("carSpotUpdated", { spotId: spot.id, code: spot.code, zone: spot.zone, status: newStatus });
        }
        res.json({ message: `Parqueadero ${spot.code} → ${newStatus}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error actualizando estado" });
    }
});
module.exports = router;
