// pages/_app.js
import "../styles/globals.css";
import Script from "next/script";
import Link from "next/link";
import Footer from "../components/Footer";
import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "../context/ToastContext";

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
        <Script src="https://js.yookassa.ru/v3" strategy="afterInteractive" />
        <Header />
        <Component {...pageProps} />
        <Footer />
      </CartProvider>
    </ToastProvider>
  );
}
