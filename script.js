/**
 * SIGMA67 SNEAKERS - MAIN SCRIPT
 * Handles product listing/filtering, order form submission, and admin dashboard CSV rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Page routing based on present elements
  if (document.getElementById('product-list')) {
    initProductPage();
  }

  if (document.getElementById('orderForm')) {
    initOrderPage();
  }

  if (document.getElementById('ordersTable')) {
    initAdminPage();
  }
});

/* ==========================================================================
   1. PRODUCT PAGE (product.html)
   ========================================================================== */
function initProductPage() {
  const productListEl = document.getElementById('product-list');
  const filterBarEl = document.getElementById('filter-bar');

  if (!productListEl) return;

  // Read URL parameter 'style'
  const urlParams = new URLSearchParams(window.location.search);
  const selectedStyleParam = urlParams.get('style') ? urlParams.get('style').toLowerCase() : 'all';

  // Fetch products data
  fetch('products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(products => {
      renderFilterButtons(products, filterBarEl, selectedStyleParam);
      filterAndRenderProducts(products, selectedStyleParam);
    })
    .catch(error => {
      console.error('Error loading products.json:', error);
      productListEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #e53e3e;">
          <p>ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      `;
    });
}

/**
 * Render filter buttons inside #filter-bar
 */
function renderFilterButtons(products, container, activeStyle) {
  if (!container) return;

  const styles = ['all', 'minimal', 'street', 'active', 'vintage'];
  const styleLabels = {
    'all': 'ทั้งหมด',
    'minimal': 'Minimal',
    'street': 'Street',
    'active': 'Active',
    'vintage': 'Vintage'
  };

  container.innerHTML = '';

  styles.forEach(style => {
    const btn = document.createElement('button');
    btn.className = `btn-filter ${style === activeStyle ? 'active' : ''}`;
    btn.dataset.style = style;
    btn.textContent = styleLabels[style] || style;

    btn.addEventListener('click', () => {
      // Update active button state
      container.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update URL without reload
      const newUrl = new URL(window.location);
      if (style === 'all') {
        newUrl.searchParams.delete('style');
      } else {
        newUrl.searchParams.set('style', style);
      }
      window.history.pushState({}, '', newUrl);

      // Render filtered products
      filterAndRenderProducts(products, style);
    });

    container.appendChild(btn);
  });
}

/**
 * Filter and render product cards into #product-list
 */
function filterAndRenderProducts(products, filterStyle) {
  const container = document.getElementById('product-list');
  if (!container) return;

  const filtered = (filterStyle === 'all' || !filterStyle)
    ? products
    : products.filter(p => p.style && p.style.toLowerCase() === filterStyle.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #6c757d;">
        <p>ไม่พบรายการสินค้าในหมวดหมู่นี้</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(product => {
    const buyUrl = `order.html?item=${encodeURIComponent(product.name)}&price=${product.price}`;
    const sizeChips = Array.isArray(product.size)
      ? product.size.map(s => `<span class="size-chip">${s}</span>`).join('')
      : '';

    return `
      <div class="product-card">
        <span class="style-badge">${product.style || 'Sneaker'}</span>
        <div class="product-img-wrapper">
          <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Sigma67+Sneaker'">
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description || ''}</p>
          ${sizeChips ? `
            <div class="size-chips-wrapper">
              <div class="size-title">ไซส์พร้อมส่ง</div>
              <div class="size-chips">${sizeChips}</div>
            </div>
          ` : ''}
          <div class="product-footer">
            <div class="product-price">
              <span class="price-currency">ราคา</span>
              <span class="price-amount">฿${Number(product.price).toLocaleString()}</span>
            </div>
            <a href="${buyUrl}" class="btn-buy">สั่งซื้อ</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}


/* ==========================================================================
   2. ORDER PAGE (order.html)
   ========================================================================== */
function initOrderPage() {
  const orderForm = document.getElementById('orderForm');
  const itemsInput = document.getElementById('items');
  const totalInput = document.getElementById('total');

  if (!orderForm) return;

  // Auto-fill from URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const itemParam = urlParams.get('item');
  const priceParam = urlParams.get('price');

  if (itemParam && itemsInput) {
    itemsInput.value = itemParam;
  }

  if (priceParam && totalInput) {
    totalInput.value = priceParam;
  }

  // Handle Form Submission
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const customerName = document.getElementById('customerName')?.value || '';
    const contact = document.getElementById('contact')?.value || '';
    const items = document.getElementById('items')?.value || '';
    const total = document.getElementById('total')?.value || '';
    const note = document.getElementById('note')?.value || '';

    const payload = {
      customerName,
      contact,
      items,
      total,
      note
    };

    // Submit button loading state
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'กำลังส่งข้อมูล...';
    }

    fetch('https://script.google.com/macros/s/AKfycbwvY9yVOB8wxhWvqO1RTiw52darEdvZIRaKD1FSmI64F0EfomWeGn1LWizBD6M6New/exec', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    .then(() => {
      window.location.href = 'thankyou.html';
    })
    .catch(error => {
      console.error(error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || 'ส่งคำสั่งซื้อ';
      }
    });
  });
}


/* ==========================================================================
   3. ADMIN PAGE (admin.html)
   ========================================================================== */
function initAdminPage() {
  const tbody = document.querySelector('#ordersTable tbody');
  if (!tbody) return;

  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSd94XeDTf0oIG2vF5NTKx7gwDE5saFuYdP0ZiL2mf7xuIaPJTOeOpARV-5UAcnxOQiRR-jnDVzBK-j/pub?output=csv';

  tbody.innerHTML = `
    <tr>
      <td colspan="10" style="text-align: center; padding: 2rem;">กำลังโหลดข้อมูลคำสั่งซื้อ...</td>
    </tr>
  `;

  fetch(csvUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูล CSV ได้');
      }
      return response.text();
    })
    .then(csvText => {
      const rows = parseCSV(csvText);
      renderAdminTable(rows, tbody);
    })
    .catch(error => {
      console.error('Error loading admin orders:', error);
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 2rem; color: #e53e3e;">
            เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ
          </td>
        </tr>
      `;
    });
}

/**
 * Custom CSV Parser without external libraries
 * Handles quotes, escaped quotes, commas inside quotes, and newlines.
 */
function parseCSV(text) {
  const lines = [];
  let currentRow = [];
  let currentToken = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote inside string ("")
        currentToken += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n in \r\n
      }
      currentRow.push(currentToken.trim());
      if (currentRow.length > 0 && !(currentRow.length === 1 && currentRow[0] === '')) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }

  if (currentToken || currentRow.length > 0) {
    currentRow.push(currentToken.trim());
    if (currentRow.length > 0 && !(currentRow.length === 1 && currentRow[0] === '')) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * Render CSV rows into #ordersTable tbody
 * Header is row[0], remaining rows are reversed so latest orders appear first.
 */
function renderAdminTable(rows, tbody) {
  if (!rows || rows.length <= 1) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem; color: #6c757d;">
          ยังไม่มีข้อมูลคำสั่งซื้อ
        </td>
      </tr>
    `;
    return;
  }

  // Row 0 is header
  const dataRows = rows.slice(1);

  // Reverse dataRows so latest entries come first
  dataRows.reverse();

  tbody.innerHTML = dataRows.map((row, index) => {
    // Fill empty cells if row has fewer columns
    const cellsHtml = row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('');
    return `<tr>${cellsHtml}</tr>`;
  }).join('');
}

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
