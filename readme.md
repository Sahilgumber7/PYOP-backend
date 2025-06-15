# 📘 Event API Routes

| Method | Endpoint                                 | Description                                  |
|--------|------------------------------------------|----------------------------------------------|
| POST   | `/api/events`                            | Create a new event                           |
| GET    | `/api/events`                            | Get all events (with optional filters)       |
| GET    | `/api/events/:id`                        | Get details of a specific event              |
| PUT    | `/api/events/:id`                        | Update a specific event                      |
| DELETE | `/api/events/:id`                        | Delete a specific event                      |
| GET    | `/api/events/user/:clerkId`              | Get all events by a specific user            |
| GET    | `/api/events/related/:categoryId/:eventId` | Get related events (same category, exclude one) |

