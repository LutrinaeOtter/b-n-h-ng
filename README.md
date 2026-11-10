# GDU StockHub — Liquid Glass Inventory Dashboard

**GDU StockHub** là tên dự án sinh viên lấy cảm hứng từ **GDU — Trường Đại học Gia Định**, không phải hệ thống chính thức của trường.

**Module 1: Quản lý danh mục & Kho hàng — Kho dữ liệu động**

Ứng dụng web quản lý sản phẩm bằng **Doubly Linked List** (danh sách liên kết đôi) trong JavaScript, với **Map chỉ mục ID** và **IndexedDB** để lưu dữ liệu cục bộ. Không cần framework, không cần cài `npm install`, không phụ thuộc thư viện CDN hay Internet.

## 1. Chạy ứng dụng

**Trên macOS (MacBook):** giải nén ZIP, nhấp đúp `start.command`. Nếu máy yêu cầu quyền, nhấn chuột phải → Open. Cần Node.js hoặc Python 3 để chạy máy chủ localhost.

**Trên Windows:** giải nén ZIP, nhấp đúp `start.bat`. Máy cần Node.js hoặc Python 3.

**Chạy bằng terminal (Mac/Windows/Linux):**

```bash
cd GDU-StockHub
node server.js
```

Sau đó mở: **http://127.0.0.1:4173**. Hoặc chạy `python3 -m http.server 4173 --bind 127.0.0.1` trong thư mục dự án.

**Xem nhanh không cần cài gì:** mở `index.html` bằng trình duyệt. Các chức năng trên RAM vẫn chạy; một số trình duyệt chặn IndexedDB với địa chỉ `file://`, nên **khuyến nghị dùng localhost** để dữ liệu được giữ sau khi tải lại.

## 2. Chức năng đã hiện thực

| Mục | Chức năng |
|---|---|
| Tổng quan | Dashboard, tổng số sản phẩm, giá trị tồn, sản phẩm sắp hết, rating, 4 bản ghi gần nhất |
| Kho sản phẩm | Thêm đầu/cuối Linked List, cập nhật, xóa theo ID, tìm kiếm, lọc, sắp xếp, phân trang 10–100 dòng |
| Nạp dữ liệu | CSV/JSON, kéo thả, bỏ qua dòng sai & ID trùng, chọn thêm / thay thế; mock 100 / 10.000 / **100.000** Product |
| Báo cáo | Tổng tồn kho, giá trị trung bình, cơ cấu trạng thái, rating, top 8 giá trị tồn |
| Cài đặt | Bật/tắt lưu IndexedDB, lưu bản snapshot, xuất CSV/JSON, kiểm định Linked List, xóa toàn bộ |

**Mỗi Product bắt buộc có đủ 5 trường:** `id` (string), `name` (string), `price` (VNĐ, >= 0), `stock` (số nguyên >= 0), `rating` (0.0–5.0).

**Định dạng CSV:**

```csv
id,name,price,stock,rating
SP001,Tai nghe Bluetooth,490000,12,4.7
SP002,MacBook Pro,29500000,5,4.9
SP003,Bàn phím cơ,1200000,0,4.5
```

Có file mẫu thực tế ở `data/products-sample.csv`; bấm **Nạp dữ liệu → Tải CSV mẫu** để tạo mẫu nhỏ.

**Định dạng JSON:**

```json
[
  {"id":"SP001","name":"Tai nghe Bluetooth","price":490000,"stock":12,"rating":4.7},
  {"id":"SP002","name":"MacBook Pro","price":29500000,"stock":5,"rating":4.9}
]
```

Ứng dụng cũng nhận đối tượng chứa mảng `{ "products": [...] }` (định dạng xuất của ứng dụng).

## 3. Cấu trúc dữ liệu và độ phức tạp

Lõi `assets/core.js` dùng:

```text
head ↔ Node(Product) ↔ Node(Product) ↔ ... ↔ tail
                       ↘ Map<id, Node>
```

