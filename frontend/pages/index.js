// frontend/pages/index.js

import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import { CartContext } from "../context/CartContext";
import styles from "../styles/Home.module.css"; // <- подключаем CSS Module

export default function Home() {
  const [products, setProducts] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (Array.isArray(data.data)) setProducts(data.data);
        else setProducts([]);
      })
      .catch(() => setProducts([]));
  }, []);

  if (products === null) {
    return <p className={styles.message}>Загрузка...</p>;
  }

  return (
    <>
      <Head>
        <title>Магазин платьев</title>
        <meta name="description" content="Выбор летних платьев" />
      </Head>

      <main className={styles.section}>
        {products.length === 0 ? (
          <p className={styles.message}>Товары отсутствуют.</p>
        ) : (
          <div className={styles.grid}>
            {products.map((prod) => (
              <div key={prod.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img src={prod.image} alt={prod.title} />
                </div>
                <div className={styles.info}>
                  <span className={styles.price}>{prod.price}₽</span>
                  <span className={styles.title}>{prod.title}</span>
                </div>
                <button
                  className={styles.button}
                  onClick={() => addToCart(prod)}
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
