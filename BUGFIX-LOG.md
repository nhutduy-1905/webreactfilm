# Nhật ký sửa lỗi - Nextflix

> Ngày: 12/02/2026

---

## 1. Lỗi đỏ `movies.ts` - initialState thiếu `categories`

**File:** `web/store/movies.ts`

**Nguyên nhân:** Interface `movieState` khai báo `categories: string[]` là **required**, nhưng object mặc định trong `initialState` và `hideModal` reducer không có field `categories` → TypeScript báo lỗi type mismatch.

**Cách fix:** Đổi `categories: string[]` → `categories?: string[]` (optional) vì không phải lúc nào movie data cũng có categories.

---

## 2. Lỗi login - Không đăng nhập được, trang xoay vô hạn

**File:** `web/pages/api/auth/[...nextauth].ts`, `web/pages/auth.tsx`

### Nguyên nhân (3 vấn đề):

#### a) Session callback sai cho JWT strategy
- Code cũ: `async session({ session, user })` — dùng `user` 
- Với `session: { strategy: 'jwt' }`, NextAuth truyền `token` chứ không phải `user` vào session callback
- `user` luôn là `undefined` → session không có `id`
- **Fix:** Thêm `jwt` callback để lưu `user.id` vào token, và đổi session callback dùng `token`:
  ```ts
  async jwt({ token, user }) {
    if (user) token.id = user.id;
    return token;
  },
  async session({ session, token }) {
    if (token?.id) (session.user as any).id = token.id;
    return session;
  }
  ```

#### b) OAuth providers đăng ký với client_id rỗng
- Code cũ: `clientId: process.env.GITHUB_ID || ''` — truyền string rỗng khi env var không có
- OpenID Client yêu cầu `client_id` phải có giá trị → lỗi `client_id is required`
- **Fix:** Chỉ đăng ký OAuth providers khi env vars tồn tại:
  ```ts
  if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    providers.push(GithubProvider({ ... }));
  }
  ```

#### c) `signIn()` không dùng `redirect: false` → vòng lặp vô hạn
- Code cũ: `signIn('credentials', { callbackUrl: "/profiles" })` — redirect tự động
- Khi có lỗi JWT cũ (Invalid Compact JWE) → session check thất bại → redirect vòng quanh
- `setIsLoading(false)` không bao giờ chạy vì page đã navigate
- **Fix:** Dùng `redirect: false`, kiểm tra `response.error`, redirect thủ công bằng `window.location.href`:
  ```ts
  const response = await signIn('credentials', { email, password, redirect: false });
  if (response?.error) { setErrorMsg(...); return; }
  window.location.href = '/profiles';
  ```
- Thêm hiển thị lỗi bằng tiếng Việt cho người dùng

---

## 3. Swagger API Docs

**File:** `backend/src/swagger.ts`

**URL:** `http://localhost:5000/api-docs/`

**Tình trạng:** Swagger hoạt động bình thường tại `/api-docs/`. Đã cập nhật schema:
- Đổi các field `posterUrl`, `backdropUrl`, `thumbnailUrl` → `imageUrl` (field mới)
- Giữ backward compat fields trong Movie response schema với description ghi rõ

---

## 4. Tóm tắt các file đã sửa

| File | Thay đổi |
|------|----------|
| `web/store/movies.ts` | `categories` → optional (`?`) |
| `web/pages/api/auth/[...nextauth].ts` | Fix JWT callback, conditional OAuth providers |
| `web/pages/auth.tsx` | `redirect: false`, error handling, hiển thị lỗi |
| `backend/src/swagger.ts` | Update schema `imageUrl` |

---

## 5. Trạng thái servers

| Server | Port | URL | Status |
|--------|------|-----|--------|
| Backend | 5000 | http://localhost:5000 | ✅ Running |
| Web | 3000 | http://localhost:3000 | ✅ Running |
| Admin | 3001 | http://localhost:3001 | ✅ Running |
| Swagger | 5000 | http://localhost:5000/api-docs/ | ✅ Accessible |
