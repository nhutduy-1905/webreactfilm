# 📚 NEXTFLIX - Tài Liệu Dự Án Đầy Đủ

> **Tài liệu này ghi lại toàn bộ quá trình xây dựng, công nghệ, luồng hoạt động, kiến thức cần học, các lỗi gặp phải và cách fix.**
> Viết cho người mới học — giúp bạn hiểu rõ từ A-Z.

---

## 📖 MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Cấu Trúc Thư Mục](#2-cấu-trúc-thư-mục)
3. [Công Nghệ Sử Dụng](#3-công-nghệ-sử-dụng)
4. [Luồng Hoạt Động](#4-luồng-hoạt-động)
5. [Chi Tiết Từng Folder](#5-chi-tiết-từng-folder)
6. [Quá Trình Xây Dựng](#6-quá-trình-xây-dựng)
7. [Các Lỗi Gặp Phải & Cách Fix](#7-các-lỗi-gặp-phải--cách-fix)
8. [Kiến Thức Cần Học](#8-kiến-thức-cần-học)
9. [Hướng Dẫn Chạy Dự Án](#9-hướng-dẫn-chạy-dự-án)
10. [Câu Hỏi Hay Hỏi AI Để Fix Lỗi](#10-câu-hỏi-hay-hỏi-ai-để-fix-lỗi)

---

## 1. Tổng Quan Dự Án

### Nextflix là gì?
Nextflix là một ứng dụng **streaming phim** (clone Netflix) gồm 3 phần riêng biệt:

| Phần | Mô tả | Port |
|------|--------|------|
| **backend/** | API server xử lý dữ liệu phim (CRUD) | `localhost:5000` |
| **web/** | Giao diện người dùng xem phim | `localhost:3000` |
| **admin/** | Giao diện quản trị viên quản lý phim | `localhost:3001` |

### Tại sao tách thành 3 folder?
- **Tách biệt trách nhiệm (Separation of Concerns):** Mỗi phần làm 1 việc riêng
- **Dễ bảo trì:** Sửa admin không ảnh hưởng web
- **Dễ scale:** Có thể deploy backend lên 1 server riêng, web lên server khác
- **Team work:** Nhiều người cùng làm, mỗi người 1 folder, ít conflict

---

## 2. Cấu Trúc Thư Mục

```
D:\Nextflix\
├── package.json          ← File gốc, chứa script chạy nhanh
├── README.md
├── DOCUMENTATION.md      ← File bạn đang đọc
│
├── backend/              ← 🟢 API Server (Express.js)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env              ← DATABASE_URL
│   ├── prisma/
│   │   └── schema.prisma ← Định nghĩa cấu trúc database
│   └── src/
│       ├── index.ts      ← Entry point - khởi tạo Express server
│       ├── prisma.ts     ← Kết nối Prisma Client (singleton)
│       ├── swagger.ts    ← Cấu hình Swagger API docs
│       ├── seed.ts       ← Script thêm 24 phim mẫu
│       ├── cleanup.ts    ← Script xóa dữ liệu cũ
│       └── routes/
│           └── movies.ts ← Tất cả API endpoints cho Movie
│
├── web/                  ← 🔵 Frontend người dùng (Next.js)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js    ← Cấu hình Next.js + proxy rewrite
│   ├── .env              ← DATABASE_URL, NEXTAUTH_SECRET
│   ├── prisma/
│   │   └── schema.prisma ← Schema cho auth (User, Account, Session)
│   ├── components/
│   │   ├── Navbar.tsx    ← Thanh điều hướng + Tìm kiếm phim
│   │   ├── Billboard.tsx ← Banner phim nổi bật
│   │   ├── MovieCard.tsx ← Card hiển thị 1 phim
│   │   ├── MovieList.tsx ← Danh sách phim (hàng ngang)
│   │   ├── InfoModal.tsx ← Modal thông tin chi tiết phim
│   │   ├── PlayButton.tsx
│   │   ├── FavoriteButton.tsx
│   │   ├── AccountMenu.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── NavbarItem.tsx
│   │   └── input.tsx
│   ├── hooks/
│   │   ├── useMovieList.ts  ← Hook lấy danh sách phim từ API
│   │   ├── useBillboard.ts ← Hook lấy phim ngẫu nhiên
│   │   ├── useCurrentUser.ts
│   │   ├── useFavorites.ts
│   │   └── useMovie.ts
│   ├── libs/
│   │   ├── prismadb.ts   ← Prisma Client singleton
│   │   ├── fetcher.ts    ← SWR fetcher function
│   │   └── serverAuth.ts ← Xác thực server-side
│   ├── pages/
│   │   ├── _app.tsx      ← App wrapper (Redux Provider)
│   │   ├── index.tsx     ← Trang chủ
│   │   ├── auth.tsx      ← Trang đăng nhập/đăng ký
│   │   ├── profiles.tsx  ← Trang chọn profile
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth].ts ← NextAuth cấu hình
│   │   │   ├── current.ts
│   │   │   ├── register.ts
│   │   │   ├── random.ts
│   │   │   ├── favorite.ts
│   │   │   ├── favorites.ts
│   │   │   └── deletefavorite.ts
│   │   └── watch/
│   │       └── [movieId].tsx ← Trang xem phim
│   ├── store/
│   │   ├── index.ts      ← Redux store config
│   │   ├── movies.ts     ← Movie slice (state management)
│   │   └── profile.ts    ← Profile slice
│   └── styles/
│       └── globals.css   ← Tailwind CSS
│
└── admin/                ← 🟡 Admin Panel (Next.js + Ant Design)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── .env.local        ← NEXT_PUBLIC_API_URL
    ├── lib/
    │   └── api.ts        ← Axios client + Movie API functions
    ├── components/
    │   ├── AdminLayout.tsx ← Layout có sidebar + header
    │   └── MovieForm.tsx   ← Form tạo/sửa phim
    ├── pages/
    │   ├── _app.tsx
    │   ├── index.tsx     ← Redirect đến /movies
    │   └── movies/
    │       ├── index.tsx  ← Danh sách phim (bảng)
    │       ├── create.tsx ← Tạo phim mới
    │       └── [id].tsx   ← Sửa phim
    └── styles/
        └── globals.css
```

---

## 3. Công Nghệ Sử Dụng

### 3.1 Backend

| Công nghệ | Vai trò | Tại sao chọn? |
|-----------|---------|---------------|
| **Node.js** | Runtime chạy JavaScript phía server | Phổ biến, nhanh, cùng ngôn ngữ với frontend |
| **Express.js** | Web framework | Nhẹ, linh hoạt, dễ học, nhiều middleware |
| **TypeScript** | Ngôn ngữ lập trình | Có kiểu dữ liệu, bắt lỗi sớm, IntelliSense tốt |
| **Prisma** | ORM (Object-Relational Mapping) | Dễ dùng hơn Mongoose, type-safe, auto-generate client |
| **MongoDB** | Database NoSQL | Linh hoạt schema, lưu JSON tự nhiên, miễn phí |
| **Swagger** | API Documentation | Tự động tạo docs, test API trực tiếp trên trình duyệt |
| **CORS** | Cross-Origin Resource Sharing | Cho phép web (port 3000) gọi backend (port 5000) |
| **ts-node-dev** | Dev server | Auto-restart khi code thay đổi |

### 3.2 Web (Frontend)

| Công nghệ | Vai trò | Tại sao chọn? |
|-----------|---------|---------------|
| **Next.js 13** | React framework | SSR, file-based routing, API routes, rewrites |
| **React 18** | UI library | Component-based, Virtual DOM, hooks |
| **TypeScript** | Ngôn ngữ | Type safety |
| **Tailwind CSS** | CSS framework | Utility-first, nhanh, không cần viết CSS file riêng |
| **NextAuth v4** | Authentication | Đăng nhập (credentials, Google, GitHub), JWT session |
| **SWR** | Data fetching | Cache, revalidate, loading state tự động |
| **Redux Toolkit** | State management | Quản lý state phim, modal, profile toàn app |
| **Prisma** | ORM | Truy vấn User, Account cho auth |
| **Axios/Fetch** | HTTP client | Gọi API |

### 3.3 Admin

| Công nghệ | Vai trò | Tại sao chọn? |
|-----------|---------|---------------|
| **Next.js 13** | React framework | Tái sử dụng kiến thức từ web |
| **Ant Design 5** | UI component library | Có sẵn Table, Form, Menu, DatePicker... chuyên nghiệp |
| **Axios** | HTTP client | Gọi API đến backend, interceptors, error handling |
| **Day.js** | Xử lý ngày tháng | Nhẹ hơn Moment.js, format ngày Việt Nam |

### 3.4 Database

| Công nghệ | Chi tiết |
|-----------|----------|
| **MongoDB** | Database NoSQL, lưu dạng document (JSON) |
| **Database name** | `netflix` |
| **Connection** | `mongodb://localhost:27017/netflix` |
| **Collections** | User, Account, Session, VerificationToken, Movie |

---

## 4. Luồng Hoạt Động

### 4.1 Kiến trúc tổng quan

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │     │   Browser    │     │    Browser      │
│  (User xem  │     │ (Admin quản  │     │ (Swagger Test)  │
│    phim)    │     │   lý phim)   │     │                 │
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘
       │                   │                      │
       │ :3000             │ :3001                │ :5000/api-docs
       ▼                   │                      │
┌──────────────┐           │                      │
│   Web App    │           │                      │
│  (Next.js)   │           │                      │
│              │           │                      │
│  ┌────────┐  │           │                      │
│  │NextAuth│  │           │                      │
│  │(Auth)  │  │           │                      │
│  └───┬────┘  │           │                      │
│      │       │           │                      │
│  ┌───▼────┐  │           ▼                      │
│  │Rewrite │──┼──► ┌──────────────┐ ◄────────────┘
│  │Proxy   │  │    │   Backend    │
│  └────────┘  │    │ (Express.js) │
└──────────────┘    │              │
                    │  ┌────────┐  │
                    │  │ Routes │  │
                    │  │/movies │  │
                    │  └───┬────┘  │
                    │      │       │
                    │  ┌───▼────┐  │
                    │  │ Prisma │  │
                    │  │  ORM   │  │
                    │  └───┬────┘  │
                    └──────┼───────┘
                           │
                    ┌──────▼───────┐
                    │   MongoDB    │
                    │   :27017     │
                    │              │
                    │  ┌────────┐  │
                    │  │ Movie  │  │
                    │  │ User   │  │
                    │  │Account │  │
                    │  │Session │  │
                    │  └────────┘  │
                    └──────────────┘
```

### 4.2 Luồng người dùng xem phim (Web)

```
1. User vào localhost:3000
   │
2. ├─ Chưa đăng nhập? → Redirect đến /auth (trang login)
   │   ├─ Đăng ký → POST /api/register → Prisma tạo User
   │   └─ Đăng nhập → NextAuth credentials → So sánh bcrypt password
   │       └─ Thành công → Tạo JWT token → redirect /profiles
   │
3. ├─ Đã đăng nhập → getServerSession kiểm tra JWT
   │
4. Trang chủ (index.tsx):
   │   ├─ useMovieList() → SWR fetch GET /api/movies?status=published&limit=50
   │   │   └─ Next.js rewrite proxy → Backend :5000/api/movies
   │   │       └─ Backend query Prisma → MongoDB → Trả về {data, pagination}
   │   │           └─ Hook extract: data?.data || data || []
   │   │
   │   ├─ Redux dispatch(movieActions.updateMovieList(movies))
   │   │   └─ Lưu vào Redux store → Các component dùng useAppSelector
   │   │
   │   ├─ <Billboard /> → Lấy random movie từ Redux store
   │   ├─ <MovieList /> → Render danh sách MovieCard
   │   └─ <InfoModal /> → Hiện khi click vào MovieCard
   │
5. Tìm kiếm phim (Navbar):
   │   ├─ Click icon Search → Mở input
   │   ├─ Gõ tên phim → debounce 300ms
   │   ├─ GET /api/movies/search?q=... → Backend tìm theo title
   │   └─ Hiện dropdown kết quả → Click → Chuyển đến /watch/[movieId]
   │
6. Xem phim (/watch/[movieId]):
       └─ Lấy movie từ Redux store → Render <video> tag
```

### 4.3 Luồng admin quản lý phim

```
1. Admin vào localhost:3001
   │
2. Redirect đến /movies (danh sách phim)
   │
3. Trang danh sách (/movies):
   │   ├─ Component <AdminLayout> render sidebar + header
   │   ├─ Gọi movieApi.getAll() → Axios GET http://localhost:5000/api/movies
   │   ├─ Ant Design <Table> render dữ liệu với columns:
   │   │   Poster | Mã phim | Tên phim | Đạo diễn | Thời lượng | Trạng thái | Ngày tạo | Thao tác
   │   ├─ Toolbar: Input tìm kiếm + Select trạng thái + Select thể loại
   │   └─ Dropdown thao tác: Sửa | Xuất bản | Nháp | Ẩn | Xóa
   │
4. Tạo phim mới (/movies/create):
   │   ├─ <MovieForm> với 2 cột:
   │   │   Trái: Thông tin chung (title, code, slug, studio, director, description, cast) + Media URLs
   │   │   Phải: Phân loại (status, categories, ageRating, tags, releaseDate) + Thông số phát (duration, language, subtitles)
   │   ├─ Nhập title → Auto-generate slug
   │   ├─ Submit → movieApi.create() → POST http://localhost:5000/api/movies
   │   │   └─ Backend auto-generate code (MOV-xxxx) + slug
   │   └─ Thành công → Redirect /movies
   │
5. Sửa phim (/movies/[id]):
   │   ├─ movieApi.getById(id) → GET /api/movies/:id
   │   ├─ Load dữ liệu vào <MovieForm initialValues={movie}>
   │   ├─ Submit → movieApi.update(id, data) → PATCH /api/movies/:id
   │   └─ Thành công → Redirect /movies
   │
6. Thay đổi trạng thái:
       ├─ movieApi.updateStatus(id, 'published') → PATCH /api/movies/:id/status
       └─ Xóa (soft delete) → movieApi.delete(id) → DELETE /api/movies/:id → Chuyển status='hidden'
```

### 4.4 Luồng API Backend chi tiết

```
Request đến Express server (:5000)
  │
  ├─ Middleware:
  │   ├─ cors() → Kiểm tra origin (cho phép :3000 và :3001)
  │   ├─ express.json() → Parse request body thành JSON
  │   └─ swagger-ui → Serve /api-docs
  │
  ├─ Router /api/movies:
  │   │
  │   ├─ GET /                → Danh sách phim (phân trang)
  │   │   Query params: page, limit, status, category, search, sort, order
  │   │   Response: { data: Movie[], pagination: { total, page, limit, totalPages } }
  │   │
  │   ├─ GET /random          → 1 phim ngẫu nhiên (status=published)
  │   │
  │   ├─ GET /search?q=...    → Tìm phim theo title (case-insensitive)
  │   │
  │   ├─ GET /:id             → Chi tiết 1 phim theo ID
  │   │
  │   ├─ POST /               → Tạo phim mới (auto code + slug)
  │   │
  │   ├─ PATCH /:id           → Cập nhật phim
  │   │
  │   ├─ DELETE /:id          → Soft delete (chuyển status='hidden')
  │   │
  │   └─ PATCH /:id/status    → Thay đổi trạng thái (draft/published/hidden)
  │
  └─ Response qua helper withGenre():
      → Thêm field `genre` (backward compatible) = categories.join(', ')
      → Convert `duration` thành string (cho web cũ)
```

### 4.5 Cách Web proxy đến Backend (Next.js Rewrites)

```javascript
// web/next.config.js
async rewrites() {
  return [
    {
      source: '/api/movies/:path*',        // Khi web gọi /api/movies/...
      destination: 'http://localhost:5000/api/movies/:path*',  // → Proxy đến backend
    },
  ];
}
```

**Giải thích:**
- Web chạy ở `:3000`, Backend ở `:5000`
- Khi web fetch `/api/movies?status=published` → Next.js tự chuyển tiếp đến `localhost:5000/api/movies?status=published`
- User/browser không biết có backend riêng → Tất cả trông như 1 server duy nhất
- **LƯU Ý:** Các route `/api/auth/*`, `/api/register`, `/api/random`, v.v. KHÔNG bị proxy → vẫn do web xử lý trực tiếp qua Prisma

---

## 5. Chi Tiết Từng Folder

### 5.1 Backend - API Server

#### Movie Schema (Cấu trúc dữ liệu phim)

```prisma
model Movie {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId()
  code         String   @unique    // MOV-0001, MOV-0002, ... (tự động tạo)
  title        String              // "Lật Mặt 7: Một Điều Ước"
  slug         String   @unique    // "lat-mat-7-mot-dieu-uoc" (tự động từ title)
  description  String              // Mô tả phim
  studio       String?             // "Galaxy Studio" (? = không bắt buộc)
  director     String?             // "Trấn Thành"
  cast         String[]            // ["Trấn Thành", "Lý Hải"] (mảng)
  categories   String[]            // ["Hài", "Gia đình"] (mảng thể loại)
  status       String   @default("draft")  // "draft" | "published" | "hidden"
  ageRating    String?             // "P", "T13", "T16", "T18", "C"
  releaseDate  DateTime?           // Ngày phát hành
  duration     Int      @default(0) // Thời lượng (phút) - SỐ NGUYÊN
  language     String[]            // ["Tiếng Việt", "Tiếng Anh"]
  subtitles    String[]            // ["Tiếng Việt", "Tiếng Anh"]
  posterUrl    String?             // URL ảnh poster
  backdropUrl  String?             // URL ảnh backdrop
  trailerUrl   String?             // URL trailer
  videoUrl     String?             // URL video đầy đủ
  thumbnailUrl String?             // URL thumbnail nhỏ
  tags         String[]            // ["phim-viet", "hai", "hot-2024"]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

#### Swagger API Docs
- Truy cập: `http://localhost:5000/api-docs`
- Mô tả tất cả endpoints, request/response schema
- Có thể **test API trực tiếp** trên trình duyệt (Try it out)

### 5.2 Web - Các khái niệm quan trọng

#### SWR (stale-while-revalidate)
```typescript
// hooks/useMovieList.ts
const { data, error, isLoading } = useSwr('/api/movies?status=published&limit=50', fetcher, {
  revalidateIfStale: false,      // Không fetch lại nếu data còn mới
  revalidateOnFocus: false,      // Không fetch lại khi tab focus
  revalidateOnReconnect: false,  // Không fetch lại khi reconnect
});

// Backend trả về: { data: [...movies], pagination: {...} }
const movies = data?.data || data || [];
// → data?.data: Lấy mảng phim từ response mới (paginated)
// → data: Fallback nếu API trả về mảng trực tiếp
// → []: Fallback nếu chưa có data
```

#### Redux Toolkit
```typescript
// store/movies.ts - Quản lý state phim toàn app
const movieSlice = createSlice({
  name: 'movies',
  initialState: { movies: [], showModal: false, movie: [...] },
  reducers: {
    updateMovieList: (state, action) => { state.movies = action.payload },
    showModal: (state, action) => { state.showModal = true; state.movie = action.payload },
    hideModal: (state) => { state.showModal = false },
  },
});
```

#### NextAuth Authentication
```typescript
// pages/api/auth/[...nextauth].ts
// Xử lý đăng nhập bằng email/password
CredentialsProvider({
  credentials: { email, password },
  authorize: async (credentials) => {
    // 1. Tìm user trong DB bằng Prisma
    // 2. So sánh password bằng bcrypt.compare()
    // 3. Đúng → trả về user object → NextAuth tạo JWT
    // 4. Sai → throw Error
  }
})
```

### 5.3 Admin - Ant Design Components

| Component | Dùng để | Ví dụ |
|-----------|---------|-------|
| `<Layout>` + `<Sider>` | Tạo layout 2 cột (sidebar + content) | AdminLayout.tsx |
| `<Menu>` | Sidebar navigation | Quản lý phim, Thể loại, ... |
| `<Table>` | Bảng dữ liệu có pagination | Danh sách phim |
| `<Form>` + `<Form.Item>` | Form nhập liệu | MovieForm.tsx |
| `<Select mode="multiple">` | Chọn nhiều giá trị | Thể loại, ngôn ngữ |
| `<DatePicker>` | Chọn ngày | Ngày phát hành |
| `<Tag>` | Nhãn trạng thái | Draft (xám), Published (xanh), Hidden (đỏ) |
| `<Dropdown>` | Menu thả xuống | Thao tác: Sửa, Xóa, Xuất bản |
| `<Breadcrumb>` | Đường dẫn | Trang chủ > Quản lý phim > Tất cả |
| `<message>` | Thông báo | "Tạo phim thành công!" |

---

## 6. Quá Trình Xây Dựng

### Giai đoạn 1: Dự án ban đầu (Monolith)
- **Cấu trúc:** 1 folder duy nhất, Next.js xử lý cả frontend + API
- **Vấn đề:** API routes nằm trong `pages/api/`, không tách riêng backend
- **Database:** MongoDB với Prisma, schema Movie cũ (chỉ có title, description, videoUrl, thumbnailUrl, genre, duration)

### Giai đoạn 2: Fix lỗi cơ bản
- Fix auth loading states (trang trắng khi chờ auth)
- Fix API trả về JSON sai format
- Fix `useCurrentUser` infinite retry
- Fix redirect loops (login → home → login → ...)
- Fix infinite loading trên trang chủ
- Seed 6 phim mẫu vào MongoDB

### Giai đoạn 3: Tách 3 folder (Hiện tại - Phase 1)

**Bước 1: Tạo cấu trúc thư mục**
```
mkdir backend, web, admin
```

**Bước 2: Copy web files**
- Copy tất cả source code hiện có vào `web/`
- Tạo `web/package.json`, `.env`, `prisma/schema.prisma`

**Bước 3: Tạo Backend**
1. `backend/package.json` với Express, Prisma, Swagger
2. `backend/prisma/schema.prisma` với Movie schema mới (~20 fields)
3. `backend/src/index.ts` - Express server
4. `backend/src/routes/movies.ts` - CRUD API
5. `backend/src/swagger.ts` - API documentation
6. `backend/src/seed.ts` - 24 phim mẫu

**Bước 4: Tạo Admin**
1. `admin/package.json` với Next.js, Ant Design
2. `admin/lib/api.ts` - Axios client
3. `admin/components/AdminLayout.tsx` - Layout + Sidebar
4. `admin/components/MovieForm.tsx` - Form 2 cột
5. `admin/pages/movies/index.tsx` - Bảng danh sách
6. `admin/pages/movies/create.tsx` - Trang tạo
7. `admin/pages/movies/[id].tsx` - Trang sửa

**Bước 5: Fix imports trong Web**
- Tất cả file API dùng `import prismadb from '...'` (default import)
- Nhưng `prismadb.ts` export `export const prisma` (named export)
- → Fix tất cả thành `import {prisma} from '...'`
- → Thay `prismadb.xxx` thành `prisma.xxx`

**Bước 6: Cấu hình proxy**
- Web `next.config.js` thêm `rewrites()` để proxy `/api/movies/*` → backend

**Bước 7: Update Web hooks**
- `useMovieList.ts` xử lý response mới (paginated)
- `store/movies.ts` interface thêm fields mới
- `Navbar.tsx` thêm search bar

**Bước 8: Install + Run**
```bash
cd backend && npm install && npx prisma generate && npx prisma db push && npm run seed
cd web && npm install && npx prisma generate
cd admin && npm install
```

---

## 7. Các Lỗi Gặp Phải & Cách Fix

### 7.1 Import sai kiểu (Default vs Named export)

**Lỗi:**
```
TypeError: prismadb.user.findUnique is not a function
```

**Nguyên nhân:**
```typescript
// prismadb.ts export NAMED:
export const prisma = new PrismaClient();

// Nhưng các file import DEFAULT:
import prismadb from './prismadb';  // ❌ prismadb = undefined
```

**Fix:**
```typescript
import { prisma } from './prismadb';  // ✅ Named import
```

**Bài học:**
- `export default X` → `import X from '...'` (tên gì cũng được)
- `export const X` → `import { X } from '...'` (phải đúng tên)
- Kiểm tra file gốc xem dùng `export default` hay `export const`

---

### 7.2 Prisma schema push lỗi DuplicateKey

**Lỗi:**
```
Error: E11000 duplicate key error collection: netflix.Movie index: Movie_code_key dup key: { code: null }
```

**Nguyên nhân:**
- Schema mới thêm field `code` với `@unique`
- Nhưng DB còn phim cũ KHÔNG có field `code` → tất cả = `null`
- MongoDB không cho phép nhiều document có cùng `null` trong unique index

**Fix:**
```typescript
// Xóa dữ liệu cũ trước khi push schema
await prisma.movie.deleteMany();
// Rồi mới: npx prisma db push
```

**Bài học:**
- Khi thêm field `@unique` vào schema, dữ liệu cũ phải được xử lý trước
- Hoặc xóa, hoặc migrate (cập nhật giá trị cho field mới)

---

### 7.3 Next.js API routes conflict với rewrites

**Lỗi:** Web có file `pages/api/movies/index.ts` → Next.js xử lý route này trước rewrite

**Nguyên nhân:**
- Next.js ưu tiên: API routes > rewrites
- File `pages/api/movies/index.ts` "chặn" rewrite đến backend

**Fix:**
```bash
# Xóa web's own movie API routes
rm -rf web/pages/api/movies/
```

**Bài học:**
- Next.js rewrites chỉ hoạt động khi KHÔNG có API route trùng path
- Nếu muốn proxy, phải xóa/không tạo API route cùng đường dẫn

---

### 7.4 PowerShell `$disconnect` bị parse lỗi

**Lỗi:**
```
The variable '$disconnect' cannot be retrieved because it has not been set.
```

**Nguyên nhân:**
- PowerShell thấy `$disconnect` và nghĩ đó là biến PowerShell
- Nhưng thực tế đó là method name của Prisma: `prisma.$disconnect()`

**Fix:**
- Viết code vào file `.ts` riêng thay vì dùng inline trong terminal
- Hoặc escape: `` prisma.`$disconnect`() ``

**Bài học:**
- PowerShell parse `$xxx` thành biến → dùng file script thay vì inline khi có ký tự đặc biệt

---

### 7.5 Infinite loading trên trang chủ

**Lỗi:** Trang chủ hiện loading gif mãi, không hiện phim

**Nguyên nhân:**
```tsx
// index.tsx kiểm tra:
if (moviesList.length === 0) {
  return <Loading />  // ← Nếu API trả rỗng → loading mãi
}
```
Kết hợp:
- `useMovieList` fetch API nhưng không xử lý response format mới
- Backend trả `{ data: [...], pagination: {...} }` thay vì mảng

**Fix:**
```typescript
// useMovieList.ts
const movies = data?.data || data || [];  // Extract mảng từ paginated response
```

**Bài học:**
- Khi API thay đổi format response → phải update tất cả nơi consume
- Log ra `console.log(data)` để xem format thực tế

---

### 7.6 NextAuth redirect loop

**Lỗi:** Login thành công → redirect /profiles → redirect /auth → loop

**Nguyên nhân:**
- `getServerSideProps` kiểm tra session
- NextAuth JWT secret không match → session luôn = null
- → Redirect về /auth mãi

**Fix:**
```typescript
// [...nextauth].ts
export const authOptions = {
  // ...
  secret: process.env.NEXTAUTH_SECRET,  // Phải có trong .env
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      // Phải return session, nếu không session = undefined
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};
```

**Bài học:**
- NextAuth cần `NEXTAUTH_SECRET` trong `.env`
- Callbacks phải return giá trị đúng
- Debug: check browser DevTools → Network → xem response của `/api/auth/session`

---

### 7.7 CORS error khi admin gọi backend

**Lỗi:**
```
Access-Control-Allow-Origin header is missing
```

**Nguyên nhân:**
- Backend không cấu hình CORS cho port 3001

**Fix:**
```typescript
// backend/src/index.ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],  // Cho phép cả 2
  credentials: true,
}));
```

**Bài học:**
- CORS là bảo mật của trình duyệt, chặn request cross-origin
- Backend phải khai báo rõ origin nào được phép
- `credentials: true` cho phép gửi cookie

---

### 7.8 Copy file overwrite các thay đổi đã làm

**Lỗi:** Sau khi sửa file trong `web/`, dùng `Copy-Item` để copy thêm file → ghi đè mất code đã sửa

**Nguyên nhân:**
- PowerShell `Copy-Item -Force` ghi đè không hỏi
- Các file đã sửa (next.config.js, useMovieList.ts...) bị thay bằng bản cũ

**Fix:**
- Dùng `multi_replace_string_in_file` để apply lại tất cả thay đổi
- Hoặc: copy trước, sửa sau

**Bài học:**
- **Luôn Git commit trước khi thao tác file lớn**
- Dùng `git diff` để kiểm tra thay đổi
- Dùng `git stash` để lưu tạm thay đổi

---

### 7.9 Move-Item không hoạt động (file locked)

**Lỗi:**
```
The process cannot access the file because it is being used by another process.
```

**Nguyên nhân:**
- VS Code đang mở các file → lock file
- `Move-Item` cần exclusive access

**Fix:**
- Dùng `Copy-Item` thay vì `Move-Item`
- Hoặc đóng VS Code trước khi move

---

## 8. Kiến Thức Cần Học

### 📗 Level 1: Cơ bản (Bắt đầu từ đây)

| STT | Chủ đề | Tài liệu | Thời gian |
|-----|--------|-----------|-----------|
| 1 | **HTML + CSS** | MDN Web Docs | 1-2 tuần |
| 2 | **JavaScript cơ bản** | javascript.info | 2-3 tuần |
| 3 | **TypeScript** | typescriptlang.org/docs | 1 tuần |
| 4 | **Git cơ bản** | git-scm.com/book | 3-5 ngày |
| 5 | **Terminal/PowerShell** | Các lệnh cơ bản: cd, ls, mkdir | 2 ngày |

### 📘 Level 2: Frontend

| STT | Chủ đề | Tài liệu | Thời gian |
|-----|--------|-----------|-----------|
| 1 | **React** (Components, Props, State, Hooks) | react.dev | 2-3 tuần |
| 2 | **Next.js** (Pages Router, API Routes, SSR) | nextjs.org/docs | 1-2 tuần |
| 3 | **Tailwind CSS** | tailwindcss.com/docs | 3-5 ngày |
| 4 | **Redux Toolkit** (createSlice, useSelector, useDispatch) | redux-toolkit.js.org | 1 tuần |
| 5 | **SWR** (data fetching, caching) | swr.vercel.app | 2-3 ngày |

### 📙 Level 3: Backend

| STT | Chủ đề | Tài liệu | Thời gian |
|-----|--------|-----------|-----------|
| 1 | **Node.js** (HTTP, modules, async/await) | nodejs.org/docs | 1 tuần |
| 2 | **Express.js** (routing, middleware, error handling) | expressjs.com | 1 tuần |
| 3 | **MongoDB** (documents, queries, indexes) | mongodb.com/docs | 1 tuần |
| 4 | **Prisma ORM** (schema, queries, migrations) | prisma.io/docs | 1 tuần |
| 5 | **REST API design** (HTTP methods, status codes) | restfulapi.net | 3-5 ngày |
| 6 | **Authentication** (JWT, sessions, bcrypt) | jwt.io + articles | 1 tuần |

### 📕 Level 4: Nâng cao

| STT | Chủ đề | Ghi chú |
|-----|--------|---------|
| 1 | **NextAuth.js** | OAuth providers, JWT, callbacks |
| 2 | **Swagger/OpenAPI** | API documentation tự động |
| 3 | **Ant Design** | Admin panel components |
| 4 | **Docker** | Containerize ứng dụng |
| 5 | **CI/CD** | Deploy tự động |
| 6 | **Testing** | Jest, React Testing Library |

### 🧠 Khái niệm quan trọng cần hiểu

| Khái niệm | Giải thích đơn giản |
|------------|---------------------|
| **SSR** | Server-Side Rendering - server render HTML rồi gửi cho browser |
| **CSR** | Client-Side Rendering - browser tải JS rồi tự render |
| **JWT** | JSON Web Token - chuỗi mã hóa chứa thông tin user, gửi qua header |
| **ORM** | Object-Relational Mapping - viết code thay vì SQL để truy vấn DB |
| **CORS** | Cross-Origin Resource Sharing - cơ chế bảo mật cho request cross-domain |
| **Middleware** | Hàm chạy giữa request và response (VD: kiểm tra auth) |
| **Singleton** | Pattern đảm bảo chỉ có 1 instance duy nhất (VD: Prisma Client) |
| **Proxy/Rewrite** | Chuyển tiếp request đến server khác mà client không biết |
| **Soft Delete** | Không xóa thật, chỉ đổi status thành "hidden" |
| **Debounce** | Chờ user ngừng gõ mới thực hiện (VD: tìm kiếm chờ 300ms) |

---

## 9. Hướng Dẫn Chạy Dự Án

### Yêu cầu hệ thống
- **Node.js** v18+ (khuyến nghị v20+)
- **MongoDB** chạy local trên port 27017
- **npm** (đi kèm Node.js)

### Bước 1: Cài đặt MongoDB
```bash
# Cách 1: Download MongoDB Community Server từ mongodb.com
# Cách 2: Dùng Docker
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Bước 2: Cài dependencies
```bash
# Từ thư mục gốc D:\Nextflix

# Backend
cd backend
npm install
npx prisma generate
npx prisma db push

# Web
cd ../web
npm install
npx prisma generate

# Admin
cd ../admin
npm install
```

### Bước 3: Seed dữ liệu (24 phim mẫu)
```bash
cd backend
npm run seed
```

### Bước 4: Chạy 3 server (mở 3 terminal riêng)

**Terminal 1 - Backend:**
```bash
cd D:\Nextflix\backend
npm run dev
# → Server chạy tại http://localhost:5000
# → Swagger docs: http://localhost:5000/api-docs
```

**Terminal 2 - Web:**
```bash
cd D:\Nextflix\web
npm run dev
# → Web chạy tại http://localhost:3000
```

**Terminal 3 - Admin:**
```bash
cd D:\Nextflix\admin
npm run dev
# → Admin chạy tại http://localhost:3001
```

### Bước 5: Kiểm tra
- Mở browser: `http://localhost:5000/api-docs` → Swagger API docs
- Mở browser: `http://localhost:3001/movies` → Admin panel (danh sách phim)
- Mở browser: `http://localhost:3000` → Web (cần đăng nhập)

### File .env cần thiết

**`backend/.env`:**
```
DATABASE_URL="mongodb://localhost:27017/netflix"
```

**`web/.env`:**
```
DATABASE_URL="mongodb://localhost:27017/netflix"
NEXTAUTH_SECRET="nextflix-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

**`admin/.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 10. Câu Hỏi Hay Hỏi AI Để Fix Lỗi

Khi gặp lỗi, cách đặt câu hỏi cho AI (ChatGPT, Copilot) rất quan trọng. Dưới đây là template:

### Template hỏi AI cơ bản
```
Tôi gặp lỗi [LỖI GÌ] khi [LÀM GÌ].

Công nghệ: [Next.js / Express / Prisma / ...]
File liên quan: [tên file]
Code:
[paste đoạn code gây lỗi]

Error message:
[paste full error]

Tôi đã thử: [cách bạn đã thử]
```

### Các câu hỏi mẫu hay dùng

**Về lỗi import:**
```
"Tôi import { prisma } from './prismadb' nhưng bị 'undefined'. File prismadb.ts
export default client. Sửa sao?"
```

**Về lỗi API:**
```
"API /api/movies trả về { data: [...], pagination: {...} } nhưng component
expect mảng trực tiếp. Cách handle response format mới?"
```

**Về lỗi database:**
```
"Prisma db push lỗi 'E11000 duplicate key error' khi thêm @unique vào field
'code' mà data cũ không có field này. Xử lý sao?"
```

**Về lỗi CORS:**
```
"Frontend port 3001 gọi API port 5000 bị CORS error. Backend dùng Express.
Cấu hình CORS cho 2 origins?"
```

**Về lỗi auth:**
```
"NextAuth redirect loop: login thành công → redirect /profiles → redirect /auth.
getServerSession return null. Dùng JWT strategy. Fix sao?"
```

**Về architecture:**
```
"Tôi có 1 Next.js app muốn tách backend riêng bằng Express. Web cần proxy
API requests đến backend. Config Next.js rewrites như nào?"
```

### Tips khi hỏi AI

1. **Paste full error message** - Đừng tóm tắt, AI cần thấy stack trace đầy đủ
2. **Cho biết công nghệ + version** - "Next.js 13.3.1" chứ không chỉ "Next.js"
3. **Cho biết đã thử gì** - Tránh AI gợi ý cách bạn đã thử rồi
4. **Paste code liên quan** - Không chỉ dòng lỗi mà cả file/function chứa nó
5. **Mô tả expected vs actual** - "Tôi mong đợi A nhưng nhận được B"
6. **Khi fix xong, hỏi tại sao** - "Tại sao cách này fix được? Giải thích cho người mới"

---

## 📝 GHI CHÚ CUỐI

### Dữ liệu mẫu
- **24 phim** đã được seed: 21 published, 2 draft, 1 hidden
- Bao gồm phim Việt (Lật Mặt 7, Mai, Bố Già...) và quốc tế (Avengers, Dune, Oppenheimer...)
- Mỗi phim có đầy đủ: code, title, slug, description, cast, categories, duration, language, subtitles, URLs

### Backward Compatibility (Tương thích ngược)
- Schema **mới** có `categories[]` (mảng) + `duration` (Int)
- Schema **cũ** có `genre` (string) + `duration` (string)
- Backend API tự thêm `genre = categories.join(', ')` vào response
- → Web cũ dùng `data.genre` và `data.duration` vẫn hoạt động bình thường

### Những gì chưa làm (Phase 2+)
- [ ] Authentication cho admin (hiện ai cũng vào được)
- [ ] Upload file thay vì nhập URL
- [ ] Quản lý thể loại riêng (CRUD categories)
- [ ] Quản lý diễn viên riêng
- [ ] Quản lý banner trang chủ
- [ ] Deploy lên server thật (Vercel + Railway/Render)
- [ ] Docker containerization
- [ ] Unit tests + Integration tests
- [ ] CI/CD pipeline
- [ ] Responsive design hoàn chỉnh cho admin
- [ ] Trang xem phim cải tiến (player controls, quality options)
- [ ] Thống kê, dashboard cho admin

---

> **Tài liệu này được tạo ngày 12/02/2026**
> **Tác giả: AI Assistant (GitHub Copilot) + Developer**
