// frontend/pages/_app.js

import "../styles/globals.css"; // подключен global
import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { CartProvider } from "../context/CartContext";

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "with-shadow" : ""}`}>
      <Link href="/" className="text-xl font-bold">
        Магазин платьев
      </Link>
      <Link
        href="/cart"
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
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
