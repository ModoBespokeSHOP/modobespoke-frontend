// frontend/pages/index.js
import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import { CartContext } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";

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
        {/* Видео-превью */}
        <div className="promo-video" style={{ marginBottom: 24 }}>
          <video
            src="/video/promo.mp4" // или URL вида https://...
            poster="/images/video-poster.jpg" // превью до старта
            controls
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </div>

        {products.length === 0 ? (
          <p style={{ textAlign: "center" }}>Товары отсутствуют.</p>
        ) : (
          <div className="grid">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onAddToCart={(p) => {
                  addToCart(p);
                  showToast("Товар добавлен в корзину");
                }}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
