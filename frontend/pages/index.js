import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import { CartContext } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Home() {
  const [products, setProducts] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];
        setProducts(arr);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setProducts([]);
      });
  }, []);

  if (products === null) {
    return (
      <p style={{ textAlign: "center", padding: 20 }}>Загрузка товаров…</p>
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
          <p style={{ textAlign: "center" }}>Товары отсутствуют.</p>
        ) : (
          <div className="grid">
            {products.map((prod) => (
              <div key={prod.id} className="card">
                <img src={prod.image} alt={prod.title} />
                <div className="product-info">
                  <div className="product-price">{prod.price} ₽</div>
                  <div className="product-title">{prod.title}</div>
                </div>
                <button
                  className="add-to-cart"
                  onClick={() => {
                    addToCart(prod);
                    showToast("Товар добавлен в корзину");
                  }}
                >
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
