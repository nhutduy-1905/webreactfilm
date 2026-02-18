# TỔNG HỢP LỖI & CÁCH SỬA (ERR)

## 1. Mục đích file

File này là bản tổng hợp lỗi thực tế đã gặp trong dự án `webreactfilm`, đã **gộp nội dung từ `ERROR-FIXES.md`** và chuẩn hóa tiếng Việt có dấu để theo dõi dễ hơn.

Mỗi mục gồm:
- Triệu chứng
- Nguyên nhân gốc
- Cách sửa
- File ảnh hưởng

---

## 2. Lỗi hiển thị phim trên web

### 2.1 Web không hiện phim dù backend có dữ liệu

- Triệu chứng:
  - Trang web báo không có phim, dù MongoDB có dữ liệu.
- Nguyên nhân gốc:
  - Lệch contract response giữa backend và frontend.
  - Backend trả `{ data: [...], pagination: ... }` nhưng hook từng kỳ vọng `Movie[]`.
- Cách sửa:
  - `web/hooks/useMovieList.ts` hỗ trợ cả 2 dạng response.
  - Chuẩn hóa `id` từ `id/_id` và chuẩn hóa URL ảnh.
- File ảnh hưởng:
  - `web/hooks/useMovieList.ts`

### 2.2 `/watch/[movieId]` lỗi thiếu API chi tiết phim

- Triệu chứng:
  - Mở trang watch bị lỗi 404 hoặc không tải đủ dữ liệu phim.
- Nguyên nhân gốc:
  - Thiếu endpoint proxy movie detail ở lớp API web.
- Cách sửa:
  - Bổ sung endpoint `web/pages/api/movies/[id].ts`.
- File ảnh hưởng:
  - `web/pages/api/movies/[id].ts`

### 2.3 Backend chỉ nên hiển thị phim `published` cho web user

- Triệu chứng:
  - Lúc hiển thị sai danh sách (lẫn draft/hidden).
- Nguyên nhân gốc:
  - Query list chưa đặt filter mặc định trạng thái phù hợp.
- Cách sửa:
  - Áp dụng filter mặc định `status = published`.
- File ảnh hưởng:
  - `backend/src/routes/movies.ts`

---

## 3. Lỗi TypeScript / Redux

### 3.1 TS2345 ở `MovieList` khi mở modal

- Triệu chứng:
  - `Argument of type 'movieState[]' is not assignable ...`.
- Nguyên nhân gốc:
  - Payload `showModal` không thống nhất (object vs array).
- Cách sửa:
  - Cho reducer nhận union `movieState | movieState[]` và normalize.
  - Ở component, đồng bộ payload khi dispatch.
- File ảnh hưởng:
  - `web/store/movies.ts`
  - `web/components/MovieList.tsx`

### 3.2 Vòng lặp render/infinite loading

- Triệu chứng:
  - Trang re-render liên tục, loading không dừng.
- Nguyên nhân gốc:
  - Dependency `useEffect` dùng object/array không ổn định.
  - Hàm fetch chưa được memo hóa.
- Cách sửa:
  - Dùng dependency ổn định (`currentUser?.id`, `movies.length`).
  - Dùng `useCallback` cho hàm fetch.
- File ảnh hưởng:
  - `web/pages/profiles.tsx`
  - `web/components/CommentSection.tsx`
  - `web/pages/index.tsx`

---

## 4. Lỗi bình luận

### 4.1 Bình luận không hiện dù DB có dữ liệu

- Triệu chứng:
  - Đã comment thành công nhưng frontend không hiện.
- Nguyên nhân gốc:
  - Query top-level comment không tương thích dữ liệu Mongo (khác giữa `null`/không có field).
  - Có lúc filter `status` không phù hợp Prisma Mongo filter thực tế.
- Cách sửa:
  - Chuẩn hóa query comments top-level.
  - Dùng filter trạng thái an toàn (`status: { not: 'rejected' }`).
  - Thêm hiển thị lỗi ở UI để debug dễ hơn.
- File ảnh hưởng:
  - `web/pages/api/comments/[movieId].ts`
  - `web/components/CommentSection.tsx`

### 4.2 Admin thiếu menu quản lý bình luận

