# TÀI LIỆU DỰ ÁN

## 1. Tổng quan dự án

Dự án `webreactfilm` là hệ thống nền tảng phim/series gồm 3 phần chính trong workspace:

- `web/`: Frontend chính (Next.js + React) cho người dùng cuối.
- `admin/`: Giao diện quản trị (Next.js + React + TypeScript).
- `backend/`: API service (Node.js + TypeScript + Prisma + REST API).

Mục tiêu: cung cấp giao diện xem phim, quản lý nội dung, bình luận, yêu thích, đăng nhập/đăng ký và các chức năng vận hành cho quản trị viên.

## 2. Cấu trúc thư mục (cập nhật hiện tại)

```text
webreactfilm/
├── admin/
│   ├── components/
│   │   ├── AdminLayout.tsx
│   │   └── MovieForm.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── pages/
│   │   ├── movies/
│   │   │   ├── [id].tsx
│   │   │   ├── create.tsx
│   │   │   └── index.tsx
│   │   ├── _app.tsx
│   │   ├── actors.tsx
│   │   ├── analytics.tsx
│   │   ├── banners.tsx
│   │   ├── categories.tsx
│   │   ├── comments.tsx
│   │   ├── index.tsx
│   │   ├── settings.tsx
│   │   └── users.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   │   ├── analytics.ts
│   │   │   ├── comments.ts
│   │   │   ├── commentsAdmin.ts
│   │   │   ├── movies.ts
│   │   │   └── users.ts
│   │   ├── cleanup.ts
│   │   ├── index.ts
│   │   ├── prisma.ts
│   │   ├── seed.ts
│   │   └── swagger.ts
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── web/
│   ├── components/
│   │   ├── AccountMenu.tsx
│   │   ├── Billboard.tsx
│   │   ├── CommentSection.tsx
│   │   ├── FavoriteButton.tsx
│   │   ├── InfoModal.tsx
│   │   ├── input.tsx
│   │   ├── IntroN.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── MovieCard.tsx
│   │   ├── MovieList.tsx
│   │   ├── Navbar.tsx
│   │   ├── NavbarItem.tsx
│   │   └── PlayButton.tsx
│   ├── hooks/
│   │   ├── useBillboard.ts
│   │   ├── useCurrentUser.ts
│   │   ├── useFavorites.ts
│   │   ├── useMovie.ts
│   │   └── useMovieList.ts
│   ├── libs/
│   │   ├── adminAuth.ts
│   │   ├── authOptions.ts
│   │   ├── fetcher.ts
│   │   ├── logger.ts
│   │   ├── prismadb.ts
│   │   └── serverAuth.ts
│   ├── pages/
│   │   ├── api/
│   │   │   ├── analytics/
│   │   │   │   └── track.ts
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth].ts
│   │   │   ├── comments/
│   │   │   │   ├── [movieId].ts
│   │   │   │   ├── admin.ts
│   │   │   │   ├── create.ts
│   │   │   │   ├── delete.ts
│   │   │   │   ├── edit.ts
│   │   │   │   ├── like.ts
│   │   │   │   └── reply.ts
│   │   │   ├── favorites/
│   │   │   │   └── count/
│   │   │   │       └── [movieId].ts
│   │   │   ├── movies/
│   │   │   │   ├── [id].ts
│   │   │   │   ├── filter.ts
│   │   │   │   └── search.ts
│   │   │   ├── ratings/
│   │   │   │   └── [movieId].ts
│   │   │   ├── current.ts
│   │   │   ├── deletefavorite.ts
│   │   │   ├── favorite.ts
│   │   │   ├── favorites.ts
│   │   │   ├── movies.ts
│   │   │   ├── random.ts
│   │   │   ├── register.ts
│   │   │   └── users.ts
│   │   ├── watch/
│   │   │   └── [movieId].tsx
│   │   ├── _app.tsx
│   │   ├── auth.tsx
│   │   ├── films.tsx
│   │   ├── index.tsx
│   │   ├── languages.tsx
│   │   ├── my-list.tsx
│   │   ├── new.tsx
│   │   ├── profiles.tsx
│   │   └── series.tsx
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   │   ├── images/
│   │   │   ├── default-blue.png
│   │   │   ├── default-green.png
│   │   │   ├── default-red.png
│   │   │   ├── default-slate.png
│   │   │   ├── favicon.png
│   │   │   ├── hero.jpg
│   │   │   ├── loading.gif
│   │   │   ├── logo.png
│   │   │   ├── poster.png
│   │   │   └── thumbnail.jpg
│   │   ├── favicon.ico
│   │   └── vercel.svg
│   ├── store/
│   │   ├── index.ts
│   │   ├── movies.ts
│   │   └── profile.ts
│   ├── styles/
│   │   └── globals.css
│   ├── .env
│   ├── global.d.ts
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── .gitignore
├── Tailieu.md
├── err.md
├── ERROR-FIXES.md
├── README.md
├── package.json
└── package-lock.json
```

Ghi chú:
- Cây trên phản ánh cấu trúc code hiện tại theo source chính.
- Đã loại trừ thư mục/file phát sinh tự động hoặc không cần commit: `.git/`, `node_modules/`, `.next/`, `backend/dist/`, các file log debug trong `backend/`.
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

### 13.4 Logging fetcher + chuẩn hóa contract duration

- Giảm log nhạy cảm ở client fetcher:
  - `web/libs/fetcher.ts` chỉ log `request/response preview` khi `NODE_ENV=development`.
  - Ở production, không in preview payload để tránh nặng log và lộ dữ liệu.
- Chuẩn hóa `duration` thống nhất kiểu `number`:
  - `backend/src/routes/movies.ts`: helper `withGenre` trả `duration` dạng số.
  - `web/pages/api/movies.ts`, `web/pages/api/random.ts`, `web/pages/api/movies/[id].ts`: trả `duration` dạng số ở lớp compat/fallback.
- `web/hooks/useMovieList.ts` + `web/hooks/useMovie.ts`: normalize `duration` về số.
- `web/store/movies.ts`: `movieState.duration` dùng `number` (không dùng union `number | string` nữa).

### 13.5 Cập nhật banner trailer Doctor Slump (2026-02-17)

- Cập nhật pool banner ưu tiên trong `web/components/Billboard.tsx` để thêm nhóm `doctor-slump`.
- Banner trang chủ sẽ ưu tiên lấy trailer phim `Doctor Slump` (nếu phim có media hợp lệ và đang `published`).
- Điều chỉnh logic chọn nhóm ưu tiên từ toàn bộ `moviesList` (không chỉ danh sách ảnh ngang) để tránh bị loại các poster dọc.
- Giữ nguyên cơ chế fallback của banner:
  - Nếu nhóm ưu tiên không đủ media hợp lệ thì tự bù từ danh sách phim còn lại.
  - Vẫn dùng vòng quay nhiều trailer theo `HERO_ROTATION_POOL_SIZE`.

### 13.6 Chuẩn hóa tài liệu lỗi (2026-02-17)

- Đã gộp nội dung từ `ERROR-FIXES.md` vào `err.md`.
- `ERROR-FIXES.md` được chuyển thành file tham chiếu ngắn, tránh trùng nội dung.
- `err.md` được viết lại bằng tiếng Việt có dấu, thống nhất format:
  - Mô tả lỗi
  - Nguyên nhân gốc
  - Cách sửa
  - File ảnh hưởng
  - Cách kiểm tra lại

---

Tài liệu này đã được chuẩn hóa UTF-8 tiếng Việt có dấu.



