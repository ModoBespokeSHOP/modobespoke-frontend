"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
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
