import { useEffect, useState, useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch("http://localhost:1337/api/products?populate=image")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Ответ от API:", data); // ← смотри в F12 → Console
        // если ты получаешь объект вида { data: [ {...}, ... ] }
        setProducts(data.data || []);
      })
      .catch((err) => console.error("Ошибка при загрузке товаров:", err));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Магазин платьев</h1>

      {products.length === 0 ? (
        <p className="text-gray-600">Товары не найдены.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => {
            // Теперь поля — прямо в product
            const { id, title, price, image } = product;
            // image.url — путь к картинке, как в твоём JSON
            const imageUrl = image?.url
              ? `http://localhost:1337${image.url}`
              : "https://via.placeholder.com/400x600?text=Нет+фото";

            return (
              <div key={id} className="bg-white rounded-xl shadow p-4">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto object-cover rounded-md mb-4"
                />
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-gray-700 mt-2">{price} ₽</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() =>
                    addToCart({ id, title, price, image: imageUrl })
                  }
                >
                  В корзину
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
