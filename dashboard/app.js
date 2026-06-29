/* ═══════════════════════════════════════════════════════
   BAGGALPE MERCHANT DASHBOARD — Frontend Logic
   Pure JS · fetch() API · sessionStorage auth
   ═══════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ─── Config ───
  const API_BASE = '/api/merchant';

  // ─── State ───
  let currentMerchant = null;
  let allProducts = [];
  let allOrders = [];
  let deleteTargetId = null;

  // ─── DOM Refs ───
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

  const els = {
    // Auth
    authContainer:    $('#auth-container'),
    loginScreen:      $('#login-screen'),
    registerScreen:   $('#register-screen'),
    loginForm:        $('#login-form'),
    registerForm:     $('#register-form'),
    showRegisterBtn:  $('#show-register-btn'),
    backToLoginBtn:   $('#back-to-login-btn'),
    getLocationBtn:   $('#get-location-btn'),

    // Dashboard
    dashboardContainer: $('#dashboard-container'),
    sidebar:            $('#sidebar'),
    sidebarOverlay:     $('#sidebar-overlay'),
    mobileHeader:       $('#mobile-header'),
    mobileMenuBtn:      $('#mobile-menu-btn'),
    mainContent:        $('#main-content'),

    // Nav
    navItems:         $$('.nav-item'),
    logoutBtn:        $('#logout-btn'),
    mobileLogoutBtn:  $('#mobile-logout-btn'),
    sidebarShopName:  $('#sidebar-shop-name'),
    sidebarAvatar:    $('#sidebar-avatar'),
    mobileShopName:   $('#mobile-shop-name'),
    ordersBadge:      $('#orders-badge'),

    // Profile
    profileForm:      $('#profile-form'),
    editProfileBtn:   $('#edit-profile-btn'),
    cancelProfileBtn: $('#cancel-profile-btn'),
    profileActions:   $('#profile-actions'),
    updateLocationBtn:$('#update-location-btn'),
    profileLat:       $('#profile-lat'),
    profileLng:       $('#profile-lng'),

    // Products
    productsGrid:     $('#products-list'),
    productsEmpty:    $('#products-empty'),
    addProductBtn:    $('#add-product-btn'),
    productModal:     $('#product-modal'),
    productForm:      $('#product-form'),
    productModalTitle:$('#product-modal-title'),
    productSubmitText:$('#product-submit-text'),
    productEditId:    $('#product-edit-id'),
    categoryFilter:   $('#product-category-filter'),

    // Orders
    ordersList:       $('#orders-list'),
    ordersEmpty:      $('#orders-empty'),
    refreshOrdersBtn: $('#refresh-orders-btn'),

    // Delete modal
    deleteModal:      $('#delete-modal'),
    deleteProductName:$('#delete-product-name'),
    confirmDeleteBtn: $('#confirm-delete-btn'),

    // Loader
    globalLoader:     $('#global-loader'),
    toastContainer:   $('#toast-container'),
  };

  // ═══════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════

  function showLoader(text = 'Loading...') {
    $('.loader-text', els.globalLoader).textContent = text;
    els.globalLoader.classList.remove('hidden');
  }

  function hideLoader() {
    els.globalLoader.classList.add('hidden');
  }

  function toast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;
    els.toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-out');
      el.addEventListener('animationend', () => el.remove());
    }, 3500);
  }

  function setButtonLoading(btn, loading) {
    const span = btn.querySelector('span:not(.btn-loader)');
    const loader = btn.querySelector('.btn-loader');
    if (loading) {
      btn.disabled = true;
      if (span) span.style.opacity = '0.5';
      if (loader) loader.classList.remove('hidden');
    } else {
      btn.disabled = false;
      if (span) span.style.opacity = '1';
      if (loader) loader.classList.add('hidden');
    }
  }

  async function api(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const merchantId = sessionStorage.getItem('merchant_id');
    if (merchantId) headers['x-merchant-id'] = merchantId;

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
      return data;
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw err;
    }
  }

  function maskPhone(phone) {
    if (!phone || phone.length < 6) return phone || '—';
    return phone.slice(0, 3) + '****' + phone.slice(-3);
  }

  function formatTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function statusLabel(status) {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
    };
    return labels[status] || status;
  }

  // ═══════════════════════════════════════════════════════
  // AUTH: LOGIN & REGISTER
  // ═══════════════════════════════════════════════════════

  function showAuthScreen(screen) {
    els.loginScreen.classList.add('hidden');
    els.registerScreen.classList.add('hidden');
    if (screen === 'login') els.loginScreen.classList.remove('hidden');
    if (screen === 'register') els.registerScreen.classList.remove('hidden');
    // Re-trigger animation
    const card = screen === 'login' ? els.loginScreen : els.registerScreen;
    card.style.animation = 'none';
    card.offsetHeight; // force reflow
    card.style.animation = '';
  }

  els.showRegisterBtn.addEventListener('click', () => showAuthScreen('register'));
  els.backToLoginBtn.addEventListener('click', () => showAuthScreen('login'));

  // Login
  els.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button[type="submit"]', els.loginForm);
    const phone = $('#login-phone').value.trim();
    const pin = $('#login-pin').value.trim();

    if (phone.length < 10) return toast('Enter a valid 10-digit phone number', 'error');
    if (pin.length < 4) return toast('Enter your 4-digit PIN', 'error');

    setButtonLoading(btn, true);
    try {
      const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ phone, pin }),
      });
      if (data.success && data.merchant) {
        sessionStorage.setItem('merchant_id', data.merchant.id || data.merchant._id || data.merchant.phone);
        if (data.token) sessionStorage.setItem('token', data.token);
        currentMerchant = data.merchant;
        toast('Welcome back! 🎉', 'success');
        enterDashboard();
      } else {
        toast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  });

  // Register
  els.registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button[type="submit"]', els.registerForm);
    const payload = {
      name: $('#reg-shop-name').value.trim(),
      owner_name: $('#reg-owner').value.trim(),
      phone: $('#reg-phone').value.trim(),
      address: $('#reg-address').value.trim(),
      city: $('#reg-city').value.trim(),
      pincode: $('#reg-pincode').value.trim(),
      type: $('#reg-type').value,
      pin: $('#reg-pin').value.trim(),
      delivery_radius_km: parseFloat($('#reg-radius').value) || 1,
    };

    const lat = parseFloat($('#reg-lat').value);
    const lng = parseFloat($('#reg-lng').value);
    if (!isNaN(lat)) payload.lat = lat;
    if (!isNaN(lng)) payload.lng = lng;

    // Validate
    if (!payload.name || !payload.owner_name || !payload.phone || !payload.address || !payload.city || !payload.pincode || !payload.type || !payload.pin) {
      return toast('Please fill in all required fields', 'error');
    }
    if (payload.phone.length < 10) return toast('Enter a valid 10-digit phone number', 'error');
    if (payload.pin.length < 4) return toast('PIN must be 4 digits', 'error');

    setButtonLoading(btn, true);
    try {
      const data = await api('/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.success || data.merchant) {
        const merchant = data.merchant || data;
        sessionStorage.setItem('merchant_id', merchant.id || merchant._id || merchant.phone);
        currentMerchant = merchant;
        toast('Shop registered successfully! 🎉', 'success');
        enterDashboard();
      } else {
        toast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  });

  // Geolocation
  els.getLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) return toast('Geolocation not supported by your browser', 'error');
    setButtonLoading(els.getLocationBtn, true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        $('#reg-lat').value = pos.coords.latitude.toFixed(6);
        $('#reg-lng').value = pos.coords.longitude.toFixed(6);
        toast('Location captured!', 'success');
        setButtonLoading(els.getLocationBtn, false);
      },
      (err) => {
        toast('Could not get location: ' + err.message, 'error');
        setButtonLoading(els.getLocationBtn, false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });

  // ═══════════════════════════════════════════════════════
  // DASHBOARD ENTRY
  // ═══════════════════════════════════════════════════════

  function enterDashboard() {
    els.authContainer.classList.add('hidden');
    els.dashboardContainer.classList.remove('hidden');
    updateSidebarInfo();
    loadProfile();
    loadProducts();
    loadOrders();
  }

  function updateSidebarInfo() {
    if (!currentMerchant) return;
    const name = currentMerchant.name || 'My Shop';
    els.sidebarShopName.textContent = name;
    els.mobileShopName.textContent = name;
    els.sidebarAvatar.textContent = name.charAt(0).toUpperCase();
  }

  // Logout
  function logout() {
    sessionStorage.clear();
    currentMerchant = null;
    allProducts = [];
    allOrders = [];
    els.dashboardContainer.classList.add('hidden');
    els.authContainer.classList.remove('hidden');
    showAuthScreen('login');
    // Reset forms
    els.loginForm.reset();
    els.registerForm.reset();
    toast('Logged out', 'info');
  }

  els.logoutBtn.addEventListener('click', logout);
  els.mobileLogoutBtn.addEventListener('click', logout);

  // ═══════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════

  function switchSection(sectionName) {
    $$('.dashboard-section').forEach(s => s.classList.add('hidden'));
    $(`#section-${sectionName}`).classList.remove('hidden');
    // Re-trigger animation
    const sec = $(`#section-${sectionName}`);
    sec.style.animation = 'none';
    sec.offsetHeight;
    sec.style.animation = '';

    els.navItems.forEach(n => n.classList.remove('active'));
    $(`.nav-item[data-section="${sectionName}"]`).classList.add('active');

    // Close mobile sidebar
    closeMobileSidebar();
  }

  els.navItems.forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  // Mobile sidebar
  function openMobileSidebar() {
    els.sidebar.classList.add('open');
    els.sidebarOverlay.classList.remove('hidden');
  }

  function closeMobileSidebar() {
    els.sidebar.classList.remove('open');
    els.sidebarOverlay.classList.add('hidden');
  }

  els.mobileMenuBtn.addEventListener('click', openMobileSidebar);
  els.sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // ═══════════════════════════════════════════════════════
  // PROFILE
  // ═══════════════════════════════════════════════════════

  async function loadProfile() {
    try {
      const data = await api('/profile');
      const m = data.merchant || data;
      currentMerchant = m;
      fillProfileForm(m);
      updateSidebarInfo();
    } catch (err) {
      console.error('Load profile error:', err);
    }
  }

  function fillProfileForm(m) {
    $('#profile-name').value = m.name || '';
    $('#profile-owner').value = m.owner_name || '';
    $('#profile-phone').value = m.phone || '';
    $('#profile-type').value = m.type || '';
    $('#profile-address').value = m.address || '';
    $('#profile-city').value = m.city || '';
    $('#profile-pincode').value = m.pincode || '';
    $('#profile-radius').value = m.delivery_radius_km || 1;
    els.profileLat.textContent = m.lat != null ? Number(m.lat).toFixed(6) : '—';
    els.profileLng.textContent = m.lng != null ? Number(m.lng).toFixed(6) : '—';
  }

  // Edit toggle
  let profileEditing = false;

  els.editProfileBtn.addEventListener('click', () => {
    profileEditing = true;
    const inputs = $$('#profile-form input', els.mainContent);
    inputs.forEach(inp => inp.disabled = false);
    els.profileActions.classList.remove('hidden');
    els.editProfileBtn.classList.add('hidden');
  });

  els.cancelProfileBtn.addEventListener('click', () => {
    profileEditing = false;
    const inputs = $$('#profile-form input', els.mainContent);
    inputs.forEach(inp => inp.disabled = true);
    els.profileActions.classList.add('hidden');
    els.editProfileBtn.classList.remove('hidden');
    fillProfileForm(currentMerchant);
  });

  els.profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button[type="submit"]', els.profileForm);
    const payload = {
      name: $('#profile-name').value.trim(),
      owner_name: $('#profile-owner').value.trim(),
      phone: $('#profile-phone').value.trim(),
      address: $('#profile-address').value.trim(),
      city: $('#profile-city').value.trim(),
      pincode: $('#profile-pincode').value.trim(),
      delivery_radius_km: parseFloat($('#profile-radius').value) || 1,
    };

    setButtonLoading(btn, true);
    try {
      const data = await api('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const m = data.merchant || data;
      currentMerchant = { ...currentMerchant, ...m, ...payload };
      fillProfileForm(currentMerchant);
      updateSidebarInfo();
      // Exit edit mode
      profileEditing = false;
      $$('#profile-form input', els.mainContent).forEach(inp => inp.disabled = true);
      els.profileActions.classList.add('hidden');
      els.editProfileBtn.classList.remove('hidden');
      toast('Profile updated!', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  });

  // Update location
  els.updateLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) return toast('Geolocation not supported', 'error');
    setButtonLoading(els.updateLocationBtn, true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          await api('/profile', {
            method: 'PUT',
            body: JSON.stringify({ lat, lng }),
          });
          els.profileLat.textContent = lat.toFixed(6);
          els.profileLng.textContent = lng.toFixed(6);
          currentMerchant.lat = lat;
          currentMerchant.lng = lng;
          toast('Location updated!', 'success');
        } catch (err) {
          toast(err.message, 'error');
        } finally {
          setButtonLoading(els.updateLocationBtn, false);
        }
      },
      (err) => {
        toast('Could not get location: ' + err.message, 'error');
        setButtonLoading(els.updateLocationBtn, false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });

  // ═══════════════════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════════════════

  async function loadProducts() {
    try {
      const data = await api('/products');
      allProducts = data.products || data || [];
      renderProducts();
      updateProductStats();
      updateCategoryFilter();
    } catch (err) {
      console.error('Load products error:', err);
    }
  }

  function renderProducts(filterCategory = '') {
    const products = filterCategory
      ? allProducts.filter(p => p.category === filterCategory)
      : allProducts;

    if (products.length === 0) {
      els.productsGrid.classList.add('hidden');
      els.productsEmpty.classList.remove('hidden');
      return;
    }

    els.productsGrid.classList.remove('hidden');
    els.productsEmpty.classList.add('hidden');

    els.productsGrid.innerHTML = products.map(p => {
      const id = p.id || p._id;
      const inStock = p.in_stock !== false;
      return `
        <div class="glass-card product-card ${inStock ? '' : 'out-of-stock'}" data-id="${id}">
          <div class="product-top">
            <div class="product-info">
              <h4>${escapeHtml(p.name)}</h4>
              <span class="product-category">${escapeHtml(p.category || 'General')}</span>
            </div>
            <div class="product-stock-toggle">
              <label class="toggle-switch" title="${inStock ? 'In Stock' : 'Out of Stock'}">
                <input type="checkbox" ${inStock ? 'checked' : ''} onchange="window.__toggleStock('${id}', this.checked)">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="product-bottom">
            <div>
              <span class="product-price"><span class="currency">₹</span>${Number(p.price).toLocaleString('en-IN')}</span>
              <span class="product-unit">/ ${escapeHtml(p.unit || 'unit')}</span>
            </div>
            <div class="product-actions">
              <button class="btn-icon" title="Edit" onclick="window.__editProduct('${id}')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="btn-icon delete-btn" title="Delete" onclick="window.__deleteProduct('${id}', '${escapeHtml(p.name)}')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function updateProductStats() {
    const total = allProducts.length;
    const inStock = allProducts.filter(p => p.in_stock !== false).length;
    const outStock = total - inStock;
    $('#stat-total').textContent = total;
    $('#stat-instock').textContent = inStock;
    $('#stat-outstock').textContent = outStock;
  }

  function updateCategoryFilter() {
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();
    const current = els.categoryFilter.value;
    els.categoryFilter.innerHTML = '<option value="">All Categories</option>' +
      categories.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
  }

  els.categoryFilter.addEventListener('change', () => {
    renderProducts(els.categoryFilter.value);
  });

  // Add Product Modal
  function openProductModal(product = null) {
    els.productForm.reset();
    els.productEditId.value = '';
    if (product) {
      els.productModalTitle.textContent = 'Edit Product';
      els.productSubmitText.textContent = 'Save Changes';
      els.productEditId.value = product.id || product._id;
      $('#product-name').value = product.name || '';
      $('#product-category').value = product.category || '';
      $('#product-price').value = product.price || '';
      $('#product-unit').value = product.unit || '';
      $('#product-instock').checked = product.in_stock !== false;
    } else {
      els.productModalTitle.textContent = 'Add Product';
      els.productSubmitText.textContent = 'Add Product';
      $('#product-instock').checked = true;
    }
    els.productModal.classList.remove('hidden');
  }

  function closeModal(id) {
    $(`#${id}`).classList.add('hidden');
  }

  els.addProductBtn.addEventListener('click', () => openProductModal());
  $$('.add-first-product').forEach(b => b.addEventListener('click', () => openProductModal()));

  // Close modals
  $$('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  // Click outside modal
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });

  // Submit product
  els.productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button[type="submit"]', els.productForm);
    const editId = els.productEditId.value;
    const payload = {
      name: $('#product-name').value.trim(),
      category: $('#product-category').value.trim(),
      price: parseFloat($('#product-price').value),
      unit: $('#product-unit').value.trim(),
      in_stock: $('#product-instock').checked,
    };

    if (!payload.name || !payload.category || isNaN(payload.price) || !payload.unit) {
      return toast('Please fill in all fields', 'error');
    }

    setButtonLoading(btn, true);
    try {
      if (editId) {
        await api(`/products/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Product updated!', 'success');
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(payload) });
        toast('Product added!', 'success');
      }
      closeModal('product-modal');
      await loadProducts();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  });

  // Toggle stock (exposed globally for inline onclick)
  window.__toggleStock = async (id, inStock) => {
    try {
      await api(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ in_stock: inStock }),
      });
      const p = allProducts.find(p => (p.id || p._id) === id);
      if (p) p.in_stock = inStock;
      renderProducts(els.categoryFilter.value);
      updateProductStats();
      toast(inStock ? 'Marked in stock' : 'Marked out of stock', 'success');
    } catch (err) {
      toast(err.message, 'error');
      await loadProducts(); // revert
    }
  };

  // Edit product
  window.__editProduct = (id) => {
    const product = allProducts.find(p => (p.id || p._id) === id);
    if (product) openProductModal(product);
  };

  // Delete product
  window.__deleteProduct = (id, name) => {
    deleteTargetId = id;
    els.deleteProductName.textContent = name;
    els.deleteModal.classList.remove('hidden');
  };

  els.confirmDeleteBtn.addEventListener('click', async () => {
    if (!deleteTargetId) return;
    setButtonLoading(els.confirmDeleteBtn, true);
    try {
      await api(`/products/${deleteTargetId}`, { method: 'DELETE' });
      toast('Product deleted', 'success');
      closeModal('delete-modal');
      deleteTargetId = null;
      await loadProducts();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setButtonLoading(els.confirmDeleteBtn, false);
    }
  });

  // ═══════════════════════════════════════════════════════
  // ORDERS
  // ═══════════════════════════════════════════════════════

  async function loadOrders() {
    try {
      const data = await api('/orders');
      allOrders = data.orders || data || [];
      renderOrders();
      updateOrdersBadge();
    } catch (err) {
      console.error('Load orders error:', err);
    }
  }

  function renderOrders() {
    if (allOrders.length === 0) {
      els.ordersList.classList.add('hidden');
      els.ordersEmpty.classList.remove('hidden');
      return;
    }

    els.ordersList.classList.remove('hidden');
    els.ordersEmpty.classList.add('hidden');

    const statusOptions = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

    els.ordersList.innerHTML = allOrders.map(o => {
      const id = o.id || o._id;
      const orderNum = o.order_number || ('#' + (id || '').slice(-6).toUpperCase());
      const status = o.status || 'pending';
      const items = (o.items || []).map(i => `${i.name || 'Item'} ×${i.qty || i.quantity || 1}`).join(', ') || 'No items';
      const total = o.total || o.total_amount || 0;
      const customer = o.customer_phone || o.customer || '';

      return `
        <div class="glass-card order-card">
          <div class="order-id-block">
            <div class="order-number">${orderNum}</div>
            <div class="order-time">${formatTime(o.created_at || o.createdAt)}</div>
          </div>
          <div class="order-details">
            <div class="order-customer">
              📞 ${maskPhone(customer)}
            </div>
            <div class="order-items">${escapeHtml(items)}</div>
            <div class="order-total">₹${Number(total).toLocaleString('en-IN')}</div>
          </div>
          <div class="order-status-block">
            <span class="status-badge status-${status}">${statusLabel(status)}</span>
            <select class="order-status-select" onchange="window.__updateOrderStatus('${id}', this.value)" ${status === 'delivered' ? 'disabled' : ''}>
              ${statusOptions.map(s => `<option value="${s}" ${s === status ? 'selected' : ''}>${statusLabel(s)}</option>`).join('')}
            </select>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateOrdersBadge() {
    const pending = allOrders.filter(o => o.status === 'pending' || !o.status).length;
    if (pending > 0) {
      els.ordersBadge.textContent = pending;
      els.ordersBadge.classList.remove('hidden');
    } else {
      els.ordersBadge.classList.add('hidden');
    }
  }

  window.__updateOrderStatus = async (id, status) => {
    try {
      await api(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      const order = allOrders.find(o => (o.id || o._id) === id);
      if (order) order.status = status;
      renderOrders();
      updateOrdersBadge();
      toast(`Order ${statusLabel(status).toLowerCase()}`, 'success');
    } catch (err) {
      toast(err.message, 'error');
      await loadOrders();
    }
  };

  els.refreshOrdersBtn.addEventListener('click', async () => {
    setButtonLoading(els.refreshOrdersBtn, true);
    await loadOrders();
    setButtonLoading(els.refreshOrdersBtn, false);
    toast('Orders refreshed', 'info');
  });

  // ═══════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
      closeMobileSidebar();
    }
  });

  // ═══════════════════════════════════════════════════════
  // INIT — Check session
  // ═══════════════════════════════════════════════════════

  function init() {
    const merchantId = sessionStorage.getItem('merchant_id');
    if (merchantId) {
      els.authContainer.classList.add('hidden');
      els.dashboardContainer.classList.remove('hidden');
      loadProfile();
      loadProducts();
      loadOrders();
    }
  }

  init();
})();
