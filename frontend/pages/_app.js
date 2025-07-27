import Head from "next/head";
import Script from "next/script";
import Link from "next/link";
import Footer from "../components/Footer";
import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "../context/ToastContext";
import "../styles/globals.css";

function Header() {
  return (
    <header className="header">
      <Link href="/" className="logo-link">
        <img src="/images/logo.png" alt="Логотип" className="logo-img" />
      </Link>
      <div className="header-right">
        <Link href="/cart" className="cart-link">
          Корзина
        </Link>
      </div>
    </header>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <ToastProvider>
      <CartProvider>
        <Script
          type="text/javascript"
          src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@2"
          charSet="utf-8"
          strategy="afterInteractive" // Это подходит для виджета
        />
        <Script
          src="https://yookassa.ru/v3/yookassa.js"
          strategy="afterInteractive"
        />
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </CartProvider>
    </ToastProvider>
  );
}
