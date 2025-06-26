// frontend/pages/_app.js

import "../styles/globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { CartProvider } from "../context/CartContext";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "with-shadow" : ""}`}>
      <Link href="/" className="logo-link">
        <img src="/images/logo.png" alt="Логотип" className="logo-img" />
      </Link>
      <Link href="/cart" className="cart-link">
        Корзина
      </Link>
    </header>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script src="https://js.yookassa.ru/v3" strategy="afterInteractive" />
      <CartProvider>
        <Header />
        <Component {...pageProps} />
      </CartProvider>
    </>
  );
}
