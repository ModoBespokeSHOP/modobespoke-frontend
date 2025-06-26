// frontend/pages/index.js

import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import { CartContext } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // если API отдаёт либо чистый массив, либо { data: [...] }
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];
        setProducts(arr);
      })
      .catch((err) => {
        console.error("Fetch products error:", err);
        setProducts([]);
      });
  }, []);

  if (products === null) {
    return (
      <main className="section">
        <p>Загрузка товаров…</p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Магазин платьев</title>
        <meta name="description" content="Выбор летних платьев" />
      </Head>

      <main className="section">
        {products.length === 0 ? (
          <p>Товары отсутствуют.</p>
        ) : (
          <div className="grid">
            {products.map((prod) => (
              <div key={prod.id} className="card">
                <img src={prod.image} alt={prod.title} />

                <div className="product-info">
                  <div className="product-price">{prod.price} ₽</div>
                  <div className="product-title">{prod.title}</div>
                </div>

                <button className="add-to-cart" onClick={() => addToCart(prod)}>
                  В корзину
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
