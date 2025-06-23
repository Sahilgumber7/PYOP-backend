
---

## 📅 Event Routes

| Method | Endpoint                                          | Description                          | Requires Auth |
|--------|---------------------------------------------------|--------------------------------------|---------------|
| POST   | `/events`                                         | Create a new event                   | ✅ Yes        |
| GET    | `/events`                                         | Get all events (with pagination)     | ❌ No         |
| GET    | `/events/:id`                                     | Get event details by ID              | ❌ No         |
| GET    | `/events/user/:clerkId`                           | Get all events created by user       | ✅ Yes        |
| GET    | `/events/related/:categoryId/:eventId`            | Get related events by category       | ❌ No         |

---

## 👤 User Routes

> Note: User registration/login is handled via Clerk. Backend routes typically support syncing or fetching user data.

| Method | Endpoint             | Description                     | Requires Auth |
|--------|----------------------|---------------------------------|---------------|
| GET    | `/users/:clerkId`    | Get user profile by Clerk ID    | ✅ Yes        |


---

## 🔖 Notes

- ✅ **Requires Auth** means the route expects a valid `clerkId` in the request body or URL (handled on frontend).
- 📄 All responses are in JSON format.
- 🕒 `startDateTime` and `endDateTime` are stored as **Unix timestamps (number)** in the backend.
