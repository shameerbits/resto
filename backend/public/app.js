const menuListEl = document.getElementById('menuList');
const menuStatusEl = document.getElementById('menuStatus');
const refreshButton = document.getElementById('refreshButton');
const orderForm = document.getElementById('orderForm');
const orderNotes = document.getElementById('orderNotes');
const feedbackEl = document.getElementById('feedback');
const placeOrderButton = document.getElementById('placeOrderButton');

const orderResultEl = document.getElementById('orderResult');
const resultOrderIdEl = document.getElementById('resultOrderId');
const resultOrderStatusEl = document.getElementById('resultOrderStatus');
const resultOrderTotalEl = document.getElementById('resultOrderTotal');
const resultItemsEl = document.getElementById('resultItems');

let currentMenu = [];

function setFeedback(message, type = '') {
  feedbackEl.textContent = message || '';
  feedbackEl.className = `feedback ${type}`.trim();
}

function formatCurrency(value) {
  const normalized = Number(value || 0);
  return normalized.toFixed(2);
}

function buildMenuCard(item) {
  const card = document.createElement('article');
  card.className = 'menu-card';

  const safeDescription = item.description || 'No description';

  card.innerHTML = `
    <h3>${item.name}</h3>
    <p>${safeDescription}</p>
    <div class="menu-meta">
      <strong>$${formatCurrency(item.price)}</strong>
      <span>#${item.id}</span>
    </div>
    <label class="qty-control" for="qty-${item.id}">
      Qty
      <input id="qty-${item.id}" data-menu-id="${item.id}" type="number" min="0" step="1" value="0" />
    </label>
  `;

  return card;
}

function renderMenu(items) {
  menuListEl.innerHTML = '';

  if (!items.length) {
    menuStatusEl.textContent = 'No menu items found.';
    return;
  }

  menuStatusEl.textContent = `${items.length} item(s) loaded.`;

  items.forEach((item) => {
    const card = buildMenuCard(item);
    menuListEl.appendChild(card);
  });
}

async function loadMenu() {
  menuStatusEl.textContent = 'Loading menu...';
  setFeedback('');

  try {
    const response = await fetch('/api/menu');
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'Failed to load menu');
    }

    currentMenu = payload.data.filter((item) => item.isAvailable);
    renderMenu(currentMenu);
  } catch (error) {
    menuStatusEl.textContent = 'Unable to load menu.';
    setFeedback(error.message, 'error');
  }
}

function collectOrderItems() {
  const qtyInputs = menuListEl.querySelectorAll('input[data-menu-id]');
  const items = [];

  qtyInputs.forEach((input) => {
    const quantity = Number(input.value);
    const menuItemId = Number(input.dataset.menuId);

    if (Number.isInteger(quantity) && quantity > 0) {
      items.push({ menuItemId, quantity });
    }
  });

  return items;
}

function renderOrderResult(order) {
  orderResultEl.classList.remove('hidden');
  resultOrderIdEl.textContent = String(order.id);
  resultOrderStatusEl.textContent = String(order.status || 'created');
  resultOrderTotalEl.textContent = formatCurrency(order.totalAmount);

  resultItemsEl.innerHTML = '';
  order.items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `Menu #${item.menuItemId} x ${item.quantity} = $${formatCurrency(item.lineTotal)}`;
    resultItemsEl.appendChild(li);
  });
}

async function submitOrder(event) {
  event.preventDefault();

  const items = collectOrderItems();
  if (!items.length) {
    setFeedback('Select at least one menu item with quantity > 0.', 'error');
    return;
  }

  placeOrderButton.disabled = true;
  setFeedback('Placing order...');

  const payload = {
    notes: orderNotes.value.trim(),
    items,
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to place order');
    }

    setFeedback('Order placed successfully.', 'success');
    renderOrderResult(result.data);

    menuListEl.querySelectorAll('input[data-menu-id]').forEach((input) => {
      input.value = '0';
    });

    orderForm.reset();
  } catch (error) {
    setFeedback(error.message, 'error');
  } finally {
    placeOrderButton.disabled = false;
  }
}

refreshButton.addEventListener('click', loadMenu);
orderForm.addEventListener('submit', submitOrder);

loadMenu();
