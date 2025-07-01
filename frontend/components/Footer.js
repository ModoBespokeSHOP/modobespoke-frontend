// components/Footer.js
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-left">
          <a
            href="https://t.me/ваш_телеграм"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>
          <a
            href="https://instagram.com/ваш_инстаграм"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/ваш_номер_в_whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
        <div className="footer-right-links">
          <Link href="/offer">Договор-оферта</Link>
          <Link href="/policy">Политика конфиденциальности</Link>
          <Link href="/support">Поддержка</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Москва, Россия © {year}, Modo Bespoke</span>
        <div className="footer-payments">
          <img src="/icons/visa.svg" alt="Visa" />
          <img src="/icons/mastercard.svg" alt="Mastercard" />
          <img src="/icons/mir.svg" alt="Мир" />
        </div>
      </div>
    </footer>
  );
}
