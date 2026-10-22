# BlogSpace — Blog Management Application

BlogSpace is a full-stack blogging platform. It has two parts:

- **`backend/`**: a REST API built with Node.js, Express, TypeScript, MySQL and Sequelize
- **`frontend/`**: a web app built with Next.js and Tailwind CSS that uses only that API

It supports three kinds of visitors. **Guests** can browse, search and read blogs. **Users** can manage their own blogs and profile. **Admins** can also manage users and every blog.

All data in the frontend comes from the REST API. Nothing is hardcoded or mocked, and the backend checks authentication and authorization on every protected request.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Seed Data and Demo Accounts](#seed-data-and-demo-accounts)
- [Application Routes](#application-routes)
- [API Endpoints](#api-endpoints)
- [User and Admin Functionality](#user-and-admin-functionality)
- [Screenshots](#screenshots)

## Features

**Guest**

- Browse blogs as cards, with category, preview, author avatar and date
- Search by title, filter by category, or combine both (`GET /api/blogs?title=playwright&category=Testing`)
- Read a full blog, with a "Blog Not Found" page for missing blogs
- Register, log in, and reset a forgotten password by email

**User**

- Dashboard with a welcome message, stats, profile summary, recent blogs and a quick "Create Blog" button
- Create, edit and delete their own blogs (deletion asks for confirmation)
- Edit their first and last name, and upload a profile image (the Navbar avatar updates immediately)
- Change their password
- Log out from the Navbar profile menu or the Sidebar

**Admin** (everything a user can do, plus)

- An "All Blogs" view that can edit or delete any user's blog
- User management: list, search and filter users, view user details, and activate or deactivate accounts

**Security and UX**

- JWT authentication. Passwords are hashed with bcrypt and never returned by the API.
- Role-based access is enforced in the backend, not only by hiding menu items
- Every authenticated request checks that the account still exists and is active
- Password reset links are single-use, expire after 15 minutes, and are stored hashed
- Authentication state survives a page refresh. Protected routes redirect guests to `/login`, and admin routes show **Access Denied** to normal users.
- Validation on both sides: required fields, email, password length and confirmation, blog fields, and image type (JPG/PNG/WEBP/GIF) and size (≤ 2MB)
- Readable error messages, loading skeletons, pending buttons that block double submits, empty states, toasts and confirmation dialogs
- Responsive design: the Sidebar becomes a drawer on mobile, tables become cards, and forms fit the screen

## Technologies

| Part     | Stack                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------- |
| Backend  | Node.js, Express, TypeScript, MySQL, Sequelize, JWT (jsonwebtoken), bcrypt, multer, nodemailer, cors, dotenv |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, Axios                                                 |
| Tooling  | tsx, nodemon, concurrently                                                                               |

## Project Structure

```
blogspace/
├── package.json              # root scripts: install, run and seed both apps
├── README.md
├── backend/
│   ├── server.ts             # entry point
│   ├── app.ts                # Express app (CORS, JSON, static /uploads, routes)
│   ├── config/               # database connection and schema sync
│   ├── controllers/          # auth, user and blog logic
│   ├── middlewares/          # JWT auth, admin check, blog ownership, image upload
│   ├── models/               # User and Blog models
│   ├── routes/               # auth, user and blog routes
│   ├── seed/                 # demo users and blogs (npm run seed)
│   ├── uploads/              # uploaded profile images
│   ├── utils/                # mailer and helpers
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── (public)/         # Navbar + Footer layout: home, blog details, auth pages
    │   ├── dashboard/        # fixed Navbar + Sidebar layout (login required)
    │   └── admin/            # dashboard layout + admin-only guard
    ├── components/           # Navbar, Sidebar, ProfileMenu, BlogCard, BlogForm, SearchBar,
    │                         # CategoryFilter, Loader, ConfirmDialog, Avatar, RouteGuards, ...
    ├── contexts/             # AuthContext, ToastContext
    ├── services/             # auth.service, user.service, blog.service
    ├── hooks/                # usePageTitle, useUserStatus
    ├── utils/                # api (Axios instance), auth (token storage), validation, format
    ├── screenshots/
    └── .env.example
```

Every frontend request goes through one Axios instance (`frontend/utils/api.js`). It attaches `Authorization: Bearer <token>`, and when the backend rejects a session (401, or a deactivated account) it logs the user out. Pages call the service modules and never call Axios directly.

Each protected page has a small server `page.jsx` and a client `*View.jsx` beside it. The pages render after a browser-side session check, so the server file marks them `instant = false` for Next.js's instant-navigation check.

## Prerequisites

- Node.js 20 or newer, with npm
- MySQL 5.7 or newer

## Installation

```bash
# 1. clone and install everything (root, backend and frontend)
git clone <repository-url> blogspace
cd blogspace
npm run install:all

# 2. create the database
mysql -u root -p -e "CREATE DATABASE blogdb;"

# 3. configure both apps
cp backend/.env.example backend/.env              # then fill in DB settings and SECRET_KEY
cp frontend/.env.example frontend/.env.local

# 4. (optional) add demo users and blogs
npm run seed
```

The tables are created automatically when the backend starts. On an existing database, the newer `users` columns (`profileImage`, `resetPasswordToken`, `resetPasswordExpires`) are added automatically too.

## Environment Variables

The real `.env` files are git-ignored; only the `.env.example` files are committed.

**`backend/.env`**

| Variable                                        | Description                                                        | Example                 |
| ----------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| `PORT`                                          | API port                                                           | `5000`                  |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection                                         | `localhost`, `3306`, …  |
| `SECRET_KEY`                                    | Secret used to sign JWTs                                           | a long random string    |
| `CLIENT_URL`                                    | Frontend URL, used for CORS and password-reset links               | `http://localhost:3000` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Email settings for reset links. Leave `SMTP_HOST` empty to print the links in the backend console instead. | — |

**`frontend/.env.local`**

| Variable              | Description                    | Example                     |
| --------------------- | ------------------------------ | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API    | `http://localhost:5000/api` |

## Running the Application

From the project root:

```bash
npm run dev            # backend on :5000 and frontend on :3000 together
npm run dev:backend    # backend only
npm run dev:frontend   # frontend only
npm run build          # production build of the frontend
```

Then open http://localhost:3000.

The frontend depends on the backend: start the backend (with MySQL running) before using the app. Profile images are served by the backend from `/uploads`.

## Seed Data and Demo Accounts

`npm run seed` adds demo accounts and 12 blogs. It is safe to run more than once; existing users and blogs are left alone.

| Role  | Email                 | Password      |
| ----- | --------------------- | ------------- |
| Admin | `admin@blogspace.dev` | `Admin@123`   |
| User  | `john@example.com`    | `Password123` |
| User  | `sarah@example.com`   | `Password123` |
| User  | `michael@example.com` | `Password123` |
| User  | `ayesha@example.com`  | `Password123` |

The blogs are written by these fictional community members. They discuss what well-known people have said about AI, programming, testing, automation and DevOps, including Elon Musk, Andrew Ng, Sundar Pichai, Alan Turing, Edsger Dijkstra, Donald Knuth, Martin Fowler, Linus Torvalds, Brian Kernighan, Werner Vogels and Grace Hopper. Each quote is cited with its source (talk, paper, book or post). Quotes whose exact origin is uncertain are marked as "widely attributed".

To make your own admin, register normally and then run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## Application Routes

| Route                        | Access     | Description                                  |
| ---------------------------- | ---------- | -------------------------------------------- |
| `/`                          | Public     | Blog list with search and category filter    |
| `/blogs/[id]`                | Public     | Blog details                                 |
| `/login`                     | Public     | Login, with a "Forgot Password?" link        |
| `/register`                  | Public     | Registration                                 |
| `/forgot-password`           | Public     | Request a password reset link                |
| `/reset-password/[token]`    | Public     | Set a new password from the emailed link     |
| `/dashboard`                 | User/Admin | Overview, stats and recent blogs             |
| `/dashboard/blogs`           | User/Admin | My Blogs (user) / All Blogs (admin)          |
| `/dashboard/blogs/create`    | User/Admin | Create a blog                                |
| `/dashboard/blogs/[id]/edit` | User/Admin | Edit a blog (owner or admin)                 |
| `/dashboard/profile`         | User/Admin | Profile details, name editing, avatar upload |
| `/dashboard/change-password` | User/Admin | Change password                              |
| `/admin/users`               | Admin      | User management                              |
| `/admin/users/[id]`          | Admin      | User details and status control              |

## API Endpoints

Base URL: `http://localhost:5000/api`. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint                      | Access        | Description                                                         |
| ------ | ----------------------------- | ------------- | ------------------------------------------------------------------- |
| POST   | `/auth/register`              | Public        | Register (`firstName`, `lastName`, `email`, `password`)             |
| POST   | `/auth/login`                 | Public        | Log in and receive a JWT                                            |
| POST   | `/auth/forgot-password`       | Public        | Email a password reset link (`email`)                               |
| PATCH  | `/auth/reset-password/:token` | Public        | Set a new password with the reset token (`password`)               |
| GET    | `/users`                      | Admin         | List all users                                                      |
| GET    | `/users/:id`                  | Admin         | Get one user                                                        |
| PATCH  | `/users/:id/status`           | Admin         | Activate or deactivate a user (`isActive`)                          |
| GET    | `/users/profile`              | Authenticated | Get own profile                                                     |
| PUT    | `/users/profile/update`       | Authenticated | Update own `firstName` / `lastName`                                 |
| PATCH  | `/users/profile/image`        | Authenticated | Upload profile image (multipart field `image`, JPG/PNG/WEBP/GIF, ≤ 2MB) |
| PATCH  | `/users/password`             | Authenticated | Change own password (`password`)                                    |
| POST   | `/blogs/create`               | Authenticated | Create a blog (`blogTitle`, `blog`, `category`); author comes from the token |
| GET    | `/blogs`                      | Public        | List blogs, optionally filtered by `?title=` and/or `?category=`    |
| GET    | `/blogs/:id`                  | Public        | Get one blog                                                        |
| PUT    | `/blogs/update/:id`           | Owner/Admin   | Update a blog                                                       |
| DELETE | `/blogs/delete/:id`           | Owner/Admin   | Delete a blog                                                       |

Blog responses include `createdAt`, `updatedAt` and an `author` object (`id`, `firstName`, `lastName`, `profileImage`).

Full request and response examples are in the [Postman documentation](https://documenter.getpostman.com/view/40120598/2sBYAvtpby).

## User and Admin Functionality

**Normal user.** The Sidebar shows Dashboard, My Blogs, Create Blog, Profile, Change Password and Logout. Only the user's own blogs appear under My Blogs. Opening another user's blog edit URL shows "You are not authorized to update this blog", and the backend rejects the request anyway. Admin routes show **Access Denied**.

**Admin.** The Sidebar shows Dashboard, All Blogs, Create Blog, Users, Profile, Change Password and Logout. Admins can edit or delete any blog and view any user. They can deactivate a user (after a confirmation) or reactivate one, and the table updates immediately. Admins cannot change their own status. A deactivated user can't log in and sees "Your account has been deactivated."

## Screenshots

| | |
| --- | --- |
| **Homepage**<br>![Homepage](frontend/screenshots/01-home.png) | **Search + category filter**<br>![Search](frontend/screenshots/02-search-and-filter.png) |
| **Blog details**<br>![Blog details](frontend/screenshots/03-blog-details.png) | **Register validation**<br>![Register](frontend/screenshots/04-register-validation.png) |
| **Login error**<br>![Login](frontend/screenshots/05-login-error.png) | **Forgot password**<br>![Forgot password](frontend/screenshots/06-forgot-password.png) |
| **Reset password**<br>![Reset password](frontend/screenshots/07-reset-password.png) | **User dashboard**<br>![Dashboard](frontend/screenshots/08-user-dashboard.png) |
| **My Blogs**<br>![My blogs](frontend/screenshots/09-my-blogs.png) | **Delete confirmation**<br>![Delete](frontend/screenshots/10-delete-confirmation.png) |
| **Create blog**<br>![Create](frontend/screenshots/11-create-blog.png) | **Edit blog**<br>![Edit](frontend/screenshots/12-edit-blog.png) |
| **Profile and avatar upload**<br>![Profile](frontend/screenshots/13-profile.png) | **Change password validation**<br>![Change password](frontend/screenshots/14-change-password-validation.png) |
| **Profile menu**<br>![Profile menu](frontend/screenshots/15-profile-menu.png) | **Access denied (user on admin route)**<br>![Denied](frontend/screenshots/16-access-denied.png) |
| **Admin dashboard**<br>![Admin dashboard](frontend/screenshots/17-admin-dashboard.png) | **Admin: all blogs**<br>![All blogs](frontend/screenshots/18-admin-all-blogs.png) |
| **Admin: users**<br>![Users](frontend/screenshots/19-admin-users.png) | **Admin: user details**<br>![User details](frontend/screenshots/20-admin-user-details.png) |
| **Admin: deactivate confirmation**<br>![Deactivate](frontend/screenshots/21-admin-deactivate-confirmation.png) | **Mobile homepage**<br>![Mobile home](frontend/screenshots/22-mobile-home.png) |
| **Mobile sidebar drawer**<br>![Mobile sidebar](frontend/screenshots/23-mobile-sidebar.png) | |
