// pages/policy.js
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/policy.module.css"; // создадим ниже

export default function PolicyPage() {
  return (
    <>
      <Head>
        <title>Политика конфиденциальности</title>
        <meta name="description" content="Политика конфиденциальности" />
      </Head>
      <main className={`section ${styles.policySection}`}>
        <div className={styles.container}>
          <h1 className={styles.title}>Политика конфиденциальности</h1>
          <p>
            Настоящая Политика конфиденциальности описывает, какие персональные
            данные собираются и как они используются при работе с сайтом...
          </p>
          <p style={{ marginTop: "30px" }}>
            <Link href="/">← Вернуться на главную</Link>
          </p>
        </div>
      </main>
    </>
  );
}