- Thêm vào đầu/cuối: **O(1)**.
- Tìm/xóa theo ID thông qua `Map`: **O(1) trung bình** (và tháo liên kết Node O(1)).
- Duyệt toàn bộ để thống kê/tìm theo tên/lọc: **O(n)**.
- Sắp xếp kết quả: **O(n log n)**.
- Bộ nhớ: **O(n)** cho danh sách, Map và dữ liệu, cộng bộ nhớ tạm khi lọc/sắp xếp.
- **100.000 Product**: đã kiểm thử tạo và xác minh 100.000 Node, duyệt hai chiều, Map index, thêm/xóa/sửa.
- `inventory.clear()` và `inventory.dispose()` tháo `next`, `prev`, tham chiếu Product, đồng thời `Map.clear()`; việc thu hồi RAM thực tế do **garbage collector của JavaScript** quản lý. `pagehide` gọi `dispose()` khi rời trang (không ở bfcache).

**Lưu trữ:** IndexedDB là bản sao bền vững để phục hồi dữ liệu khi tải lại trang. Danh sách liên kết trong RAM luôn là cấu trúc dữ liệu dùng để quản lý; `order` được lưu trong IndexedDB để phục hồi thứ tự thêm đầu/cuối. `IndexedDB` không phải máy chủ hay CSDL chia sẻ đa người dùng.

**Nhập dữ liệu lớn:** chia thành lô tối đa 2.000 sản phẩm, cập nhật tiến độ và nhường luồng UI giữa các lô. Bảng chỉ render tối đa 100 hàng/trang để không tạo 100.000 phần tử DOM cùng lúc.

## 4. Cấu trúc dự án

```text
GDU-StockHub/
├── index.html            # Bố cục 5 trang chức năng + modals
├── assets/
│   ├── style.css         # Liquid Glass, animation, responsive
│   ├── core.js           # Doubly Linked List, Map, IndexedDB, CSV parser
│   └── app.js            # UI, thao tác, điều hướng, import/export
├── data/
│   └── products-sample.csv
├── server.js             # Máy chủ localhost, không dependency
├── start.command         # Mở nhanh trên Mac
├── start.bat             # Mở nhanh trên Windows
├── test-core.js          # Test 100.000 Product bằng Node.js
└── README.md
```

## 5. Kiểm thử

```bash
node test-core.js
```

Trong DevTools của trình duyệt, có thể chạy:

```js
LumiDebug.inventory.verify();
LumiDebug.inventory.size;
LumiDebug.inventory.get('DEMO-000001');
```

## 6. Lưu ý phạm vi

Bản này hiện thực **đầy đủ các yêu cầu nêu ra cho Module 1**. Năm mục trong sidebar là các **khu vực giao diện quản lý kho**; chúng không tự nhận là bốn module nghiệp vụ độc lập khác mà đề bài chưa mô tả. Nếu giảng viên có yêu cầu cụ thể cho Module 2–5, có thể phát triển bổ sung từ cấu trúc này.

**Không có backend, tài khoản hay đa người dùng.** Dữ liệu trong IndexedDB được lưu trên chính trình duyệt/máy tính hiện tại. Hãy xuất CSV hoặc JSON định kỳ để sao lưu. Các thay đổi trong RAM khi tắt tự động lưu không được ghi vào IndexedDB nếu chưa bấm **Lưu toàn bộ hiện tại**. Khi dùng chế độ nhập 'Thay thế', dữ liệu cũ bị xóa trước khi chép dữ liệu mới; hãy sao lưu trước.

## 7. Lưu dữ liệu sau khi đổi tên

Dự án được đổi tên hiển thị từ LumiStock thành **GDU StockHub**. Các khóa lưu trữ cục bộ bên trong (ví dụ `lumistock-inventory-v1`, `lumistock-autosave`) **được giữ nguyên có chủ đích** để không mất dữ liệu IndexedDB/tuỳ chọn đã lưu khi người dùng cập nhật ứng dụng tại cùng địa chỉ web. Chúng chỉ là tên kỹ thuật, không hiện trên giao diện.
