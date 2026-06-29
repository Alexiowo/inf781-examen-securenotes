# INF-781 - Examen 3er Parcial

# SecureNotes API con JWT y Gestión Segura de Sesiones

## Descripción

SecureNotes es una API REST desarrollada con NestJS y PostgreSQL que implementa autenticación mediante JWT (Access Token y Refresh Token), gestión segura de sesiones y un CRUD de notas privadas.

Cada usuario únicamente puede acceder a sus propias notas, garantizando el control de acceso a nivel de objeto.

---

# Tecnologías utilizadas

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* Passport JWT
* Argon2
* Cookie Parser
* Class Validator
* Class Transformer

---

# Requisitos previos

Antes de ejecutar el proyecto es necesario tener instalado:

* Node.js 20 o superior
* PostgreSQL
* Git
* npm

Verificar las versiones:

```bash
node -v
npm -v
```

---

# Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Alexiowo/inf781-examen-securenotes.git
```

Ingresar al proyecto:

```bash
cd inf781-examen-securenotes
```

Instalar dependencias:

```bash
npm install
```

---

# Configuración del archivo .env

Crear un archivo llamado:

```text
.env
```

Tomando como base el archivo:

```text
.env.example
```

Ejemplo:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=tu_usuario
DATABASE_PASSWORD=tu_password
DATABASE_NAME=securenotes_db

ACCESS_TOKEN_SECRET=colocar_un_secreto_largo
REFRESH_TOKEN_SECRET=colocar_otro_secreto_largo

ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

# Base de datos

Crear previamente una base de datos en PostgreSQL.

Ejemplo:

```sql
CREATE DATABASE securenotes_db;
```

Configurar las credenciales correspondientes en el archivo `.env`.

La aplicación utiliza TypeORM con sincronización automática para crear las tablas necesarias al iniciar el proyecto.

---

# Ejecutar la aplicación

Modo desarrollo:

```bash
npm run start:dev
```

La API estará disponible en:

```text
http://localhost:3000
```

---

# Funcionalidades implementadas

## Autenticación

* Registro de usuarios
* Inicio de sesión
* Refresh Token
* Logout
* Consulta de usuario autenticado
* Gestión de sesiones activas

## Gestión de Notas

* Crear nota
* Listar notas
* Obtener nota por ID
* Actualizar nota
* Eliminar nota

---

# Seguridad implementada

* Contraseñas protegidas mediante Argon2.
* Access Token y Refresh Token firmados con secretos diferentes.
* Validación de datos utilizando DTOs y ValidationPipe.
* Refresh Token almacenado únicamente como hash.
* Cookies HttpOnly para el Refresh Token.
* Rotación de Refresh Tokens.
* Revocación de sesiones.
* Protección de rutas mediante JWT Guard.
* Control de acceso para impedir que un usuario acceda a notas de otro.
* Exclusión del archivo `.env` mediante `.gitignore`.

---

# Endpoints principales

## Autenticación

* POST /auth/register
* POST /auth/login
* POST /auth/refresh
* GET /auth/me
* GET /auth/sessions
* POST /auth/logout

## Notas

* POST /notes
* GET /notes
* GET /notes/:id
* PATCH /notes/:id
* DELETE /notes/:id

---

# Evidencias de funcionamiento

Durante las pruebas se verificó correctamente:

* Registro de usuarios.
* Inicio de sesión.
* Renovación del Access Token.
* Consulta del usuario autenticado.
* Listado de sesiones activas.
* Cierre de sesión.
* CRUD completo de notas.
* Acceso denegado (401) cuando no existe token.
* Acceso denegado (404) cuando un usuario intenta acceder a notas pertenecientes a otro usuario.
* Revocación del Refresh Token después del Logout.

---

# Autor

Alejandra Soria Galvarro Menchaca

Ingeniería Informática

Universidad Autónoma Tomás Frías
