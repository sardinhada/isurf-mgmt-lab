# API Endpoints

**Base URL:** `http://localhost:3000`

---

### `GET /api`
Health check. Returns `{ status: "ok", message: "Hello, world" }`.

---

### `GET /api/socios`
List socios with pagination, fuzzy search, and status filters.

**Query params:**

| Param | Values | Default |
|---|---|---|
| `page` | integer | 1 |
| `limit` | integer (max 100) | 10 |
| `search` | string | — |
| `state` | `all` `active` `inactive` `suspended` | all |
| `payment` | `all` `paid` `due` | all |
| `board_store` | `all` `yes` `no` | all |
| `utilization` | `all` `yes` `no` | all |
| `surf_lessons` | `all` `yes` `no` | all |

**Response:** `{ socios: [...], total, page, limit }`

---

### `POST /api/socios`
Create a new socio.

**Body:** `name` and `email` required; `phone`, `address`, `ncc`, `nif`, `birth_date`, `postal_code`, `observacoes` optional.

**Response:** the created socio. Returns `409` if email already exists.

---

### `GET /api/socios/:id`
Get a single socio and their membership status.

**Response:** `{ socio: {...}, status: {...} | null }`

Returns `404` if not found.

---

### `PATCH /api/socios/:id`
Partial update of a socio, their membership status, and monthly payment records. All fields optional. Runs in a single transaction.

**Body fields:**

- **Socio:** `name`, `email`, `phone`, `address`, `ncc`, `nif`, `birth_date`, `postal_code`, `observacoes`
- **Status:** `status`, `paid_until`, `board_store`, `utilization`, `surf_lessons`
- **Monthly payments:** `monthly_payments: [{ product, year, month, paid }]` — `product` must be `board_store` or `utilization`

**Business rules enforced:**
- Setting `status` to `inactive` or `suspended` automatically strips `board_store`, `utilization`, and `surf_lessons`.
- `surf_lessons` does not support monthly payment records — passing it in `monthly_payments` returns `422`.

**Response:** `{ socio: {...}, status: {...} | null }` reflecting the final state after all rules are applied.

Returns `404` if not found, `422` if an invalid product is passed in `monthly_payments`.
