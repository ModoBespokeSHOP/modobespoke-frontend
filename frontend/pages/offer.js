// pages/offer.js
import Head from "next/head";
import Link from "next/link";

export default function OfferPage() {
  return (
    <>
      <Head>
        <title>Договор-оферта</title>
        <meta name="description" content="Договор публичной оферты" />
      </Head>

      {/* Добавляем отступ под header */}
      <main className="section">
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          <h1>Договор публичной оферты</h1>
          <p>
            Настоящий документ является официальным предложением Индивидуального
            предпринимателя … предоставить покупателю следующие услуги/товары на
            условиях, изложенных ниже.
          </p>

          <h2>1. Предмет оферты</h2>
          <p>
            1.1. Продавец обязуется передать в собственность Покупателя товары,
            указанные на сайте, а Покупатель обязуется принять и оплатить эти
            товары на условиях настоящего договора.
          </p>

          <h2>2. Цены и оплата</h2>
          <p>
            2.1. Цена товаров указывается на сайте в момент оформления заказа.
            Оплата производится …
          </p>

          <p style={{ marginTop: "40px", fontSize: "12px", color: "#666" }}>
            Если у вас есть вопросы, пишите на{" "}
            <a href="mailto:youremail@example.com">youremail@example.com</a>.
          </p>

          <p style={{ marginTop: "30px" }}>
            <Link href="/">← Вернуться на главную</Link>
          </p>
        </div>
      </main>
    </>
  );
}