- Triệu chứng:
  - Sidebar admin không có đường dẫn Comments.
- Cách sửa:
  - Bổ sung menu comments ở layout admin.
- File ảnh hưởng:
  - `admin/components/AdminLayout.tsx`

---

## 5. Lỗi favorites, My List, languages

### 5.1 My List không hiển thị đúng

- Triệu chứng:
  - My List rỗng dù user có favorites.
- Nguyên nhân gốc:
  - Payload `/api/current` không đồng nhất giữa các chỗ dùng.
- Cách sửa:
  - Trả object user trực tiếp từ `/api/current`.
  - Thêm normalize ở `useCurrentUser` và fallback ở `useFavorites`.
- File ảnh hưởng:
  - `web/pages/api/current.ts`
  - `web/hooks/useCurrentUser.ts`
  - `web/hooks/useFavorites.ts`

### 5.2 Languages lọc thiếu phim

- Triệu chứng:
  - Một số ngôn ngữ không có dữ liệu dù thực tế có.
- Nguyên nhân gốc:
  - So khớp chuỗi ngôn ngữ quá cứng.
- Cách sửa:
  - Dùng alias + normalize ngôn ngữ để lọc linh hoạt.
- File ảnh hưởng:
  - `web/pages/languages.tsx`

---

## 6. Lỗi analytics thống kê sai số liệu

### 6.1 Tổng số có dữ liệu nhưng bảng top phim view/like = 0

- Triệu chứng:
  - `summary.totalViews` có số, nhưng trong bảng hot movies nhiều phim `views/likes = 0`.
- Nguyên nhân gốc:
  - `createdAt` trong `movie_engagement_events` lưu dạng `string`.
  - Pipeline lọc theo Date không tương thích trong `$runCommandRaw`, làm rơi dữ liệu theo mốc thời gian.
- Cách sửa:
  - Convert `createdAt` an toàn sang `date` + epoch ms.
  - Lọc bằng `createdAtEpochMs >= startEpochMs`.
- File ảnh hưởng:
  - `backend/src/routes/analytics.ts`

---

## 7. Lỗi giao diện watch/player

### 7.1 Control player không hoạt động đầy đủ

- Triệu chứng:
  - Thanh thời gian đứng, nút pause/tua không phản hồi tốt.
- Cách sửa:
  - Đồng bộ control cho cả direct video + YouTube bridge.
  - Chuẩn hóa state thời gian, âm lượng, tốc độ phát.
- File ảnh hưởng:
  - `web/pages/watch/[movieId].tsx`

### 7.2 Thiếu nút tim/chia sẻ và trải nghiệm chưa giống app

- Triệu chứng:
  - Không có hoặc hiển thị chưa đẹp phần tim/chia sẻ.
- Cách sửa:
  - Thêm cụm tim + số lượt tim.
  - Thêm modal chia sẻ kiểu app (Facebook, WhatsApp, X, Email, Zalo, Instagram, copy link, chia sẻ theo mốc thời gian).
- File ảnh hưởng:
  - `web/pages/watch/[movieId].tsx`

---

## 8. Lỗi banner/trailer trang chủ

### 8.1 Banner chưa ưu tiên trailer theo danh sách mong muốn

- Triệu chứng:
  - Pool banner quay chưa có phim `Doctor Slump`.
- Nguyên nhân gốc:
  - Logic cũ ưu tiên ảnh ngang trước, nên một số phim có poster dọc bị rơi khỏi pool ưu tiên.
- Cách sửa:
  - Cập nhật nhóm ưu tiên banner để thêm `doctor-slump` (keywords: `doctor slump`, `bac si slump`).
  - Chọn nhóm ưu tiên từ toàn bộ `moviesList` để không bỏ sót phim có media hợp lệ.
- File ảnh hưởng:
  - `web/components/Billboard.tsx`

### 8.2 Banner audio mặc định

- Mục tiêu hành vi:
  - Banner tự phát nhưng âm thanh mặc định tắt, người dùng tự bật khi muốn.
- Cách sửa:
  - Đồng bộ mute state mặc định ở banner.
- File ảnh hưởng:
  - `web/components/Billboard.tsx`

---

## 9. Lỗi docs/Swagger

### 9.1 Swagger thiếu endpoint đang dùng

