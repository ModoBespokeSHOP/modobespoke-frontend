// pages/support.js
import Head from "next/head";
import Link from "next/link";

export default function SupportPage() {
  return (
    <>
      <Head>
        <title>Поддержка</title>
        <meta name="description" content="Контакты поддержки" />
      </Head>
      {/* Отступ под header */}
      <main className="section">
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          <h1>Поддержка</h1>
          <p>
            Если у вас возникли вопросы или проблемы при использовании сайта,
            пожалуйста, свяжитесь с нами по следующим контактам:
          </p>
          <ul>
            <li>
              <strong>Электронная почта:</strong>{" "}
              <a href="mailto:modobespokehelp@outlook.com">
                modobespokehelp@outlook.com
              </a>
            </li>
            <li>
              <strong>Телефон:</strong>{" "}
              <a href="tel:+79109993023">+7&nbsp;(910)&nbsp;999-30-23</a>
            </li>
          </ul>
          <p style={{ marginTop: "30px" }}>
            <Link href="/">← Вернуться на главную</Link>
          </p>
        </div>
      </main>
    </>
  );
}
