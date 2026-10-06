require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const os = require("os");

const {
    Server
} = require("socket.io");

require("./database");

const authRoutes = require("./routes/auth.routes");
const baysRoutes = require("./routes/bays.routes");
const { router: reservationsRoutes, adminRouter } = require("./routes/reservations.routes");
const aiRoutes = require("./routes/ai.routes");
const stationRoutes = require("./routes/station.routes");
const carSpotsRoutes = require("./routes/carspots.routes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.set("io", io);

app.use(cors());

app.use(express.json({ limit: '10mb' }));

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static(
        path.join(__dirname, "..", "frontend")
    )
);

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        service: "RideNow API",
        timestamp: new Date().toISOString()
    });
});

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/bays",
    baysRoutes
);

app.use(
    "/api/reservations",
    reservationsRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);

app.use(
    "/api/station",
    stationRoutes
);

app.use(
    "/api/car-spots",
    carSpotsRoutes
);

app.use(
    "/api/admin/reservations",
    adminRouter
);




const supportRooms = new Map(); 

io.on("connection", (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    
    socket.on("support:request", (data) => {
        const roomId = `support_${data.userId}`;
        socket.join(roomId);

        if (!supportRooms.has(roomId)) {
            supportRooms.set(roomId, {
                userId: data.userId,
                userName: data.userName || "Usuario",
                messages: [],
                active: true
            });
        }

        
        io.emit("support:new_request", {
            roomId,
            userName: data.userName || "Usuario",
            userId: data.userId
        });

        socket.emit("support:connected", {
            roomId,
            message: "Un administrador ha sido notificado. Espera un momento..."
        });
    });

    
    socket.on("support:admin_join", (data) => {
        const { roomId } = data;
        socket.join(roomId);

        const room = supportRooms.get(roomId);
        if (room) {
            room.adminSocketId = socket.id;
        }

        
        io.to(roomId).emit("support:admin_joined", {
            message: "Un administrador se ha conectado al chat."
        });
    });

    
    socket.on("support:message", (data) => {
        const { roomId, text, sender, senderName } = data;
        const room = supportRooms.get(roomId);

        if (room) {
            const msg = {
                text,
                sender,
                senderName: senderName || "Anónimo",
                timestamp: new Date().toISOString()
            };
            room.messages.push(msg);
            io.to(roomId).emit("support:message", msg);
        }
    });

    
    socket.on("support:list", () => {
        const rooms = [];
        supportRooms.forEach((room, roomId) => {
            if (room.active) {
                rooms.push({
                    roomId,
                    userName: room.userName,
                    userId: room.userId,
                    messageCount: room.messages.length
                });
            }
        });
        socket.emit("support:room_list", rooms);
    });

    
    socket.on("support:close", (data) => {
        const { roomId } = data;
        const room = supportRooms.get(roomId);
        if (room) {
            room.active = false;
            io.to(roomId).emit("support:closed", {
                message: "La sesión de soporte ha finalizado."
            });
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
});

app.get("*", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "..",
            "frontend",
            "index.html"
        )
    );
});

const PORT = process.env.PORT || 3000;


function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log("");
    console.log("================================");
    console.log("☀ RideNow");
    console.log("================================");
    console.log(`🚀 Local:   http://localhost:${PORT}`);
    console.log(`🌐 Red LAN: http://${localIP}:${PORT}`);
    console.log(`❤️  Health:  http://localhost:${PORT}/api/health`);
    console.log("================================");
    console.log("📱 Escanea un QR o abre la URL de Red LAN en cualquier navegador");
    console.log("================================");
});