# Event Booking System API

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

