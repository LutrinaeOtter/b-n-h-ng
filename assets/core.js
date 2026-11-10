/* GDU StockHub — linked-list data engine (framework-free, browser-ready) */
(function (global) {
  'use strict';
  const LOW_STOCK_LIMIT = 5;
  function normalizeProduct(raw) {
    if (!raw || typeof raw !== 'object') throw new Error('Dữ liệu sản phẩm không hợp lệ.');
    const id = String(raw.id ?? raw.ID ?? '').trim();
    const name = String(raw.name ?? raw.Name ?? '').trim();
    if (!id || id.length > 48 || /[\x00-\x1F\x7F]/.test(id)) throw new Error('ID phải từ 1–48 ký tự và không chứa ký tự điều khiển.');
    if (!name || name.length > 150 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(name)) throw new Error('Tên phải từ 1–150 ký tự.');
    const priceRaw = raw.price ?? raw.Price, stockRaw = raw.stock ?? raw.Stock, ratingRaw = raw.rating ?? raw.Rating;
    if ([priceRaw, stockRaw, ratingRaw].some(v => v === '' || v == null || (typeof v === 'string' && !v.trim()))) throw new Error('Vui lòng nhập đủ giá, tồn kho và đánh giá.');
    const price = Number(priceRaw);
    const stock = Number(stockRaw);
    const rating = Number(ratingRaw);
    if (!Number.isFinite(price) || price < 0 || price > 1e12) throw new Error('Giá phải nằm trong khoảng 0 đến 1.000 tỷ.');
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 1e9) throw new Error('Tồn kho phải là số nguyên từ 0 đến 1 tỷ.');
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) throw new Error('Đánh giá phải từ 0 đến 5.');
    return { id, name, price: Math.round(price), stock, rating: Math.round(rating * 10) / 10 };
  }

  class ProductNode {
    constructor(product) { this.product = product; this.prev = null; this.next = null; }
  }

  class LinkedInventory {
    constructor() {
      this.head = null; this.tail = null; this.size = 0;
      this.byId = new Map(); this.totalValue = 0; this.totalStock = 0;
      this.totalPrice = 0; this.totalRating = 0; this.lowCount = 0; this.outCount = 0;
      this.minOrder = 0; this.maxOrder = 0;
    }
    has(id) { return this.byId.has(String(id)); }
    get(id) { return this.byId.get(String(id))?.product ?? null; }
    add(raw, position = 'tail', savedOrder = null) {
      const product = normalizeProduct(raw);
      if (this.byId.has(product.id)) throw new Error('ID đã tồn tại: ' + product.id);
      if (position !== 'head' && position !== 'tail') throw new Error('Vị trí phải là head hoặc tail.');
      const order = savedOrder == null
        ? (position === 'head' ? this.minOrder - 1 : this.maxOrder + 1)
        : Number(savedOrder);
      if (!Number.isSafeInteger(order)) throw new Error('Giá trị thứ tự không hợp lệ.');
      product.order = order;
      const node = new ProductNode(product);
      if (position === 'head') {
        node.next = this.head;
        if (this.head) this.head.prev = node; else this.tail = node;
        this.head = node;
      } else {
        node.prev = this.tail;
        if (this.tail) this.tail.next = node; else this.head = node;
        this.tail = node;
      }
      if (this.size === 0) this.minOrder = this.maxOrder = order;
      else { this.minOrder = Math.min(this.minOrder, order); this.maxOrder = Math.max(this.maxOrder, order); }
      this.byId.set(product.id, node);
      this.size++; this._adjust(product, +1);
      return product;
    }
    _adjust(p, sign) {
      this.totalValue += sign * (p.price * p.stock);
      this.totalStock += sign * p.stock;
      this.totalPrice += sign * p.price;
      this.totalRating += sign * p.rating;
      if (p.stock <= LOW_STOCK_LIMIT) this.lowCount += sign;
      if (p.stock === 0) this.outCount += sign;
    }
    remove(id) {
      const node = this.byId.get(String(id));
      if (!node) return null;
      const product = node.product;
      if (node.prev) node.prev.next = node.next; else this.head = node.next;
      if (node.next) node.next.prev = node.prev; else this.tail = node.prev;
      this.byId.delete(String(id));
      this.size--; this._adjust(product, -1);
      node.prev = node.next = node.product = null; // break all references immediately
      if (this.size === 0) this.minOrder = this.maxOrder = 0;
      return product;
    }
    update(id, patch) {
      const node = this.byId.get(String(id));
      if (!node) throw new Error('Không tìm thấy sản phẩm.');
      const next = normalizeProduct({ ...node.product, ...patch });
      if (next.id !== String(id) && this.has(next.id)) throw new Error('ID mới đã tồn tại.');
      const old = node.product;
      this._adjust(old, -1);
      next.order = old.order;
      node.product = next;
      this._adjust(next, +1);
      if (next.id !== String(id)) { this.byId.delete(String(id)); this.byId.set(next.id, node); }
      return next;
    }
    *items() { let cur = this.head; while (cur) { yield cur.product; cur = cur.next; } }
    *reverseItems() { let cur = this.tail; while (cur) { yield cur.product; cur = cur.prev; } }
    clear() {
      let cur = this.head;
      while (cur) { const next = cur.next; cur.prev = null; cur.next = null; cur.product = null; cur = next; }
      this.byId.clear(); this.head = this.tail = null;
      this.size = this.totalValue = this.totalStock = this.totalPrice = this.totalRating = 0;
      this.lowCount = this.outCount = this.minOrder = this.maxOrder = 0;
    }
    dispose() { this.clear(); }
    verify() {
      let count = 0, prev = null, sumValue = 0, sumStock = 0, sumPrice = 0, sumRating = 0, low = 0, out = 0, lastOrder = -Infinity;
      if ((this.head == null) !== (this.tail == null)) throw new Error('Head/Tail không đồng nhất.');
      if (this.head?.prev) throw new Error('Head.prev phải là null.');
      if (this.tail?.next) throw new Error('Tail.next phải là null.');
      for (let node = this.head; node; node = node.next) {
        if (++count > this.size) throw new Error('Phát hiện chu trình hoặc size sai.');
        if (node.prev !== prev) throw new Error('Liên kết prev bị lỗi tại phần tử ' + count);
        if (!node.product || this.byId.get(node.product.id) !== node) throw new Error('Map sai hoặc Node không chứa Product.');
        const p = node.product;
        if (p.order <= lastOrder) throw new Error('Thứ tự lưu trữ không tăng dần.');
        lastOrder = p.order;
        sumValue += p.price * p.stock; sumStock += p.stock; sumPrice += p.price; sumRating += p.rating;
        if (p.stock <= LOW_STOCK_LIMIT) low++;
        if (p.stock === 0) out++;
        prev = node;
      }
      if (count !== this.size || this.byId.size !== count || prev !== this.tail) throw new Error('Số lượng Node hoặc tail không chính xác.');
      let backwards = 0, next = null;
      for (let node = this.tail; node; node = node.prev) {
        if (++backwards > this.size || node.next !== next) throw new Error('Liên kết next bị lỗi khi duyệt ngược.');
        next = node;
      }
      if (backwards !== count || next !== this.head) throw new Error('Liên kết hai chiều không khớp.');
      const close = (a, b) => Math.abs(a - b) < Math.max(0.001, Math.abs(a) * 1e-10);
      if (![close(sumValue, this.totalValue), close(sumStock, this.totalStock), close(sumPrice, this.totalPrice), close(sumRating, this.totalRating)].every(Boolean) || low !== this.lowCount || out !== this.outCount) throw new Error('Thống kê tăng dần bị sai.');
      return { count, index: this.byId.size, status: 'OK' };
    }
    summary() { return { count: this.size, totalValue: this.totalValue, totalStock: this.totalStock, totalPrice: this.totalPrice, lowCount: this.lowCount, outCount: this.outCount, avgRating: this.size ? this.totalRating / this.size : 0 }; }
    distribution() {
      const data = { available: 0, low: 0, out: 0, ratings: [0, 0, 0, 0, 0, 0], top: [] };
      for (const p of this.items()) {
        if (p.stock === 0) data.out++;
        else if (p.stock <= LOW_STOCK_LIMIT) data.low++;
        else data.available++;
        data.ratings[Math.min(5, Math.floor(p.rating))]++;
        const value = p.price * p.stock;
        if (!data.top.length || value > data.top[data.top.length - 1].value || data.top.length < 8) {
          data.top.push({ id: p.id, name: p.name, value, stock: p.stock });
          data.top.sort((a, b) => b.value - a.value);
          if (data.top.length > 8) data.top.pop();
        }
      }
      return data;
    }
  }

  /* IndexedDB is an optional durable mirror. The linked list remains the source of truth in memory. */
  class InventoryDatabase {
    constructor(database) { this.database = database; }
    static open() {
      return new Promise((resolve, reject) => {
        if (!('indexedDB' in global)) { reject(new Error('IndexedDB không có trên trình duyệt.')); return; }
        let request;
        try { request = global.indexedDB.open('lumistock-inventory-v1', 1); }
        catch (error) { reject(error); return; }
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('products')) {
            const store = db.createObjectStore('products', { keyPath: 'id' });
            store.createIndex('order', 'order', { unique: false });
          }
        };
        request.onsuccess = () => resolve(new InventoryDatabase(request.result));
        request.onerror = () => reject(request.error || new Error('Không mở được IndexedDB.'));
      });
    }
    _transaction(mode, operation) {
      return new Promise((resolve, reject) => {
        let transaction;
        try { transaction = this.database.transaction('products', mode); operation(transaction.objectStore('products')); }
        catch (error) { reject(error); return; }
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('Thao tác IndexedDB thất bại.'));
        transaction.onabort = () => reject(transaction.error || new Error('Giao dịch IndexedDB bị hủy.'));
      });
    }
    all() {
      return new Promise((resolve, reject) => {
        let request;
        try { request = this.database.transaction('products', 'readonly').objectStore('products').index('order').getAll(); }
        catch (error) { reject(error); return; }
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    save(p) { return this._transaction('readwrite', store => store.put(p)); }
    saveMany(products) { if (!products.length) return Promise.resolve(); return this._transaction('readwrite', store => { for (const p of products) store.put(p); }); }
    delete(id) { return this._transaction('readwrite', store => store.delete(String(id))); }
    clear() { return this._transaction('readwrite', store => store.clear()); }
    close() { this.database.close(); }
  }

  function* parseCSV(text) {
    let value = '', row = [], inside = false;
    const separator = (() => {
      const firstLine = text.slice(0, 400).split(/\r?\n/)[0];
      return firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
    })();
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inside && text[i + 1] === '"') { value += '"'; i++; }
        else inside = !inside;
      } else if (c === separator && !inside) {
        row.push(value); value = '';
      } else if ((c === '\n' || c === '\r') && !inside) {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(value); value = '';
        if (row.some(v => v.trim() !== '')) yield row;
        row = [];
      } else value += c;
    }
    if (inside) throw new Error('File CSV có dấu nháy kép chưa đóng.');
    if (value !== '' || row.length) { row.push(value); if (row.some(v => v.trim() !== '')) yield row; }
  }
  const normalizeHeader = s => String(s).replace(/^\uFEFF/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[\s_-]/g, '').toLowerCase();
  function rowAliases(header) {
    const names = ['id', 'name', 'price', 'stock', 'rating'];
    const aliases = {
      id: ['id', 'masanpham', 'masp', 'productid', 'sku'],
      name: ['name', 'tensanpham', 'tensp', 'productname', 'ten'],
      price: ['price', 'gia', 'dongia', 'giaban'],
      stock: ['stock', 'tonkho', 'soluong', 'quantity', 'inventory'],
      rating: ['rating', 'danhgia', 'sao', 'stars', 'rate']
    };
    const map = names.map(k => header.findIndex(x => aliases[k].includes(normalizeHeader(x))));
    return map.every(i => i >= 0) ? map : null;
  }
  function coerceNumber(n, isMoney = false) {
    let s = String(n ?? '').trim();
    if (!s) return NaN;
    s = s.replace(/[₫đ\s]/gi, '');
    if (isMoney) {
      if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
      else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
      else s = s.replace(',', '.');
    } else s = s.replace(',', '.');
    return Number(s);
  }
  function* csvProducts(text) {
    const iterator = parseCSV(text);
    const first = iterator.next();
    if (first.done) return;
    const headerMap = rowAliases(first.value);
    const map = headerMap || [0, 1, 2, 3, 4];
    const convert = r => ({ id: r[map[0]], name: r[map[1]], price: coerceNumber(r[map[2]], true), stock: coerceNumber(r[map[3]]), rating: coerceNumber(r[map[4]]) });
    if (!headerMap) yield convert(first.value);
    for (const row of iterator) yield convert(row);
  }
  function csvEscape(value) {
    let s = String(value ?? '');
    // Protect spreadsheet software from interpreting product names / IDs as formulas.
    if (/^[\s]*[=+@\-\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = "'" + s;
    return /[,"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function csvFromProducts(iterator) {
    const lines = ['id,name,price,stock,rating'];
    for (const p of iterator) lines.push([p.id, p.name, p.price, p.stock, p.rating].map(csvEscape).join(','));
    return '\uFEFF' + lines.join('\r\n');
  }
  function makeMockProduct(i, prefix = 'MK') {
    const names = ['MacBook Pro', 'Tai nghe Bluetooth', 'Bàn phím cơ', 'Chuột không dây', 'Màn hình 27 inch', 'SSD NVMe', 'Webcam 4K', 'Loa mini', 'Máy ảnh Mirrorless', 'Hub USB-C', 'Bàn nâng hạ', 'Ghế công thái học', 'Đèn học LED', 'Sạc nhanh GaN', 'Máy tính bảng', 'Micro thu âm'];
    const brand = ['Aurora', 'Nova', 'Zen', 'Pixel', 'Lumi', 'Orbit', 'Vega', 'Aero'];
    const n = (i * 17 + 13) % names.length;
    const price = (1 + ((i * 7919) % 2400)) * 10000;
    const stock = ((i * 37 + 17) % 28 === 0) ? 0 : ((i * 127 + 11) % 90) + 1;
    const rating = Math.round((3.0 + ((i * 31) % 21) / 10) * 10) / 10;
    return { id: `${prefix}-${String(i).padStart(6, '0')}`, name: `${names[n]} ${brand[(i * 11) % 8]} ${100 + (i % 899)}`, price, stock, rating };
  }

  global.LumiCore = { LinkedInventory, InventoryDatabase, normalizeProduct, csvProducts, csvFromProducts, makeMockProduct, LOW_STOCK_LIMIT };
})(window);
