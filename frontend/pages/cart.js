import { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const [customer, setCustomer] = useState({ name: "", phone: "" });

  // Итого
  const total = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    return sum + price * qty;
  }, 0);

  const handlePayment = async () => {
    if (!customer.name || !customer.phone) {
      alert("Введите имя и телефон");
      return;
    }
    try {
      // 1) Создать заказ в Strapi
      const orderRes = await fetch("http://localhost:1337/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            customerName: customer.name,
            customerPhone: customer.phone,
            items: cart.map(({ id, title, price, qty }) => ({
              id,
              title,
              price,
              qty,
            })),
            total,
            orderStatus: "new",
          },
        }),
      });
      const { data: orderData } = await orderRes.json();
      const orderId = orderData.id;

      // 2) Получить ссылку на оплату
      const paymentRes = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: total,
          description: `Оплата заказа №${orderId}`,
        }),
      });
      const { confirmation_url } = await paymentRes.json();
      if (!confirmation_url) throw new Error("Нет ссылки на оплату");

      // 3) Перенаправить
      window.location.href = confirmation_url;
    } catch (err) {
      console.error(err);
      alert("Ошибка оформления платежа");
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Корзина</h1>

      {cart.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between bg-white p-4 rounded shadow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-auto object-cover rounded"
                  />
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-gray-600">
                      {item.qty} × {item.price} ₽ = {item.qty * item.price} ₽
                    </p>
                  </div>
                </div>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => removeFromCart(item.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>

          <div className="mb-6">
            <p className="text-xl font-semibold">Итого: {total} ₽</p>
          </div>

          <div className="space-y-4 max-w-md">
            <input
              type="text"
              placeholder="Имя"
              className="w-full p-2 border rounded"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />
            <input
              type="tel"
              placeholder="Телефон"
              className="w-full p-2 border rounded"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
            />
            <button
              onClick={handlePayment}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Оформить и оплатить
            </button>
            <button
              onClick={clearCart}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Очистить корзину
            </button>
          </div>
        </>
      )}
    </main>
  );
}
