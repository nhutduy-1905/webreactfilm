# TÀI LIỆU DỰ ÁN

## 1. Tổng quan dự án

Dự án `webreactfilm` là hệ thống nền tảng phim/series gồm 3 phần chính trong workspace:

- `web/`: Frontend chính (Next.js + React) cho người dùng cuối.
- `admin/`: Giao diện quản trị (Next.js + React + TypeScript).
- `backend/`: API service (Node.js + TypeScript + Prisma + REST API).

Mục tiêu: cung cấp giao diện xem phim, quản lý nội dung, bình luận, yêu thích, đăng nhập/đăng ký và các chức năng vận hành cho quản trị viên.

## 2. Cấu trúc thư mục (dạng cây đầy đủ)

```text
webreactfilm/
├── admin
│   ├── components
│   │   ├── MovieForm.tsx
│   │   └── AdminLayout.tsx
│   ├── package-lock.json
│   ├── next.config.js
│   ├── pages
│   │   ├── categories.tsx
│   │   ├── comments.tsx
│   │   ├── banners.tsx
│   │   ├── _app.tsx
│   │   ├── users.tsx
│   │   ├── actors.tsx
│   │   ├── settings.tsx
│   │   ├── index.tsx
│   │   ├── movies
│   │   │   ├── create.tsx
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   └── analytics.tsx
│   ├── tsconfig.tsbuildinfo
│   ├── tsconfig.json
│   ├── next-env.d.ts
│   ├── lib
│   │   └── api.ts
│   ├── styles
│   │   └── globals.css
│   └── package.json
├── ERROR-FIXES.md
├── .gitignore
├── Tailieu.md
├── web
│   ├── tsconfig.tsbuildinfo
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── .env
│   ├── public
│   │   ├── vercel.svg
│   │   ├── favicon.ico
│   │   └── images
│   │       ├── poster.png
│   │       ├── favicon.png
│   │       ├── default-blue.png
│   │       ├── logo.png
│   │       ├── loading.gif
│   │       ├── hero.jpg
│   │       ├── thumbnail.jpg
│   │       ├── default-slate.png
│   │       ├── default-red.png
│   │       └── default-green.png
│   ├── global.d.ts
│   ├── styles
│   │   └── globals.css
│   ├── next.config.js
│   ├── next-env.d.ts
│   ├── package.json
│   ├── pages
│   │   ├── profiles.tsx
│   │   ├── films.tsx
│   │   ├── new.tsx
│   │   ├── _app.tsx
│   │   ├── my-list.tsx
│   │   ├── languages.tsx
│   │   ├── watch
│   │   │   └── [movieId].tsx
│   │   ├── api
│   │   │   ├── current.ts
│   │   │   ├── auth
│   │   │   │   └── [...nextauth].ts
│   │   │   ├── deletefavorite.ts
│   │   │   ├── comments
│   │   │   │   ├── [movieId].ts
│   │   │   │   ├── edit.ts
│   │   │   │   ├── like.ts
│   │   │   │   ├── admin.ts
│   │   │   │   ├── reply.ts
│   │   │   │   ├── create.ts
│   │   │   │   └── delete.ts
│   │   │   ├── register.ts
│   │   │   ├── random.ts
│   │   │   ├── movies
│   │   │   │   ├── search.ts
│   │   │   │   ├── filter.ts
│   │   │   │   └── [id].ts
│   │   │   ├── movies.ts
│   │   │   ├── favorite.ts
│   │   │   └── favorites.ts
│   │   ├── index.tsx
│   │   ├── series.tsx
│   │   └── auth.tsx
│   ├── components
│   │   ├── input.tsx
│   │   ├── MovieList.tsx
│   │   ├── CommentSection.tsx
│   │   ├── InfoModal.tsx
│   │   ├── MovieCard.tsx
│   │   ├── FavoriteButton.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── NavbarItem.tsx
│   │   ├── Navbar.tsx
│   │   ├── PlayButton.tsx
│   │   ├── Billboard.tsx
│   │   └── AccountMenu.tsx
│   ├── store
│   │   ├── index.ts
│   │   ├── profile.ts
│   │   └── movies.ts
│   ├── hooks
│   │   ├── useMovieList.ts
│   │   ├── useMovie.ts
│   │   ├── useCurrentUser.ts
│   │   ├── useFavorites.ts
│   │   └── useBillboard.ts
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── libs
│   │   ├── authOptions.ts
│   │   ├── logger.ts
│   │   ├── fetcher.ts
│   │   ├── prismadb.ts
│   │   └── serverAuth.ts
│   └── prisma
│       └── schema.prisma
├── err.md
├── package-lock.json
├── README.md
├── backend
│   ├── package.json
│   ├── prisma
│   │   └── schema.prisma
│   ├── package-lock.json
│   ├── dist
│   │   ├── seed.d.ts
│   │   ├── seed.js
│   │   ├── index.d.ts
│   │   ├── cleanup.d.ts
│   │   ├── prisma.js
│   │   ├── swagger.d.ts
│   │   ├── index.js
│   │   ├── swagger.js
│   │   ├── cleanup.js
│   │   ├── routes
│   │   │   ├── movies.js
│   │   │   ├── comments.d.ts
│   │   │   ├── movies.d.ts
│   │   │   └── comments.js
│   │   └── prisma.d.ts
│   ├── src
│   │   ├── prisma.ts
│   │   ├── index.ts
│   │   ├── swagger.ts
│   │   ├── seed.ts
│   │   ├── routes
│   │   │   ├── comments.ts
│   │   │   └── movies.ts
│   │   └── cleanup.ts
│   ├── tsconfig.json
│   └── .env
└── package.json
```

