// frontend/pages/_app.js

import "../styles/globals.css";
import Script from "next/script";
import Link from "next/link";
import { CartProvider } from "../context/CartContext";

function Header() {
  return (
    <header className="p-4 bg-white shadow flex justify-between items-center mb-6">
      <Link href="/" className="text-xl font-bold">
        Магазин платьев
      </Link>
      <Link
        href="/cart"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Корзина
      </Link>
    </header>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Асинхронная загрузка YooKassa SDK */}
      <Script src="https://js.yookassa.ru/v3" strategy="afterInteractive" />

      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Component {...pageProps} />
        </div>
      </CartProvider>
    </>
  );
}
