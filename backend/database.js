const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on("connect", () => {
    console.log("✅ Conexión a PostgreSQL establecida");
});

pool.on("error", (err) => {
    console.error("❌ Error inesperado en PostgreSQL", err);
    process.exit(-1);
});

async function initDB(retries = 5) {
    while (retries > 0) {
        try {
            
            await pool.query("SELECT 1");
            
            const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
            const schema = fs.readFileSync(schemaPath, "utf8");
            
            await pool.query(schema);
            console.log("✅ Tablas de RideNow listas en PostgreSQL");
            return;
        } catch (error) {
            console.error(`❌ Esperando a PostgreSQL... (${retries} intentos restantes)`);
            retries -= 1;
            await new Promise(res => setTimeout(res, 2000));
        }
    }
    console.error("❌ No se pudo inicializar la base de datos tras varios intentos.");
}


if (process.env.NODE_ENV !== "test") {
    initDB();
}

async function run(sql, params = []) {
    try {
        const result = await pool.query(sql, params);
        return {
            id: result.rows.length > 0 ? result.rows[0].id : null,
            rowCount: result.rowCount
        };
    } catch (error) {
        throw error;
    }
}

async function get(sql, params = []) {
    try {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
    } catch (error) {
        throw error;
    }
}

async function all(sql, params = []) {
    try {
        const result = await pool.query(sql, params);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    pool,
    run,
    get,
    all
};