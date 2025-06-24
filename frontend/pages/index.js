import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import { CartContext } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.products || [];
        setProducts(arr);
      })
      .catch((err) => {
        console.error("Fetch products error:", err);
        setProducts([]);
      });
  }, []);

  if (products === null) {
    return <p className="p-4 text-center">Загрузка товаров...</p>;
  }

  return (
    <>
      <Head>
        <title>Магазин платьев</title>
        <meta name="description" content="Выбор летних платьев" />
      </Head>

      <main className="container mx-auto px-4 py-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-600">Товары отсутствуют.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="border rounded-lg overflow-hidden shadow hover:shadow-lg flex flex-col"
              >
                <div className="relative w-full h-40 bg-gray-100">
                  <Image
                    src={prod.image}
                    alt={prod.title}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">{prod.title}</h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {prod.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold">{prod.price}₽</span>
                    <button
                      onClick={() => addToCart(prod)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Добавить в корзину
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
