import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleOrder = async () => {
    setError("");
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Введите имя и телефон");
      return;
    }
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Введите корректный номер телефона (минимум 10 цифр)");
      return;
    }

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customerName,
          customerPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка оформления заказа");
      clearCart();
      window.location.href = data.confirmation_url;
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Корзина</h1>

      {cart.length === 0 ? (
        <p>Корзина пуста.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between bg-white p-4 rounded shadow"
              >
                {item.image && (
                  <div className="w-20 h-20 relative mr-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-gray-600">
                    × {item.price} ₽ × {item.qty} ={" "}
                    <strong>{item.price * item.qty} ₽</strong>
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <span className="text-lg font-bold">Итого: {total} ₽</span>
            <button
              onClick={clearCart}
              className="text-sm text-gray-500 underline"
            >
              Очистить корзину
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow mt-6 space-y-4">
            <input
              type="text"
              placeholder="Ваше имя"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="tel"
              placeholder="Телефон (только цифры)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />

            {error && <p className="text-red-600">{error}</p>}

            <button
              onClick={handleOrder}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Перейти к оплате
            </button>
          </div>
        </>
      )}
    </div>
  );
}
