// pages/policy.js
import Head from "next/head";
import Link from "next/link";

export default function PolicyPage() {
  return (
    <>
      <Head>
        <title>Политика конфиденциальности</title>
        <meta name="description" content="Политика конфиденциальности" />
      </Head>
      {/* Используем секцию, чтобы добавить отступ под хедером */}
      <main className="section">
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          <h1>Политика конфиденциальности</h1>
          <p>
            Настоящая Политика конфиденциальности описывает, какие персональные
            данные собираются и как они используются при работе с сайтом...
          </p>
          {/* Добавьте полный текст политики здесь, форматируйте как в оферте */}
          <p style={{ marginTop: "30px" }}>
            <Link href="/">← Вернуться на главную</Link>
          </p>
        </div>
      </main>
    </>
  );
}
