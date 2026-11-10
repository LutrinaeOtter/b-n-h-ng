/* GDU StockHub — UI + application orchestration */
(function () {
  'use strict';
  const { LinkedInventory, InventoryDatabase, normalizeProduct, csvProducts, csvFromProducts, makeMockProduct } = window.LumiCore;
  const icons = {
    'boxes':'<path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/><path d="m12 11 8-4.5M12 11 4 6.5M12 11v9"/><path d="m9 4 8 4.5"/>',
    'layout-dashboard':'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    'package':'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10"/><path d="m7.5 4.5 9 5"/>',
    'database':'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v7c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 12v7c0 1.66 4.03 3 9 3s9-1.34 9-3v-7"/>',
    'chart-column':'<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" rx=".4"/><rect x="12" y="8" width="3" height="10" rx=".4"/><rect x="17" y="5" width="3" height="13" rx=".4"/>',
    'settings-2':'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    'check-circle-2':'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    'chevron-right':'<path d="m9 18 6-6-6-6"/>',
    'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
    'plus':'<path d="M12 5v14M5 12h14"/>',
    'plus-circle':'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    'upload-cloud':'<path d="M20 16.5a4 4 0 0 0-3-7.5 6.5 6.5 0 0 0-12.6 1.7A4.5 4.5 0 0 0 6 19h3"/><path d="m12 19 0-9m-3 3 3-3 3 3"/>',
    'cloud-upload':'<path d="M20 16.5a4 4 0 0 0-3-7.5 6.5 6.5 0 0 0-12.6 1.7A4.5 4.5 0 0 0 6 19h3"/><path d="M12 21V11m-4 4 4-4 4 4"/>',
    'trending-up':'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    'sparkles':'<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>',
    'wallet':'<path d="M20 8V5a2 2 0 0 0-2-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a3 3 0 0 1-3-3"/><path d="M21 12h-6a3 3 0 0 0 0 6h6"/><circle cx="16" cy="15" r=".7"/>',
    'alert-triangle':'<path d="m10.3 4.3-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-2.7l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
    'star':'<path d="m12 2 3.1 6.3 7 .9-5 4.9 1.2 6.9-6.3-3.3-6.3 3.3 1.2-6.9-5-4.9 7-.9L12 2Z"/>',
    'arrow-up-right':'<path d="M6 18 18 6M8 6h10v10"/>',
    'chart-no-axes-column':'<path d="M5 20v-7M10 20V8M15 20V4M20 20v-11"/>',
    'file-up':'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M13 2v7h7M12 19v-7m-3 3 3-3 3 3"/>',
    'zap':'<path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/>',
    'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    'download':'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
    'link':'<path d="M10 13a5 5 0 0 0 7 .2l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7-.2l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    'chevrons-left':'<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
    'chevron-left':'<path d="m15 18-6-6 6-6"/>',
    'chevrons-right':'<path d="m13 17 5-5-5-5M6 17l5-5-5-5"/>',
    'edit-3':'<path d="M12 20h9M5 20h3l11-11-3-3L5 17v3ZM14 8l3 3"/>',
    'trash-2':'<path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    'refresh-cw':'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 9a7 7 0 0 1 12-2l2 5M4 12l2 5a7 7 0 0 0 12-2"/>',
    'trophy':'<path d="M7 3h10v5a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 5 4M17 5h4v3a4 4 0 0 1-5 4M12 13v5m-4 3h8m-6-3h4"/>',
    'hard-drive':'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 13h18"/><circle cx="7" cy="16" r=".5"/><path d="M11 16h5"/>',
    'activity':'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    'scan-search':'<path d="M4 9V5a1 1 0 0 1 1-1h4m6 0h4a1 1 0 0 1 1 1v4M4 15v4a1 1 0 0 0 1 1h4m6 0h4a1 1 0 0 0 1-1v-4"/><circle cx="11" cy="11" r="3"/><path d="m13.5 13.5 2.5 2.5"/>',
    'download-cloud':'<path d="M20 16a4 4 0 0 0-3-7 6.5 6.5 0 0 0-12 2A4 4 0 0 0 6 19h3"/><path d="M12 11v10m-4-4 4 4 4-4"/>',
    'file-spreadsheet':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8M12 12v6"/>',
    'file-json':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M10 12c-2 0-2 2-2 3s0 3-2 3m8-6c2 0 2 2 2 3s0 3 2 3"/>',
    'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    'x':'<path d="M6 6 18 18M18 6 6 18"/>',
    'arrow-up-to-line':'<path d="M4 4h16m-8 16V8m-5 5 5-5 5 5"/>',
    'arrow-down-to-line':'<path d="M4 20h16M12 4v12m-5-5 5 5 5-5"/>',
    'check':'<path d="m4 12 5 5L20 6"/>',
    'save':'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M7 3v6h9V3M7 21v-8h10v8"/>',
    'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'
  };
  const ico = (name, classes = '') => `<svg class="${classes}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.package}</svg>`;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const text = (id, value) => { const e = document.getElementById(id); if (e) e.textContent = value; };
  const fmt = n => new Intl.NumberFormat('vi-VN').format(n);
  const money = n => `${fmt(Math.round(n))} ₫`;
  const shortMoney = n => n >= 1e12 ? `${(n / 1e12).toLocaleString('vi-VN',{maximumFractionDigits:2})} nghìn tỷ ₫` : n >= 1e9 ? `${(n / 1e9).toLocaleString('vi-VN',{maximumFractionDigits:2})} tỷ ₫` : money(n);
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));
  const inventory = new LinkedInventory();
  const state = { db: null, autoSave: true, page: 'overview', busy: false, filtered: null, search: '', stock: 'all', sort: 'linked', pageNo: 1, pageSize: 25, recentIds: [], logs: [], editId: null, confirmResolve: null, hasBooted: false };
  const names = { overview:'Tổng quan',products:'Kho sản phẩm',imports:'Nạp dữ liệu',reports:'Báo cáo',settings:'Cài đặt' };
  const getSetting = (key, otherwise) => { try { return localStorage.getItem(key) ?? otherwise; } catch { return otherwise; } };
  const setSetting = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

  function hydrateIcons(parent = document) {
    $$('[data-icon]', parent).forEach(el => { el.innerHTML = ico(el.dataset.icon); el.removeAttribute('data-icon'); });
  }
  function toast(message, type = 'success') {
    const wrap = $('#toast-container');
    const div = document.createElement('div'); div.className = 'toast' + (type === 'error' ? ' error' : '');
    div.innerHTML = `${ico(type === 'error' ? 'alert-triangle' : 'check-circle-2')}<span>${safe(message)}</span><button type="button" aria-label="Đóng thông báo">×</button>`;
    $('button', div).addEventListener('click', () => div.remove());
    wrap.prepend(div); setTimeout(() => div.remove(), 5800);
  }
  function log(message, subtitle, error = false) {
    state.logs.unshift({ message, subtitle, error, time: new Date() });
    state.logs.length = Math.min(12, state.logs.length);
    const box = $('#import-log');
    box.innerHTML = state.logs.map(x => `<div class="log-entry ${x.error ? 'error' : ''}">${ico(x.error ? 'alert-triangle' : 'check-circle-2')}<div><strong>${safe(x.message)}</strong><small>${safe(x.subtitle)}</small></div><time>${x.time.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</time></div>`).join('') || '<div class="empty-small">Chưa có hoạt động nạp dữ liệu trong phiên này.</div>';
  }
  function setBusy(value, title) {
    state.busy = value;
    $('#generate-mock').disabled = value;
    $('#quick-100k').disabled = value;
    $('#save-snapshot').disabled = value;
    $('#verify-list').disabled = value;
    $('#clear-inventory').disabled = value;
    $('#file-input').disabled = value;
    $('#dropzone').style.pointerEvents = value ? 'none' : '';
    if (title) text('progress-title', title);
  }
  function setProgress(done, total, sub) {
    $('#progress-panel').hidden = false;
    const value = total ? Math.min(99, Math.floor(done / total * 100)) : 0;
    text('progress-percent', `${value}%`);
    $('#progress-bar').style.width = value + '%';
    if (sub) text('progress-subtitle', sub);
  }
  function finishProgress(msg) {
    text('progress-percent', '100%'); $('#progress-bar').style.width = '100%';
    text('progress-title', msg); text('progress-subtitle', 'Tất cả lô dữ liệu đã được xử lý.');
  }
  function navigate(page) {
    if (!names[page]) page = 'overview';
    state.page = page;
    $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    text('breadcrumb-current', names[page]);
    $('#sidebar').classList.remove('open');
    window.scrollTo({ top:0, behavior:'instant' });
    if (page === 'products') renderProducts();
    else if (page === 'reports') renderReports();
    else if (page === 'overview') renderOverview();
    else if (page === 'settings') renderDbStatus();
  }
  function goto(page) { if (location.hash !== '#' + page) location.hash = page; else navigate(page); }
  function invalidate() { state.filtered = null; }
  function afterChange() {
    invalidate(); renderStats();
    if (state.page === 'overview') renderOverview();
    if (state.page === 'products') renderProducts();
    if (state.page === 'reports') renderReports();
  }
  function renderStats() {
    const s = inventory.summary();
    text('stat-products', fmt(s.count)); text('stat-value', shortMoney(s.totalValue));
    text('stat-low', fmt(s.lowCount)); text('stat-out', `${fmt(s.outCount)} hết hàng`);
    text('stat-rating', `${s.avgRating.toFixed(1)} / 5.0`);
    text('sidebar-product-count', s.count >= 100000 ? `${fmt(Math.floor(s.count / 1000))}k+` : s.count >= 1000 ? `${fmt(Math.floor(s.count / 1000))}k` : fmt(s.count));
  }
  function stockBars(d) {
    const total = Math.max(d.available + d.low + d.out, 1);
    return [['Còn hàng', d.available, 'good'], ['Sắp hết', d.low, 'low'], ['Hết hàng', d.out, 'out']]
      .map(([label,value,status]) => `<div class="stock-row"><span class="stock-name">${label}</span><div class="stock-track"><div class="stock-fill fill-${status}" style="width:${(value / total * 100).toFixed(3)}%"></div></div><span class="stock-number">${fmt(value)}</span></div>`).join('');
  }
  function renderOverview() {
    const d = inventory.distribution();
    $('#overview-stock-bars').innerHTML = stockBars(d);
    const recent = [];
    const used = new Set();
    for (const id of state.recentIds) { const p = inventory.get(id); if (p && !used.has(p.id)) { recent.push(p); used.add(p.id); } if (recent.length >= 4) break; }
    if (recent.length < 4) for (const p of inventory.reverseItems()) { if (!used.has(p.id)) { recent.push(p); used.add(p.id); } if (recent.length >= 4) break; }
    $('#overview-recent').innerHTML = recent.map(p => `<div class="recent-item"><span class="recent-icon">${ico('package')}</span><div class="recent-body"><strong title="${safe(p.name)}">${safe(p.name)}</strong><small>${safe(p.id)} • ${fmt(p.stock)} tồn kho</small></div><span class="recent-amount">${money(p.price)}</span></div>`).join('') || '<div class="empty-small">Chưa có sản phẩm. Hãy thêm mới hoặc nạp dữ liệu.</div>';
  }
  function filteredProducts() {
    if (state.filtered) return state.filtered;
    const query = state.search.trim().toLocaleLowerCase('vi');
    const result = [];
    for (const p of inventory.items()) {
      if (query && !`${p.id} ${p.name}`.toLocaleLowerCase('vi').includes(query)) continue;
      if (state.stock === 'available' && p.stock <= 5) continue;
      if (state.stock === 'low' && !(p.stock >= 1 && p.stock <= 5)) continue;
      if (state.stock === 'out' && p.stock !== 0) continue;
      result.push(p);
    }
    const sorters = {
      price_desc:(a,b) => b.price - a.price || a.order - b.order,
      price_asc:(a,b) => a.price - b.price || a.order - b.order,
      rating_desc:(a,b) => b.rating - a.rating || a.order - b.order,
      stock_asc:(a,b) => a.stock - b.stock || a.order - b.order,
      name_asc:(a,b) => a.name.localeCompare(b.name,'vi') || a.order - b.order
    };
    if (sorters[state.sort]) result.sort(sorters[state.sort]);
    state.filtered = result;
    return result;
  }
  function renderProducts() {
    const all = filteredProducts();
    const pages = Math.max(1, Math.ceil(all.length / state.pageSize));
    state.pageNo = Math.min(Math.max(state.pageNo, 1), pages);
    const start = (state.pageNo - 1) * state.pageSize;
    const slice = all.slice(start, start + state.pageSize);
    text('results-count', `${fmt(all.length)} / ${fmt(inventory.size)} sản phẩm`);
    text('page-info', `Trang ${fmt(state.pageNo)} / ${fmt(pages)}`);
    $('#first-page').disabled = $('#prev-page').disabled = state.pageNo === 1;
    $('#next-page').disabled = $('#last-page').disabled = state.pageNo === pages;
    $('#product-tbody').innerHTML = slice.map(p => {
      const status = p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'good';
      const label = status === 'out' ? 'Hết hàng' : status === 'low' ? `Còn ${fmt(p.stock)}` : fmt(p.stock);
      return `<tr><td><div class="product-cell"><span class="product-thumb">${ico('package')}</span><span><strong title="${safe(p.name)}">${safe(p.name)}</strong><small>Sản phẩm kho</small></span></div></td><td><span class="id-code">${safe(p.id)}</span></td><td class="align-right price-cell">${money(p.price)}</td><td class="align-center"><span class="stock-badge ${status}"><span class="tiny-dot"></span>${label}</span></td><td class="align-center"><span class="rating-cell">${ico('star')} ${p.rating.toFixed(1)}</span></td><td class="align-right"><div class="row-actions"><button type="button" class="tiny-button" data-edit="${safe(p.id)}" aria-label="Sửa ${safe(p.name)}" title="Chỉnh sửa">${ico('edit-3')}</button><button type="button" class="tiny-button danger" data-delete="${safe(p.id)}" aria-label="Xóa ${safe(p.name)}" title="Xóa">${ico('trash-2')}</button></div></td></tr>`;
    }).join('') || `<tr><td colspan="6" class="empty-table">Không có sản phẩm phù hợp. Hãy thay đổi bộ lọc hoặc nạp dữ liệu mới.</td></tr>`;
  }
  function renderReports() {
    const s = inventory.summary(); const d = inventory.distribution();
    text('report-units', fmt(s.totalStock)); text('report-out', fmt(s.outCount));
    text('report-average-price', shortMoney(s.count ? s.totalPrice / s.count : 0));
    $('#report-stock-bars').innerHTML = stockBars(d);
    const total = Math.max(s.count, 1);
    $('#rating-bars').innerHTML = [5,4,3,2,1,0].map(i => `<div class="rating-row"><span class="stars">${i} ★</span><div class="rating-track"><div style="width:${(d.ratings[i] / total * 100).toFixed(3)}%"></div></div><span class="number">${fmt(d.ratings[i])}</span></div>`).join('');
    $('#top-products-list').innerHTML = d.top.map((p,i) => `<div class="top-line"><span class="top-rank">${String(i + 1).padStart(2,'0')}</span><div class="top-title"><strong>${safe(p.name)}</strong><small>${safe(p.id)} • ${fmt(p.stock)} tồn kho</small></div><span class="top-val">${money(p.value)}</span></div>`).join('') || '<div class="empty-small">Chưa có dữ liệu để thống kê.</div>';
  }
  function renderDbStatus() {
    const hasDb = !!state.db;
    const desc = !hasDb ? 'IndexedDB không khả dụng • Chỉ lưu tạm trong RAM' : state.autoSave ? 'IndexedDB đã kết nối • Tự động lưu đang bật' : 'IndexedDB đã kết nối • Tự động lưu đang tắt';
    text('db-status', desc);
    text('storage-pill', !hasDb ? 'Chỉ lưu trong RAM' : state.autoSave ? 'Đã kết nối IndexedDB' : 'Lưu thủ công');
    $('#storage-pill').classList.toggle('offline', !hasDb || !state.autoSave);
    $('#storage-pill').insertAdjacentHTML('afterbegin', '<span class="online-dot"></span>');
  }
  function markRecent(id) { state.recentIds.unshift(id); state.recentIds = [...new Set(state.recentIds)].slice(0, 8); }

  function openProductModal(id = null) {
    if (state.busy) { toast('Đang xử lý dữ liệu. Hãy hoàn tất tác vụ hiện tại.', 'error'); return; }
    state.editId = id;
    const p = id ? inventory.get(id) : null;
    if (id && !p) { toast('Sản phẩm không còn tồn tại.', 'error'); return; }
    text('modal-title', p ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới');
    text('modal-kicker', p ? 'UPDATE PRODUCT' : 'PRODUCT ENTRY');
    text('modal-submit', p ? 'Lưu thay đổi' : 'Lưu sản phẩm');
    $('#modal-submit').insertAdjacentHTML('afterbegin', ico('check') + ' ');
    $('#field-id').value = p?.id ?? '';
    $('#field-name').value = p?.name ?? '';
    $('#field-price').value = p?.price ?? '';
    $('#field-stock').value = p?.stock ?? '';
    $('#field-rating').value = p?.rating ?? '';
    $('#position-fieldset').hidden = !!p;
    $('#form-error').hidden = true;
    $('#product-modal').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#field-id').focus(), 30);
  }
  function closeProductModal() { $('#product-modal').hidden = true; document.body.style.overflow = ''; state.editId = null; }
  function openConfirm(title, message, acceptText = 'Xác nhận') {
    return new Promise(resolve => {
      if (state.confirmResolve) state.confirmResolve(false);
      state.confirmResolve = resolve;
      text('confirm-title', title); text('confirm-message', message); text('confirm-accept', acceptText);
      $('#confirm-modal').hidden = false;
      document.body.style.overflow = 'hidden';
      $('#confirm-cancel').focus();
    });
  }
  function closeConfirm(choice) {
    $('#confirm-modal').hidden = true; document.body.style.overflow = '';
    const resolve = state.confirmResolve; state.confirmResolve = null;
    if (resolve) resolve(choice);
  }
  async function saveOne(p) {
    if (!state.db || !state.autoSave) return;
    try { await state.db.save(p); }
    catch (e) { toast('Không lưu được vào IndexedDB: ' + e.message, 'error'); }
  }
  async function deleteOne(id) {
    if (!state.db || !state.autoSave) return;
    try { await state.db.delete(id); }
    catch (e) { toast('Không thể đồng bộ thao tác xóa: ' + e.message, 'error'); }
  }
  async function handleProductSubmit(event) {
    event.preventDefault(); if (state.busy) return;
    const formError = $('#form-error'); formError.hidden = true;
    try {
      const product = normalizeProduct({ id: $('#field-id').value, name: $('#field-name').value, price: $('#field-price').value, stock: $('#field-stock').value, rating: $('#field-rating').value });
      const oldId = state.editId;
      if (oldId) {
        const changed = inventory.update(oldId, product);
        if (state.db && state.autoSave && oldId !== changed.id) await deleteOne(oldId);
        await saveOne(changed);
        toast('Đã cập nhật sản phẩm ' + changed.id);
      } else {
        const position = $('input[name="position"]:checked').value;
        const inserted = inventory.add(product, position);
        await saveOne(inserted);
        markRecent(inserted.id);
        toast(`Đã thêm ${inserted.id} vào ${position === 'head' ? 'đầu' : 'cuối'} danh sách.`);
      }
      closeProductModal(); afterChange();
    } catch (e) { formError.hidden = false; formError.textContent = e.message; }
  }
  async function handleDelete(id) {
    if (state.busy) return;
    const p = inventory.get(id); if (!p) return;
    if (!await openConfirm('Xóa sản phẩm?', `Bạn sắp xóa ${p.name} (${p.id}) khỏi danh sách liên kết.`, 'Xóa sản phẩm')) return;
    inventory.remove(id); await deleteOne(id); afterChange(); toast('Đã xóa sản phẩm ' + id);
  }
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  function exportData(type) {
    if (state.busy) return;
    const stamp = new Date().toISOString().slice(0,10);
    try {
      if (type === 'csv') {
        const csv = csvFromProducts(inventory.items());
        triggerDownload(new Blob([csv], { type:'text/csv;charset=utf-8;' }), `gdu-stockhub-${stamp}.csv`);
      } else {
        const json = JSON.stringify({ app:'GDU StockHub', version:1, exportedAt:new Date().toISOString(), products:[...inventory.items()].map(p => ({ id:p.id, name:p.name, price:p.price, stock:p.stock, rating:p.rating })) }, null, 2);
        triggerDownload(new Blob([json], { type:'application/json;charset=utf-8;' }), `gdu-stockhub-${stamp}.json`);
      }
      toast(`Đã xuất ${fmt(inventory.size)} sản phẩm dưới dạng ${type.toUpperCase()}.`);
    } catch (e) { toast('Không thể tạo file: ' + e.message, 'error'); }
  }
  async function persistBatch(batch) {
    if (!batch.length || !state.db || !state.autoSave) return;
    try { await state.db.saveMany(batch); }
    catch (e) { throw new Error('Không lưu được lô dữ liệu: ' + e.message); }
  }
  async function generateMock(count, prefix = null, markAsActivity = true) {
    if (state.busy) return;
    const unique = prefix || 'MK' + Date.now().toString(36).toUpperCase();
    goto('imports'); setBusy(true, `Đang sinh ${fmt(count)} sản phẩm...`);
    const begin = performance.now(); let added = 0;
    try {
      for (let i = 1; i <= count; i += 2000) {
        const batch = [];
        for (let j = i; j < Math.min(i + 2000, count + 1); j++) {
          let raw = makeMockProduct(j, unique);
          if (inventory.has(raw.id)) continue;
          batch.push(inventory.add(raw, 'tail')); added++;
        }
        await persistBatch(batch);
        setProgress(Math.min(i + 1999, count), count, `Đã nạp ${fmt(added)} sản phẩm • ${fmt(inventory.size)} sản phẩm trong kho`);
        await tick();
      }
      for (const p of inventory.reverseItems()) { markRecent(p.id); if (state.recentIds.length >= 4) break; }
      afterChange(); finishProgress('Tạo dữ liệu mẫu thành công!');
      const secs = ((performance.now() - begin) / 1000).toFixed(2);
      if (markAsActivity) log(`Đã tạo ${fmt(added)} sản phẩm`, `Hoàn thành trong ${secs}s • Tổng ${fmt(inventory.size)} sản phẩm.`);
      toast(`Đã sinh ${fmt(added)} sản phẩm trong ${secs}s.`);
    } catch (e) {
      log('Lỗi khi tạo mock data', e.message, true);
      toast(e.message, 'error'); afterChange();
      text('progress-title', 'Đã dừng do lỗi');
    } finally { setBusy(false); }
  }
  async function loadFile(file) {
    if (state.busy || !file) return;
    const extension = file.name.toLowerCase().split('.').pop();
    if (!['csv','json'].includes(extension)) { toast('Chỉ hỗ trợ CSV hoặc JSON.', 'error'); return; }
    if (file.size > 100 * 1024 * 1024) { toast('File vượt quá 100 MB. Hãy chia nhỏ dữ liệu.', 'error'); return; }
    const mode = $('input[name="import-mode"]:checked').value;
    if (mode === 'replace' && !await openConfirm('Thay thế toàn bộ kho?', 'Tất cả sản phẩm cũ sẽ bị xóa trước khi nạp dữ liệu mới. Hãy xuất bản sao trước nếu cần.', 'Thay thế kho')) return;
    goto('imports'); setBusy(true, `Đang nhập: ${file.name}`);
    let accepted = 0, invalid = 0, dup = 0, processed = 0;
    let errors = []; const began = performance.now();
    try {
      const rawText = await file.text();
      let source, estimate;
      if (extension === 'json') {
        const data = JSON.parse(rawText);
        source = Array.isArray(data) ? data : data.products;
        if (!Array.isArray(source)) throw new Error('JSON phải là một mảng Product hoặc object có thuộc tính products là mảng.');
        estimate = source.length;
      } else {
        source = csvProducts(rawText);
        estimate = Math.max(1, (rawText.match(/\n/g) || []).length);
      }
      if (mode === 'replace') {
        inventory.clear(); state.recentIds = []; invalidate();
        if (state.db && state.autoSave) await state.db.clear();
      }
      let batch = [];
      for (const row of source) {
        processed++;
        try {
          const p = normalizeProduct(row);
          if (inventory.has(p.id)) dup++;
          else { const saved = inventory.add(p, 'tail'); batch.push(saved); accepted++; }
        } catch (e) { invalid++; if (errors.length < 4) errors.push(`Dòng ${processed}: ${e.message}`); }
        if (processed % 2000 === 0) {
          await persistBatch(batch); batch = [];
          setProgress(processed, estimate, `Hợp lệ: ${fmt(accepted)} • Trùng ID: ${fmt(dup)} • Lỗi: ${fmt(invalid)}`);
          await tick();
        }
      }
      await persistBatch(batch);
      for (const p of inventory.reverseItems()) { markRecent(p.id); if (state.recentIds.length >= 4) break; }
      afterChange(); finishProgress('Nhập dữ liệu thành công!');
      const secs = ((performance.now() - began) / 1000).toFixed(2);
      log(`Đã nhập ${fmt(accepted)} / ${fmt(processed)} dòng`, `${file.name} • ${secs}s • ${fmt(dup)} trùng ID • ${fmt(invalid)} lỗi${errors.length ? ' • ' + errors.join(' | ') : ''}`);
      toast(`Nhập thành công ${fmt(accepted)} sản phẩm, bỏ qua ${fmt(dup)} ID trùng và ${fmt(invalid)} dòng lỗi.`);
    } catch (e) {
      log('Nhập dữ liệu thất bại', e.message, true);
      toast('Nhập dữ liệu thất bại: ' + e.message, 'error'); afterChange();
      text('progress-title', 'Đã dừng do lỗi');
    } finally { setBusy(false); $('#file-input').value = ''; }
  }
  async function saveSnapshot() {
    if (state.busy) return;
    if (!state.db) { toast('Trình duyệt chưa hỗ trợ IndexedDB trên địa chỉ này.', 'error'); return; }
    if (!await openConfirm('Lưu lại toàn bộ kho?', 'Bản lưu IndexedDB hiện tại sẽ được thay thế bằng danh sách sản phẩm đang hiển thị.', 'Lưu kho')) return;
    setBusy(true, 'Đang lưu bản sao đầy đủ...'); goto('imports');
    try {
      await state.db.clear();
      let processed = 0, batch = [];
      for (const p of inventory.items()) {
        batch.push(p); processed++;
        if (batch.length >= 2000) {
          await state.db.saveMany(batch); batch = [];
          setProgress(processed, inventory.size, `Đã lưu ${fmt(processed)} / ${fmt(inventory.size)} bản ghi.`);
          await tick();
        }
      }
      if (batch.length) await state.db.saveMany(batch);
      finishProgress('Đã lưu bản sao đầy đủ.'); toast(`Đã lưu ${fmt(processed)} sản phẩm vào IndexedDB.`);
      log('Đã sao lưu dữ liệu', `${fmt(processed)} sản phẩm được lưu vào IndexedDB.`);
    } catch (e) { toast('Lưu thất bại: ' + e.message, 'error'); log('Lưu thất bại', e.message, true); }
    finally { setBusy(false); }
  }
  async function clearInventory() {
    if (state.busy) return;
    if (!await openConfirm('Xóa sạch toàn bộ kho?', `Thao tác sẽ xóa ${fmt(inventory.size)} sản phẩm khỏi RAM và IndexedDB. Hành động này không thể hoàn tác.`, 'Xóa tất cả')) return;
    const count = inventory.size; inventory.clear(); state.recentIds = [];
    // Destructive reset always deletes persistent data, even if auto-save is off.
    if (state.db) {
      try { await state.db.clear(); }
      catch (e) { toast('Kho trong RAM đã xóa nhưng IndexedDB chưa xóa: ' + e.message, 'error'); }
    }
    setSetting('lumistock-initialized','yes');
    afterChange(); toast(`Đã xóa ${fmt(count)} sản phẩm và tháo các liên kết Node.`);
  }
  function verifyList() {
    const t = performance.now();
    try {
      const res = inventory.verify();
      const elapsed = (performance.now() - t).toFixed(2);
      text('diagnostic-result', `✓ PASS — ${fmt(res.count)} Node, ${fmt(res.index)} Map entry • ${elapsed} ms • Liên kết 2 chiều hợp lệ.`);
      $('#diagnostic-result').classList.remove('error');
      toast('Kiểm định Linked List thành công.');
    } catch (e) {
      text('diagnostic-result', '✕ FAIL — ' + e.message);
      $('#diagnostic-result').classList.add('error');
      toast('Kiểm định thất bại: ' + e.message, 'error');
    }
  }
  async function restore() {
    state.autoSave = getSetting('lumistock-autosave', 'true') !== 'false';
    $('#autosave-toggle').checked = state.autoSave;
    text('today-chip', new Intl.DateTimeFormat('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date()));
    try {
      state.db = await InventoryDatabase.open();
      const rows = await state.db.all();
      if (rows.length) {
        $('#busy-shield').hidden = false;
        text('busy-text', `Đang khôi phục ${fmt(rows.length)} sản phẩm...`);
        for (let i = 0; i < rows.length; i += 2000) {
          const batch = rows.slice(i, i + 2000);
          for (const p of batch) inventory.add(p, 'tail', p.order);
          if (i % 10000 === 0) { text('busy-text', `Khôi phục ${fmt(Math.min(i + 2000,rows.length))} / ${fmt(rows.length)} sản phẩm...`); await tick(); }
        }
        rows.length = 0;
      } else if (getSetting('lumistock-initialized', '') !== 'yes') {
        const batch = [];
        for (let i = 1; i <= 64; i++) batch.push(inventory.add(makeMockProduct(i,'DEMO')));
        if (state.autoSave) await state.db.saveMany(batch);
        setSetting('lumistock-initialized','yes');
        log('Khởi tạo kho dùng thử', '64 sản phẩm mẫu đã sẵn sàng. Có thể xóa hoặc tạo 100.000 sản phẩm.');
      }
    } catch (e) {
      console.warn('IndexedDB unavailable:', e);
      state.db = null;
      if (!inventory.size) for (let i = 1; i <= 64; i++) inventory.add(makeMockProduct(i,'DEMO'));
      toast('Không mở được IndexedDB. Ứng dụng vẫn chạy trên RAM.', 'error');
    } finally {
      state.hasBooted = true; $('#busy-shield').hidden = true;
      renderDbStatus(); afterChange();
    }
  }
  function wireEvents() {
    $$('[data-goto]').forEach(el => el.addEventListener('click', () => goto(el.dataset.goto)));
    $$('[data-open-add]').forEach(el => el.addEventListener('click', () => openProductModal()));
    $$('.nav-item').forEach(el => el.addEventListener('click', () => goto(el.dataset.page)));
    window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
    $('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
    $('#product-form').addEventListener('submit', handleProductSubmit);
    $('#modal-close').addEventListener('click', closeProductModal);
    $('#modal-cancel').addEventListener('click', closeProductModal);
    $('#product-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeProductModal(); });
    $('#confirm-cancel').addEventListener('click', () => closeConfirm(false));
    $('#confirm-accept').addEventListener('click', () => closeConfirm(true));
    $('#confirm-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeConfirm(false); });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') { if (!$('#confirm-modal').hidden) closeConfirm(false); else if (!$('#product-modal').hidden) closeProductModal(); else $('#sidebar').classList.remove('open'); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); goto('products'); $('#search-input').focus(); }
    });
    $('#product-tbody').addEventListener('click', event => {
      const edit = event.target.closest('[data-edit]'); const del = event.target.closest('[data-delete]');
      if (edit) openProductModal(edit.dataset.edit);
      if (del) handleDelete(del.dataset.delete);
    });
    let timer;
    $('#search-input').addEventListener('input', e => { clearTimeout(timer); timer = setTimeout(() => { state.search = e.target.value; state.pageNo = 1; invalidate(); renderProducts(); }, 190); });
    $('#stock-filter').addEventListener('change', e => { state.stock = e.target.value; state.pageNo = 1; invalidate(); renderProducts(); });
    $('#sort-select').addEventListener('change', e => { state.sort = e.target.value; state.pageNo = 1; invalidate(); renderProducts(); });
    $('#page-size').addEventListener('change', e => { state.pageSize = Number(e.target.value); state.pageNo = 1; renderProducts(); });
    $('#first-page').addEventListener('click', () => { state.pageNo = 1; renderProducts(); });
    $('#prev-page').addEventListener('click', () => { state.pageNo--; renderProducts(); });
    $('#next-page').addEventListener('click', () => { state.pageNo++; renderProducts(); });
    $('#last-page').addEventListener('click', () => { state.pageNo = Math.ceil(filteredProducts().length / state.pageSize); renderProducts(); });
    $('#export-table').addEventListener('click', () => exportData('csv'));
    $('#export-csv').addEventListener('click', () => exportData('csv'));
    $('#export-json').addEventListener('click', () => exportData('json'));
    $('#refresh-reports').addEventListener('click', () => { renderReports(); toast('Báo cáo đã cập nhật theo danh sách hiện tại.'); });
    $('#download-sample').addEventListener('click', () => {
      const sample = [makeMockProduct(1,'SAMPLE'), makeMockProduct(2,'SAMPLE'), makeMockProduct(3,'SAMPLE')];
      triggerDownload(new Blob([csvFromProducts(sample)], { type:'text/csv;charset=utf-8;' }), 'gdu-stockhub-mau.csv');
    });
    $('#dropzone').addEventListener('click', () => $('#file-input').click());
    $('#dropzone').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#file-input').click(); } });
    $('#file-input').addEventListener('change', e => loadFile(e.target.files[0]));
    const zone = $('#dropzone');
    ['dragenter','dragover'].forEach(name => zone.addEventListener(name, e => { e.preventDefault(); if (!state.busy) zone.classList.add('dragging'); }));
    ['dragleave','drop'].forEach(name => zone.addEventListener(name, e => { e.preventDefault(); zone.classList.remove('dragging'); }));
    zone.addEventListener('drop', e => loadFile(e.dataTransfer.files[0]));
    $('#generate-mock').addEventListener('click', () => generateMock(Number($('#mock-count').value)));
    $('#quick-100k').addEventListener('click', () => generateMock(100000));
    $('#clear-log').addEventListener('click', () => { state.logs = []; log('Đã xóa nhật ký', 'Nhật ký chỉ lưu trong phiên hiện tại.'); });
    $('#verify-list').addEventListener('click', verifyList);
    $('#clear-inventory').addEventListener('click', clearInventory);
    $('#save-snapshot').addEventListener('click', saveSnapshot);
    $('#autosave-toggle').addEventListener('change', e => { state.autoSave = e.target.checked; setSetting('lumistock-autosave', String(state.autoSave)); renderDbStatus(); toast(state.autoSave ? 'Đã bật tự động lưu cho các thay đổi tiếp theo.' : 'Đã tắt tự động lưu. Thay đổi mới chỉ nằm trong RAM.'); });
    window.addEventListener('pagehide', e => {
      if (!e.persisted) {
        state.filtered = null; state.recentIds.length = 0;
        inventory.dispose(); // explicit unlink; JS garbage collector handles reclamation.
        if (state.db) state.db.close();
      }
    });
  }
  async function init() {
    hydrateIcons(); wireEvents(); navigate(location.hash.slice(1));
    await restore();
    // Test console: window.LumiDebug.inventory.verify(), window.LumiDebug.inventory.size
    window.LumiDebug = { inventory, generateMock, verifyList, get state() { return state; } };
  }
  document.addEventListener('DOMContentLoaded', init);
})();
