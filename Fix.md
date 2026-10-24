# Pentest và kế hoạch sửa ScoreChart Pro

Ngày kiểm tra: 2026-10-24
Phạm vi: ứng dụng React/Vite chạy tại `http://localhost:3000/`.

## Cách kiểm tra

- Kiểm tra tĩnh các luồng state, fetch, timer, xử lý lỗi và component render.
- Tải lại trang bằng trình duyệt, theo dõi console, request và request failure.
- Kiểm tra các quyền UI đã bị ẩn trước đó không còn xuất hiện.
- Thực hiện kiểm tra typecheck và build production.

## Kết quả đã xác nhận

### P1 - Web vẫn tự gọi webhook dù UI đã ẩn toàn bộ điều khiển

**Bằng chứng:** Khi reload trang, trình duyệt phát sinh request:

`GET http://localhost:1234/webhook/leaderboard`

Sau request, giao diện hiển thị `Dữ Liệu Trực Tiếp (Live Webhook)` và nội dung dataset từ webhook thay cho preset ban đầu.

**Ảnh hưởng:**

- Tốn request và gây render/cập nhật state định kỳ mỗi 10 giây.
- Trang phụ thuộc vào service localhost:1234 dù người dùng không còn nút bật/tắt hoặc fetch lại.
- Dữ liệu hiển thị có thể thay đổi ngoài ý muốn.

**Kế hoạch sửa:**

1. Xác định nguồn dữ liệu chính thức: preset cục bộ hay webhook.
2. Nếu UI không cho phép đồng bộ, bỏ auto-fetch và timer khỏi `App.tsx`.
3. Nếu vẫn cần live data, chuyển cấu hình bật/tắt sang biến môi trường và thêm timeout/AbortController.
4. Chỉ thay dataset trong RAM khi payload hợp lệ và khác dữ liệu hiện tại.
5. Kiểm thử reload khi webhook tắt, webhook trả lỗi HTTP, payload rỗng và payload sai schema.

**Trạng thái:** Đã triển khai theo `update.md`: webhook được cấu hình qua `VITE_N8N_API_URL`, polling 30 giây và dữ liệu thành công được cache để fallback. UI vẫn không hiển thị điều khiển webhook.

### P2 - Chưa có timeout cho fetch webhook

**Bằng chứng tĩnh:** `fetchLeaderboardFromWebhook` gọi `fetch(url)` không có `AbortController` hoặc timeout.

**Ảnh hưởng:** Nếu service localhost:1234 treo hoặc không đóng kết nối, trạng thái `isSyncing` có thể kéo dài và request định kỳ không có giới hạn thời gian.

**Kế hoạch sửa:**

1. Thêm timeout mặc định khoảng 5-8 giây bằng `AbortController`.
2. Phân biệt lỗi timeout, network và HTTP trong thông báo nội bộ.
3. Đảm bảo `finally` luôn giải phóng trạng thái loading.
4. Thêm test cho timeout và response không hợp lệ.

**Trạng thái:** Đã sửa trong `src/utils/api.ts` bằng `AbortController` với timeout mặc định 5 giây.

### P2 - Parser webhook chấp nhận điểm không hợp lệ

**Bằng chứng tĩnh:** `parseWebhookPayload` chuyển điểm bằng `parseFloat` nhưng không loại bỏ `NaN`, Infinity, điểm âm hoặc giá trị vượt thang.

**Ảnh hưởng:** Có thể làm hỏng chiều cao cột, thống kê hoặc tạo dữ liệu hiển thị không hợp lệ.

**Kế hoạch sửa:**

1. Validate từng item bằng `Number.isFinite`.
2. Quy định rõ cho điểm âm/vượt max: từ chối payload hoặc clamp theo chính sách sản phẩm.
3. Bỏ item lỗi và trả cảnh báo, hoặc fail toàn bộ payload tùy yêu cầu nghiệp vụ.
4. Thêm test cho `NaN`, chuỗi rỗng, Infinity, số âm và score vượt 300.

