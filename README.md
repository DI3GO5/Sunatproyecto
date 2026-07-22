# Renta Clara Perú

Aplicación web para calcular el Impuesto a la Renta 2026 por usuario. Usa Node.js, Express y PostgreSQL.

## Configurar PostgreSQL

1. Abre **pgAdmin 4** y conéctate a tu servidor PostgreSQL 18.
2. Crea una base llamada `renta_peru`.
3. Abre Query Tool sobre `renta_peru`.
4. Ejecuta todo el archivo `db/postgresql_setup.sql`.
5. Copia `.env.example` como `.env`:

```powershell
Copy-Item .env.example .env
```

6. Edita `.env` y reemplaza `TU_PASSWORD` por la contraseña real del usuario `postgres`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/renta_peru
DATABASE_SSL=false
COOKIE_SECURE=false
```

Si la contraseña contiene caracteres especiales, deben codificarse para URL. Por ejemplo, `@` se escribe `%40` y `#` se escribe `%23`.

## Ejecutar

```powershell
npm install
npm start
```

Visita http://localhost:3000. La primera vez, selecciona **Regístrate** y crea una cuenta.

## Seguridad y separación de datos

- Las contraseñas se protegen con `scrypt` y una sal aleatoria; nunca se guardan en texto plano.
- La sesión usa un token aleatorio almacenado en PostgreSQL únicamente como hash.
- La cookie de sesión es `HttpOnly` y `SameSite=Lax`.
- Cada cálculo incluye `user_id`; el historial siempre se filtra por el usuario autenticado.
- Al eliminar un usuario se eliminan sus sesiones y cálculos mediante claves foráneas.
- En producción con HTTPS establece `COOKIE_SECURE=true` y `DATABASE_SSL=true` si tu proveedor lo exige.

## Archivos de base de datos

- `db/postgresql_setup.sql`: script completo e idempotente para crear tablas, relaciones e índices.
- `db/schema.sql`: esquema ejecutado automáticamente al iniciar el servidor.

## Pruebas

```powershell
npm test
```

La herramienta es informativa y no sustituye una declaración jurada ni asesoría profesional.