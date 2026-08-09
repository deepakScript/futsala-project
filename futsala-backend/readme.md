# Futsala Backend (Central API)

Single Express server with three isolated modules: **users** (mobile app), **admin** (venue owners), and **superadmin** (platform).

## Folder structure

```
futsala-backend/
├── prisma/
├── src/
│   ├── config/                 # DB, Prisma
│   ├── types/                  # Shared Express types
│   ├── utils/                  # JWT, mail, cloudinary
│   ├── middlewares/            # Shared (catchAsync, validation)
│   ├── modules/
│   │   ├── users/              # futsala_app (customers)
│   │   │   ├── controllers/
│   │   │   ├── middlewares/    # verifyToken (Bearer JWT)
│   │   │   └── routes/
│   │   ├── admin/              # futsala-admin (venue owners)
│   │   │   ├── controllers/
│   │   │   ├── middlewares/    # cookie: token
│   │   │   └── routes/
│   │   └── superadmin/         # futsala_superadmin
│   │       ├── controllers/
│   │       ├── middlewares/    # cookie: auth-token
│   │       └── routes/
│   └── server.ts
└── api/                        # Vercel entry
```

## API prefixes

| Module | Client | Mount path |
|--------|--------|------------|
| `users` | Flutter `futsala_app` | `/api/v1/*` |
| `admin` | Next.js `futsala-admin` | `/api/admin/*` |
| `superadmin` | Next.js `futsala_superadmin` | `/api/superadmin/*` |

## Setup

```bash
cd futsala-backend
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Frontends: set `NEXT_PUBLIC_API_URL=http://localhost:5000` in `.env.local`.

## Scripts

- `npm run dev` — dev server (port 5000)
- `npm run build` — Prisma generate + TypeScript compile
- `npm run db:seed` — default super admin (`admin@futsal.com` / `admin123`)