Ghi chú: cây trên đã bao gồm file ẩn quan trọng (`.env`, `.gitignore`) và loại trừ thư mục phát sinh tự động (`.git/`, `node_modules/`, `.next/`).
## 3. Công nghệ sử dụng

- Frontend Web/Admin: Next.js, React, TypeScript
- Styling: Tailwind CSS (web), Ant Design (admin)
- Backend: Node.js, Express, TypeScript
- ORM/DB: Prisma + MongoDB
- Auth: NextAuth + API auth nội bộ (`serverAuth`)
- Data fetching: SWR + custom hooks
- API docs: Swagger (`backend/src/swagger.ts` + JSDoc route)

## 4. Luồng hoạt động chính

1. Người dùng truy cập web (`web`), frontend render theo route.
2. Frontend gọi API nội bộ (`web/pages/api/*`) hoặc proxy sang backend (`backend`).
3. Backend xử lý nghiệp vụ, đọc/ghi dữ liệu qua Prisma.
4. Kết quả trả JSON về frontend để hiển thị.
5. Admin thao tác CRUD phim/bình luận, dữ liệu cập nhật đồng bộ DB.

## 5. Cách web hoạt động (chi tiết)

- Routing dựa trên file trong `web/pages`.
- Dynamic route ví dụ: `web/pages/watch/[movieId].tsx`.
- Hooks chính:
  - `useMovieList`, `useMovie`, `useFavorites`, `useCurrentUser`, `useBillboard`
- State chính dùng Redux store trong `web/store`.
- API nội bộ trong `web/pages/api` xử lý auth, movies, favorites, comments.

## 6. Các khái niệm quan trọng

- `status` phim: `draft | published | hidden`
- Web người dùng thường chỉ hiển thị phim `published`.
- `favoriteIds` được lưu theo user, liên kết tới `Movie.id`.
- Bình luận có trạng thái `pending/approved/rejected` tùy luồng duyệt.

## 7. Kiến thức quan trọng cho contributors

- Khi đổi schema Prisma:
  1. Sửa `schema.prisma`
  2. `prisma generate`
  3. `prisma push` hoặc migration phù hợp
- Chạy dev tách từng phần:
  - `backend`: `npm run dev`
  - `web`: `npm run dev`
  - `admin`: `npm run dev`
- Luôn kiểm tra console web + backend khi debug.

## 8. Mẫu cách hỏi AI để fix lỗi nhanh

Khi hỏi AI/ghi issue, nên gửi đủ:

