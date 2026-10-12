# Davidebalice.dev Demo API

REST API built with Node.js, Express and MongoDB that manages the demo projects shown on the [davidebalice.dev](https://www.davidebalice.dev) portfolio: project descriptions, technologies, links, cover images and galleries, plus the users of the admin area.

## Features

- Public endpoints to list demos (with search, technology filter and pagination) and read a demo by slug
- Admin area protected by JWT (Bearer token or cookie) with admin/user roles
- Create, edit, activate/deactivate and delete demos
- Cover image and gallery upload, resized with Sharp
- Users management, profile and password update, profile photo upload
- Email sending through SMTP (Brevo)
- Demo mode that blocks write operations for demo accounts

## Tech stack

- [Node.js](https://nodejs.org/) 20+
- [Express 5](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose 9](https://mongoosejs.com/)
- [JSON Web Token](https://github.com/auth0/node-jsonwebtoken), [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Multer](https://github.com/expressjs/multer), [Sharp](https://sharp.pixelplumbing.com/)
- [Nodemailer](https://nodemailer.com/), [date-fns](https://date-fns.org/)

## Getting started

### Requirements

- Node.js 20 or later
- A MongoDB database (local or Atlas)

### Installation

```bash
git clone https://github.com/davidebalice/davidebalice-node-api.git
cd davidebalice-node-api
npm install
```

### Configuration

Create a `config.env` file in the project root:

```ini
DATABASE=mongodb://127.0.0.1:27017/davidebalice
PORT=8000
NODE_ENV=development
FILE_PATH=/absolute/path/to/davidebalice-node-api
JWT_SECRET=change-me
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
DEMO_MODE=false
EMAIL_FROM=info@example.com
BREVO_HOST=smtp-relay.brevo.com
BREVO_PORT=587
BREVO_USERNAME=
BREVO_PASSWORD=
```

Uploaded cover images are stored in `uploads/demo/` (inside `FILE_PATH`).

### Available scripts

| Command       | Description                              |
| ------------- | ---------------------------------------- |
| `npm start`   | Start the API (default port 8000)        |
| `npm run dev` | Start the API with `node --watch`        |

## API endpoints

All endpoints are prefixed with `/api`. Endpoints marked with * require an `Authorization: Bearer <token>` header.

### Demos

| Method | Endpoint                       | Description                                      |
| ------ | ------------------------------ | ------------------------------------------------ |
| GET    | `/demos`                       | List demos (`key`, `tecnology`, `page`, `limit`) |
| GET    | `/demo/:slug`                  | Get a demo by slug                               |
| GET    | `/demo/cover/:filename`        | Get a demo cover image                           |
| GET    | `/demo/gallery/:filename`      | Get a gallery image                              |
| GET    | `/tecnologies` *               | List of all technologies used by the demos       |
| POST   | `/add/demo` *                  | Create a demo                                    |
| GET    | `/edit/demo/:id`               | Demo data for editing                            |
| POST   | `/edit/demo/:id` *             | Update a demo                                    |
| POST   | `/demo/photo/:id` *            | Upload the demo cover image                      |
| POST   | `/demo/gallery/:id` *          | Upload gallery images                            |
| POST   | `/delete/gallery/` *           | Delete a gallery image                           |
| POST   | `/active/demo/:id` *           | Activate/deactivate a demo                       |
| POST   | `/demo/delete/:id` *           | Delete a demo                                    |

### Auth and dashboard

| Method | Endpoint                       | Description                                      |
| ------ | ------------------------------ | ------------------------------------------------ |
| POST   | `/login`                       | Log in and receive a JWT                         |
| GET    | `/logout`                      | Log out                                          |
| POST   | `/signup`                      | Register a new user                              |
| POST   | `/get/user` *                  | Get the user owning the token                    |
| GET    | `/dashboard` *                 | Demo and user counters                           |
| GET    | `/getdemomode` *               | Check whether demo mode is active                |

### Profile and users

| Method | Endpoint                       | Description                                      |
| ------ | ------------------------------ | ------------------------------------------------ |
| GET    | `/profile` *                   | Current user profile                             |
| POST   | `/profile/update` *            | Update the current user profile                  |
| POST   | `/profile/password` *          | Change the current user password                 |
| POST   | `/profile/photo` *             | Upload the current user photo                    |
| POST   | `/forgotPassword`              | Request a password reset email                   |
| PATCH  | `/resetPassword/:token`        | Reset the password with a token                  |
| GET    | `/users` *                     | List users                                       |
| POST   | `/add/user` * (admin)          | Create a user                                    |
| GET    | `/user/:id` *                  | Get a user                                       |
| POST   | `/user/:id` * (admin)          | Update a user                                    |
| POST   | `/user/delete/:id` * (admin)   | Delete a user                                    |
| POST   | `/user/photo/:id` * (admin)    | Upload a user photo                              |
| GET    | `/user/img/:filename` *        | Get a user image                                 |
| POST   | `/user/password/:id` * (admin) | Change a user password                           |
| POST   | `/send/email/user` *           | Send an email to a user                          |

## Project structure

```text
controllers/   request handlers
middlewares/   query helpers, errors, email, demo mode
models/        Mongoose schemas (demo, gallery, user)
routers/       Express routers
i18n/          translations
public/        static assets
index.js       app entry point
```

## Author

**Davide Balice** – [davidebalice.dev](https://www.davidebalice.dev)
