// pages/index.js (обновлённый пример)
import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import { CartContext } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";
import VideoBanner from "../components/VideoBanner";
import gridStyles from "../components/ProductGrid.module.css";

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
        const normalized = arr.map((item) => ({
          ...item,
          sizes: Array.isArray(item.sizes) ? item.sizes : [],
        }));
        setProducts(normalized);
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
        <title>Удобная Женственность с духом Авантюризма</title>
        <meta name="description" content="Выбор летних платьев" />
      </Head>

      <main className="section">
        {/* Видео между шапкой и товарами */}
        <VideoBanner
          bottomMargin="3rem" // настраиваемый отступ снизу
          sloganText="Удобная женственность с духом авантюризма"
        />

        {products.length === 0 ? (
          <p style={{ textAlign: "center" }}>Товары отсутствуют.</p>
        ) : (
          <div className={gridStyles.grid}>
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
