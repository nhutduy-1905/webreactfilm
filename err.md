# Lỗi web film không hiển thị phim

## Mô tả

- Backend `/api/movies` trả dữ liệu dạng phân trang:
  - `{ data: [...], pagination: {...} }`
- Frontend web (`useMovieList`) trước đó lại kỳ vọng response là mảng `Movie[]`.
- Kết quả: danh sách phim bị parse thành `[]`, trang web hiển thị trạng thái không có phim.

## Nguyên nhân gốc

- Lệch contract response giữa backend và frontend.
- Frontend chưa bóc tách trường `data` từ payload phân trang.

## Đã fix

- `web/hooks/useMovieList.ts`
  - Hỗ trợ cả 2 dạng response:
    - Mảng trực tiếp `Movie[]`
    - Object phân trang `{ data: Movie[] }`
  - Chuẩn hóa `id` từ `id/_id`.
  - Chuẩn hóa image URL để tránh vỡ poster.

- `web/pages/api/movies/[id].ts` (tạo mới)
  - Bổ sung proxy chi tiết phim `/api/movies/:id` từ web sang backend.
  - Tránh 404 khi trang watch/info gọi movie theo id.

- `web/components/MovieList.tsx`
  - Click movie dùng `id` hoặc `_id` để tương thích dữ liệu cũ.

- `web/components/Billboard.tsx`
  - Sửa logic lấy movie (movie là object, không phải mảng).
  - Đảm bảo nút `More Info` mở đúng modal phim.

## Lưu ý vận hành

- Backend route list mặc định chỉ lấy phim `status = published`.
- Nếu phim ở admin đang `draft/hidden` thì web người dùng sẽ không hiển thị.

## Cách kiểm tra nhanh sau fix

1. Chạy backend và web.
2. Tạo/đổi một phim trong admin sang `published`.
3. Mở web home:
   - Section `Trending Now` phải hiển thị phim.
   - Click vào một phim để mở modal thông tin.
4. Mở trang watch theo link `/watch/<movieId>` để xác nhận API movie detail hoạt động.

## Lỗi gặp phải trong phiên gần đây (2026-02-16)

### 1) TS2345 tại MovieList khi mở modal

- Triệu chứng:
  - `web/components/MovieList.tsx` báo: `Argument of type 'movieState[]' is not assignable ...` khi dispatch `movieActions.showModal(...)`.
- Nguyên nhân:
  - Kiểu payload giữa nơi dispatch và reducer chưa linh hoạt khi code đổi qua lại giữa object và array.
- Cách xử lý:
  - `web/store/movies.ts`: đổi payload thành union `movieState | movieState[]`, normalize về mảng.
  - `web/components/MovieList.tsx`: gửi 1 object movie khi click.

### 2) My List không hiển thị phim

- Triệu chứng:
  - Trang My List trong web rỗng dù backend đã có phim.
- Nguyên nhân:
  - `/api/current` từng trả payload dạng `{ currentUser: ... }`, trong khi nhiều chỗ frontend đọc trực tiếp object user.
  - Luồng favorites phụ thuộc một endpoint nên dễ rỗng khi payload lệch.
- Cách xử lý:
  - `web/pages/api/current.ts`: trả về trực tiếp object user.
  - `web/hooks/useCurrentUser.ts`: thêm normalize để tương thích payload cũ/mới.
  - `web/hooks/useFavorites.ts`: thêm fallback map từ `favoriteIds`.

### 3) Languages chỉ có một số ô có dữ liệu

- Triệu chứng:
  - Chỉ một số ngôn ngữ có phim, các ngôn ngữ khác rỗng.
- Nguyên nhân:
  - So khớp tên ngôn ngữ cứng (`includes`) không tương thích nhiều cách ghi trong data.
- Cách xử lý:
  - `web/pages/languages.tsx`: tạo bộ alias và normalize chuỗi để match linh hoạt.

### 4) Swagger thiếu endpoint đang sử dụng

- Triệu chứng:
  - Backend có route check slug/duplicate nhưng trang docs chưa hiển thị.
- Nguyên nhân:
  - Thiếu JSDoc `@swagger` trên 2 route.
- Cách xử lý:
  - Bổ sung docs cho:
    - `GET /api/movies/check-slug`
    - `GET /api/movies/check-duplicate`
  - File: `backend/src/routes/movies.ts`

### 5) Lỗi patch file languages do encoding

- Triệu chứng:
  - `apply_patch` fail do không tìm được context trong `web/pages/languages.tsx`.
- Nguyên nhân:
  - File cũ có ký tự lỗi encoding, context match không chính xác.
- Cách xử lý:
  - Ghi đè toàn bộ file `languages.tsx` bằng nội dung UTF-8 sạch.
