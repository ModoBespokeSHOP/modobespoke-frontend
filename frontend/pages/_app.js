// frontend/pages/_app.js

import "../styles/globals.css";
import { CartProvider } from "../context/CartContext";
import Script from "next/script";
import dynamic from "next/dynamic";

// Загружаем Header только на клиенте, чтобы он не участвовал в SSR
const Header = dynamic(() => import("../components/Header"), {
  ssr: false,
});

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* YooKassa SDK */}
      <Script src="https://js.yookassa.ru/v3" strategy="afterInteractive" />

      {/* Весь сайт в провайдере корзины */}
      <CartProvider>
        {/* Клиентский Header */}
        <Header />
        {/* Основной контент страницы */}
        <Component {...pageProps} />
      </CartProvider>
    </>
  );
}
