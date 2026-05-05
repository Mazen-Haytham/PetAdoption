# API Endpoints

## AdminPetPost Controller
**Base Route:** `api/admin/pets`

### `GET /api/admin/pets`
**Action:** GetPets
**Response:** `IActionResult`

### `PUT /api/admin/pets/approve/{id}`
**Action:** Approve
**Route Params:**
  - `int id`
**Response:** `IActionResult`

### `PUT /api/admin/pets/reject/{id}`
**Action:** Reject
**Route Params:**
  - `int id`
**Response:** `IActionResult`

## AdminUsers Controller
**Base Route:** `api/admin/users`

### `GET /api/admin/users`
**Action:** GetUsers
**Response:** `IActionResult`

### `GET /api/admin/users/{id}`
**Action:** GetUserById
**Route Params:**
  - `int id`
**Response:** `IActionResult`

### `PUT /api/admin/users/approve/{id}`
**Action:** ApproveUser
**Route Params:**
  - `int id`
**Response:** `IActionResult`

### `PUT /api/admin/users/reject/{id}`
**Action:** RejectUser
**Route Params:**
  - `int id`
**Response:** `IActionResult`

### `DELETE /api/admin/users/{id}`
**Action:** DeleteUser
**Route Params:**
  - `int id`
**Response:** `IActionResult`

## Pet Controller
**Base Route:** `api/pets`

### `GET /api/pets`
**Action:** GetAvailablePetPosts
**Response:** `IActionResult`

### `GET /api/pets/mine`
**Action:** GetMyPetPosts
**Auth:** Owner/Shelter/Admin
**Response:** `IActionResult`

### `GET /api/pets/{id}`
**Action:** GetPetPostById
**Route Params:**
  - `int id`
**Response:** `IActionResult`

### `GET /api/pets/search`
**Action:** SearchPetPosts
**Query Params:**
  - `PetSearchDto filter`
**Response:** `IActionResult`

### `POST /api/pets`
**Action:** CreatePet
**Other Params:**
  - `[FromForm] CreatePetDto dto`
**Response:** `IActionResult`

### `PUT /api/pets/{id}`
**Action:** UpdatePetPost
**Route Params:**
  - `int id`
**Request Body:** `UpdatePetDto dto`
**Response:** `IActionResult`

### `DELETE /api/pets/{id}`
**Action:** DeletePet
**Route Params:**
  - `int id`
**Response:** `IActionResult`

## Home Controller
**Base Route:** `api/Test`

### `GET /api/Test`
**Action:** Get
**Response:** `IActionResult`

## Request Controller
**Base Route:** `api/adoptions`

### `POST /api/adoptions`
**Action:** Create
**Request Body:** `CreateAdoptionRequestDto dto`
**Response:** `IActionResult`

### `GET /api/adoptions/received`
**Action:** Received
**Response:** `IActionResult`

### `GET /api/adoptions/my`
**Action:** My
**Response:** `IActionResult`

### `GET /api/adoptions/history`
**Action:** History
**Response:** `IActionResult`

### `PUT /api/adoptions/{id}/accept`
**Action:** AcceptRequest
**Route Params:**
  - `int id`
**Response:** `IActionResult`

### `PUT /api/adoptions/{id}/reject`
**Action:** RejectRequest
**Route Params:**
  - `int id`
**Response:** `IActionResult`

## Auth Controller
**Base Route:** `api/auth`

### `POST /api/auth/register`
**Action:** Register
**Other Params:**
  - `RegisterRequest request`
**Response:** `IActionResult`

### `POST /api/auth/login`
**Action:** Login
**Other Params:**
  - `LoginRequest request`
**Response:** `ActionResult<string`

### `POST /api/auth/refresh-token`
**Action:** RefreshToken
**Other Params:**
  - `RefreshTokenRequestDto request`
**Response:** `ActionResult<TokenResponseDto`

### `POST /api/auth/logout`
**Action:** Logout
**Response:** `IActionResult`

