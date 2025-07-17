// lib/db.js

// Простое in‑memory хранилище заказов.
// В продакшене замените это на вызовы вашей БД.
const orders = [];

/**
 * Вставляет новый заказ и возвращает его ID
 * @param {object} data — { customerName, customerPhone, customerEmail, address, cart, delivery, status }
 * @returns {number} orderId
 */
export async function insertOrder(data) {
  const id = orders.length + 1;
  const order = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
  orders.push(order);
  return id;
}

/**
 * Обновляет поля заказа
 * @param {number} orderId
 * @param {object} fields — объект с полями для обновления
 */
export async function updateOrder(orderId, fields) {
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error(`Order ${orderId} not found`);
  orders[idx] = { ...orders[idx], ...fields, updatedAt: new Date() };
}

/**
 * Возвращает заказ по его ID
 * @param {number} orderId
 * @returns {object|null}
 */
export async function getOrderById(orderId) {
  return orders.find((o) => o.id === orderId) || null;
}

/**
 * Возвращает заказ по UUID СДЭК
 * @param {string} uuid
 * @returns {object|null}
 */
export async function getOrderByCdekUuid(uuid) {
  return orders.find((o) => o.cdekUuid === uuid) || null;
}
