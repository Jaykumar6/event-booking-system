# Event Booking System

It allows organizers to create events and customers to book tickets.

## Features

- User registration and login
- Organizer and customer roles
- Create, update, and view events
- Book tickets with available seat check
- MongoDB transactions for safe bookings
- Background email jobs using Redis + BullMQ
- JWT-based authentication

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Redis + BullMQ
- JWT
- Resend for email

## Setup

1. Install dependencies:

```bash
npm install
```

1. Create a `.env` file .

2. Add your environment values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/event_booking
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
RESEND_API_KEY=your_resend_key
EMAIL_FROM=your_verified_email
```

4. Start the API:

```bash
npm run dev
```

5. Start the worker:

```bash
npm run worker
```

The app runs on:

```text
http://localhost:3000
```

## Important API Endpoints

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Events

```text
GET /api/events
GET /api/events/:id
POST /api/events
PUT /api/events/:id
```

### Booking

```text
POST /api/events/:eventId/bookings
GET /api/events/customer/my-bookings
GET /api/events/:eventId/bookings
```

## Example Register Request

```json
{
  "name": "Jay",
  "email": "jay@example.com",
  "password": "password123",
  "role": "customer"
}
```

For organizer testing, use:

```json
{
  "role": "organizer"
}
```

## Example Event Create Request

```json
{
  "title": "Tech Meetup",
  "description": "A simple developer meetup",
  "date": "2026-10-10T10:00:00.000Z",
  "location": "Bengaluru",
  "totalTickets": 100
}
```

## Example Booking Request

```json
{
  "quantity": 2
}
```

## Notes

- JWT is used for login and role-based access.
- Booking is checked inside a MongoDB transaction so the ticket count stays correct.
- Email sending is done in the background using BullMQ and Redis.


## Frontend (React + Vite)

The `frontend/` folder is a single-page app ("Admit") that talks to this API.

**Run it locally**

```bash
# terminal 1 - API (needs MongoDB + Redis from your .env)
npm run dev

# terminal 2 - worker (sends the emails)
npm run worker

# terminal 3 - frontend
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:3000`, so the httpOnly login cookie works without any CORS setup.
Set `VITE_PROXY_TARGET` if your API runs on another port.

**What it includes**

- Public event browsing with search, filters (upcoming / available / past) and sorting
- Event page with live ticket meter and a quantity-based booking panel
- Register / login with attendee and organizer roles, session restored from the cookie on refresh
- Attendee: "My tickets" page
- Organizer: dashboard with stats, create / edit event, attendee list with CSV export
- Light and dark themes, responsive down to mobile, skeleton loaders, toasts, empty and error states

**Added to the API for the frontend**

- `GET /api/auth/me` - returns the logged-in user from the cookie (used to restore the session on refresh)

**Deploying (frontend on Vercel, API on Render)**

Browsers will not send a `SameSite=Lax` cookie on cross-site requests, so keep the API same-origin from the browser's point of view:
edit `frontend/vercel.json`, replace `YOUR-API-NAME` with your Render service name, and deploy the `frontend/` folder.
Vercel then forwards `/api/*` to Render and the login cookie stays first-party.