**Trạng thái:** Chưa sửa; cần chốt chính sách điểm âm/vượt thang trước khi thay đổi parser.

### P3 - Hiệu năng khi dữ liệu lớn chưa có giới hạn hiển thị

**Bằng chứng tĩnh:** `processedItems` sao chép, lọc và sort toàn bộ `dataset.items`; các biểu đồ và bảng render toàn bộ items.

**Ảnh hưởng:** Với vài trăm/nghìn thành viên, mỗi lần gõ tìm kiếm hoặc đổi filter có thể gây nhiều DOM node và chi phí sort/render lớn.

**Kế hoạch sửa:**

1. Đo baseline với 100, 1.000 và 10.000 items.
2. Giới hạn hoặc phân trang bảng.
3. Cân nhắc virtualization cho bảng và biểu đồ dạng danh sách dài.
4. Chỉ sort khi sort order hoặc dataset thay đổi; giữ `useDeferredValue` cho search.
5. Thêm kiểm thử thời gian tương tác và memory khi dataset lớn.

**Trạng thái:** Chưa sửa vì cần biết kích thước dữ liệu thực tế.

## Kiểm tra không phát hiện lỗi

- Không ghi nhận `console.error` hoặc `unhandledrejection` khi reload trang và chờ khoảng 1,2 giây.
- Không ghi nhận request failure trong lần kiểm tra.
- Các nút nhập/đổi dữ liệu, chỉnh sửa, xóa và điều khiển webhook không xuất hiện trên DOM hiện tại.
- `npm run lint`: PASS.
- `npm run build`: PASS, bundle production tạo thành công.
- Browser runtime diagnostics sau reload: `[]`.
- Browser không ghi nhận request failure trong lần kiểm tra; request webhook thành công nhưng vẫn là finding P1 vì nó chạy ngoài quyền điều khiển UI.

## Công cụ theo dõi lỗi runtime

Đã thêm `src/utils/runtimeDiagnostics.ts` và cài trong `src/main.tsx`.

- Lưu tối đa 50 lỗi gần nhất trong RAM.
- Bắt `window.error` và `unhandledrejection`.
- Không dùng localStorage/sessionStorage.
- Trong môi trường development, đọc log bằng:

```js
window.__scoreChartDiagnostics?.()
```

Các lỗi được ghi theo loại, message, source/stack và timestamp. Bộ ghi log chỉ hỗ trợ quan sát; không thay thế việc xử lý lỗi ở từng luồng fetch hoặc parser.

## Cập nhật triển khai theo `update.md`

- `src/App.tsx` đọc cache `SCORECHART_PRO_LAST_DATA` ngay khi khởi tạo.
- Dataset mới hợp lệ ghi đè cache cũ; lỗi mạng/timeout giữ nguyên dataset đang hiển thị.
- `src/utils/api.ts` ưu tiên `VITE_N8N_API_URL`, có timeout 5 giây và luôn dọn timer.
- `.env.local` dùng endpoint n8n trong tài liệu và `VITE_SYNC_INTERVAL=30000`.
- Endpoint n8n đã trả `HTTP 200` JSON khi kiểm tra bằng PowerShell.
- Browser đã xác nhận cache tồn tại sau reload và diagnostics không có lỗi.
- Nếu browser báo `TypeError: Load failed` trong khi PowerShell vẫn nhận `HTTP 200`, cần bật CORS cho n8n/Cloudflare Tunnel để cho phép origin của web.

## Thứ tự triển khai đề xuất

1. Quyết định có giữ auto-webhook hay không; đây là vấn đề ảnh hưởng trực tiếp hành vi hiện tại.
2. Thêm timeout và hủy request cho webhook.
3. Siết validation payload trước khi đưa vào bộ nhớ RAM.
4. Đo và tối ưu dataset lớn bằng pagination/virtualization nếu cần.
5. Chạy lại pentest: console, network, reload offline, payload xấu, dữ liệu lớn và build production.
