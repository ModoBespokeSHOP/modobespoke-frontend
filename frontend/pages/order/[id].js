// frontend/pages/order/[id].js

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function OrderPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:1337/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data.data.attributes))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Загрузка...</p>;
  if (!order) return <p className="p-6 text-red-600">Заказ не найден</p>;

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Спасибо за заказ!</h1>
      <p>
        Номер вашего заказа: <strong>{id}</strong>
      </p>
      <p>
        Статус: <strong>{order.orderStatus}</strong>
      </p>
      <h2 className="mt-6 text-2xl font-semibold">Детали заказа:</h2>
      <ul className="mt-4 space-y-2">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex justify-between">
            <span>
              {item.title} × {item.qty}
            </span>
            <span>{item.price * item.qty} ₽</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xl font-semibold">Итого: {order.total} ₽</p>
    </main>
  );
}
