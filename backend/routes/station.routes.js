const express = require("express");

const { get } = require("../database");

const router = express.Router();

// GET / — Station information
router.get("/", async (req, res) => {
    try {
        const station = await get(
            "SELECT * FROM station WHERE id = 1"
        );

        if (!station) {
            return res.status(404).json({
                error: "Información de estación no disponible"
            });
        }

        res.json(station);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error consultando estación"
        });
    }
});

module.exports = router;
