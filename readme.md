

---

## 📂 Category Routes (`/api/categories`)

| Method | Endpoint         | Description                   |
|--------|------------------|-------------------------------|
| GET    | `/`              | Fetch all available categories. |

---

## 🎟️ Event Routes (`/api/events`)

| Method | Endpoint                                | Description                                                                 |
|--------|-----------------------------------------|-----------------------------------------------------------------------------|
| POST   | `/`                                     | Create a new event.                                                         |
| GET    | `/`                                     | Fetch all events. Optional query parameters can be used for filtering.     |
| GET    | `/:id`                                  | Fetch details of a single event by its ID.                                 |
| GET    | `/user/:userId`                         | Fetch all events created by a specific user (organizer).                   |
| GET    | `/related/:categoryId/:eventId`         | Fetch related events in the same category, excluding the current event.    |

---

## 🛒 Order Routes (`/api/orders`)

| Method | Endpoint                                  | Description                                                                 |
|--------|-------------------------------------------|-----------------------------------------------------------------------------|
| POST   | `/`                                       | Create a new order.                                                         |
| GET    | `/user/:clerkId`                          | Fetch all orders made by a specific user (using Clerk ID).                 |
| GET    | `/:orderId/user/:clerkId`                 | Fetch details of a specific order by ID for a given user.                  |
| GET    | `/:orderId`                               | Fetch detailed information about a specific order.                         |

---

## 👤 User Routes (`/api/users`)

| Method | Endpoint           | Description                                  |
|--------|--------------------|----------------------------------------------|
| GET    | `/:clerkId`        | Fetch user details using their Clerk ID.    |

---

### 📝 Notes
- All endpoints are prefixed with `/api`.
- Authentication and authorization middleware should be applied where necessary (not shown in this doc).
- Use appropriate request bodies and query parameters for filtering, pagination, or additional functionality.

---

### Example Base URLs
- Local development: `http://localhost:5000/api`
- Production: `https://yourdomain.com/api`

---


