const express = require("express");
const { all, get } = require("../database");
const router = express.Router();
router.get("/", async (req, res) => {
    try {
        const bays = await all(`
            SELECT
                id,
                code,
                vehicle_type,
                status,
                location
            FROM bays
            ORDER BY id
        `);
        res.json(bays);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "No se pudieron consultar las bahías"
        });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const bay = await get(
            `SELECT
                id,
                code,
                vehicle_type,
                status,
                location
             FROM bays
             WHERE id = $1`,
            [req.params.id]
        );
        if (!bay) {
            return res.status(404).json({
                error: "Bahía no encontrada"
            });
        }
        res.json(bay);
    } catch (error) {
        res.status(500).json({
            error: "Error consultando bahía"
        });
    }
});
module.exports = router;