- Triệu chứng:
  - Một số route có thật nhưng chưa hiện trên docs.
- Cách sửa:
  - Bổ sung JSDoc Swagger cho route còn thiếu.
- File ảnh hưởng:
  - `backend/src/routes/movies.ts`
  - `backend/src/swagger.ts`

---

## 10. Checklist kiểm tra nhanh sau khi sửa

1. Chạy `backend`, `web`, `admin` ở chế độ dev.
2. Kiểm tra trang home:
   - Banner quay trailer có `Doctor Slump`.
3. Kiểm tra trang watch:
   - Tim hoạt động, số tim cập nhật.
   - Modal chia sẻ mở/đóng bình thường, copy link hoạt động.
4. Kiểm tra analytics admin:
   - Tổng và bảng top phim khớp logic dữ liệu.
5. Kiểm tra comments:
   - Comment mới hiển thị trên web.
   - Admin đọc/duyệt được comment.

---

## 11. Ghi chú

- Nội dung `ERROR-FIXES.md` đã được tích hợp vào file này ở dạng tiếng Việt có dấu.
- `ERROR-FIXES.md` hiện chỉ giữ vai trò file tham chiếu trỏ về `err.md`.
- Từ thời điểm này ưu tiên cập nhật lịch sử lỗi tại `err.md` để tránh phân tán tài liệu.

---

## 12. Cập nhật lỗi và cách sửa (2026-02-18)

### 12.1 Prisma/MongoDB Atlas báo `SCRAM failure: bad auth`

- Triệu chứng:
  - `npx prisma db push` lỗi xác thực MongoDB (`authentication failed`).
- Nguyên nhân gốc:
  - Sai user/password Atlas hoặc đặt sai biến môi trường (không dùng đúng `DATABASE_URL`).
  - Mật khẩu có ký tự đặc biệt nhưng chưa URL-encode.
- Cách sửa:
  - Chuẩn hóa lại `.env` để Prisma dùng đúng `DATABASE_URL`.
  - Kiểm tra lại user DB trên Atlas, encode password đúng định dạng URL.
  - Chạy lại `npx prisma db push` để xác nhận kết nối.
- File ảnh hưởng:
  - `backend/.env`
  - `web/.env`

### 12.2 API trả `Movie not found` / `Comment not found` sau khi đổi DB

- Triệu chứng:
  - Các API movie/comment trả `404` dù trước đó ở local vẫn có dữ liệu.
- Nguyên nhân gốc:
  - ID test lấy từ DB cũ (local) hoặc dữ liệu chưa được seed/import đúng sang Atlas.
- Cách sửa:
  - Đồng bộ schema + dữ liệu trên DB đang dùng thật.
  - Test lại bằng ID lấy trực tiếp từ DB Atlas hiện tại.
- File ảnh hưởng:
  - `backend/src/routes/movies.ts`
  - `backend/src/routes/comments.ts`

### 12.3 Watch intro/player bị đứng, lặp intro hoặc dính UI player ngoài

- Triệu chứng:
  - Intro có lúc đứng khung hình đỏ.
  - Có lúc intro phát 2 lần.
  - Khi hết intro dễ lộ UI gợi ý/video ngoài mong muốn.
- Nguyên nhân gốc:
  - Nguồn intro không ổn định và điều kiện autoplay/reload bị xung đột.
  - Luồng chuyển intro -> video chính chưa được chặn trạng thái lặp tốt.
- Cách sửa:
  - Cập nhật `IntroN` để ổn định autoplay và chống kẹt.
  - Điều chỉnh luồng watch để không phát lặp intro và chuyển player mượt hơn.
  - Siết điều kiện nguồn phát không hợp lệ (IMDb/ref).
- File ảnh hưởng:
  - `web/components/IntroN.tsx`
  - `web/pages/watch/[movieId].tsx`

### 12.4 Cập nhật cuối ngày: bật autoplay lại cho trang watch

- Theo yêu cầu hiện tại, đã bỏ nhánh ép `paused` khi reload.
- Hành vi hiện tại:
  - Vào trang watch: video tự chạy.
  - Reload trang watch: video vẫn tự chạy.
- File ảnh hưởng:
  - `web/pages/watch/[movieId].tsx`
