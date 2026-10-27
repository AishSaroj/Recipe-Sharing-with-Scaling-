# Ladle — recipe sharing with scaling (MERN)

**Setup** (needs Node 18+ and MongoDB running locally or an Atlas URI)

    cp server/.env.example server/.env   # set MONGO_URI and JWT_SECRET
    npm run install:all
    npm run dev                          # API :5000, app :5173

**How scaling works:** each ingredient stores `{ quantity, unit, name, note }` for the recipe's base servings.
The client multiplies by `servings / baseServings` and normalises units and fractions (see `client/src/scale.js`):
3 tsp becomes 1 tbsp, 1200 g becomes 1.2 kg, 0.333 becomes ⅓. Quantities accept `1/2` and `1 1/2` when posting.

**API:** `POST /api/auth/register|login`, `GET /api/auth/me`, `GET/POST /api/recipes`, `GET/PUT/DELETE /api/recipes/:id`,
`GET/POST/DELETE /api/recipes/:id/reviews` (one review per user, can't review your own, average rating kept on the recipe).
