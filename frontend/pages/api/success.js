import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/success.module.css";

export default function SuccessPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [message, setMessage] = useState("Проверка статуса платежа...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Ошибка проверки платежа");
        }
        setMessage("Заказ успешно оплачен! Спасибо за покупку.");
      } catch (err) {
        console.error("Ошибка проверки платежа:", err);
        setError(err.message);
        setMessage("");
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  return (
    <>
      <Head>
        <title>Результат оплаты — Магазин платьев</title>
      </Head>
      <main className={styles.container}>
        <h1>Результат оплаты</h1>
        {message && <p>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.backBtn} onClick={() => router.push("/")}>
          Вернуться на главную
        </button>
      </main>
    </>
  );
}
