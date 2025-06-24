// frontend/pages/index.js

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.products || [];
        setProducts(arr);
      })
      .catch(() => setProducts([]));
  }, []);

  if (products === null) return <p>Загрузка товаров...</p>;

  return (
    <>
      <Head>
        <title>Магазин платьев</title>
      </Head>
      <main className="container mx-auto px-4">
        {products.length === 0 ? (
          <p>Товары отсутствуют.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="border rounded-lg shadow">
                <div className="relative w-full h-40 bg-gray-100">
                  <Image
                    src={prod.image}
                    alt={prod.title}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold">{prod.title}</h2>
                    <p className="text-gray-600">{prod.price}₽</p>
                  </div>
                  <button className="px-3 py-1 bg-green-500 text-white rounded">
                    В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
