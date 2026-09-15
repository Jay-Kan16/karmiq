# KaamSaathi Backend
Node.js + Express + TypeScript + Mongoose + MongoDB + Socket.IO.

## Setup
1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI` and a strong `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm run dev`.

The server never inserts demo records on startup. Run `npm run seed` explicitly to create the service catalog. If you want to provision an admin account, extend the seed script with your own credentials rather than committing them.

## API
All protected routes use `Authorization: Bearer <JWT>`. Responses use `{success,data}` or `{success:false,message}`.

Health: `GET /api/health`
