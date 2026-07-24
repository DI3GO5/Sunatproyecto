require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


async function crearTablas() {

    try {

        console.log("Conectando a PostgreSQL...");

        const sqlPath = path.join(__dirname, "db", "postgresql_setup.sql");

        const sql = fs.readFileSync(sqlPath, "utf8");


        console.log("Ejecutando script SQL...");

        await pool.query(sql);


        console.log("✅ Tablas creadas correctamente");


    } catch(error) {

        console.error("❌ Error:", error.message);

    } finally {

        await pool.end();

    }
}


crearTablas();