- Mô tả lỗi ngắn gọn
- Stack trace đầy đủ
- File liên quan + đoạn code lỗi
- Bước tái hiện
- Phiên bản `node -v`, `npm -v`, hệ điều hành
- Log request/response (nếu lỗi API)
- Các thay đổi gần đây trước khi lỗi xuất hiện

Ví dụ prompt:

> Khi vào `/watch/123` trên web, mình gặp lỗi `TypeError ...`. File liên quan: `web/components/MovieCard.tsx` dòng XX. Đã chạy `npm run dev` cho backend + web. Node vXX. Log backend: ... Hãy chỉ cách fix.

## 9. Ghi chú vận hành

- Luôn chạy type-check/lint trước khi commit.
- Không commit secrets (`.env`, API keys, tokens).
- Đảm bảo biến môi trường đúng khi deploy (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, ...).

## 10. Scripts và lệnh quan trọng

### Backend (`backend/package.json`)

- `npm run dev`: chạy dev server (ts-node-dev)
- `npm run build`: build TypeScript
- `npm run start`: chạy bản build
- `npm run seed`: seed dữ liệu mẫu
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:push`: đồng bộ schema lên DB

### Web (`web/package.json`)

- `npm run dev`: chạy web tại `http://localhost:3000`
- `npm run build`: build production
- `npm run start`: chạy production
- `npm run lint`: kiểm tra lint

### Admin (`admin/package.json`)

- `npm run dev`: chạy admin tại `http://localhost:3001`
- `npm run build`
- `npm run start`
- `npm run lint`

## 11. Hướng dẫn khởi động môi trường phát triển

1. Cài Node.js (khuyến nghị >= 18).
2. Cài dependencies:
   - `cd backend && npm install`
   - `cd ../web && npm install`
   - `cd ../admin && npm install`
3. Cấu hình `.env` cho `backend` và `web`.
4. Đồng bộ Prisma:
   - `cd backend`
   - `npm run prisma:generate`
   - `npm run prisma:push`
   - `npm run seed` (nếu cần dữ liệu mẫu)
5. Mở 3 terminal chạy đồng thời backend/web/admin.

## 12. Hướng dẫn migration và seeding

Khi thay đổi model DB:

1. Cập nhật `backend/prisma/schema.prisma`
2. Chạy migration/push tùy quy trình:
   - `npx prisma migrate dev --name <ten-migration>` hoặc
   - `npm run prisma:push` (dev nhanh)
3. `npm run prisma:generate`
4. Seed lại dữ liệu nếu cần: `npm run seed`
5. Kiểm tra dữ liệu bằng Prisma Studio: `npx prisma studio`

## 13. Cập nhật gần đây (2026-02-16)

### 13.1 Web - My List, Favorites, Languages

- Sửa `web/pages/api/current.ts` trả về object user trực tiếp.
- Tăng ổn định `web/hooks/useCurrentUser.ts` (hỗ trợ cả payload cũ/mới).
- Sửa `web/pages/api/favorite.ts`:
  - Validate `movieId` đúng ObjectId
  - Không thêm trùng `favoriteIds`
  - Trả lỗi rõ ràng khi phim không tồn tại
- Tăng ổn định `web/hooks/useFavorites.ts` bằng fallback từ `favoriteIds`.
- Cập nhật `web/pages/my-list.tsx` hiển thị thông báo khi danh sách rỗng.
- Sửa `web/pages/languages.tsx` để lọc ngôn ngữ linh hoạt theo alias (`Tiếng Anh/English`, `Tiếng Nhật/Japanese`, ...).

### 13.2 TypeScript + Redux modal

- Sửa lỗi kiểu dữ liệu ở:
  - `web/components/MovieList.tsx`
  - `web/store/movies.ts`
- `showModal` và `updateMovie` nhận được cả object hoặc array (`movieState | movieState[]`) và normalize về mảng.
- Đã xác nhận `web` pass type-check: `npx tsc --noEmit`.

### 13.3 Swagger backend

- Bổ sung JSDoc Swagger cho:
  - `GET /api/movies/check-slug`
  - `GET /api/movies/check-duplicate`
- File cập nhật: `backend/src/routes/movies.ts`

---

Tài liệu này đã được chuẩn hóa UTF-8 tiếng Việt có dấu.


