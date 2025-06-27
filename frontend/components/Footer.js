import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
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
      <div className="footer-right">
        <Link href="/offer" legacyBehavior>
          <a>Договор-оферта</a>
        </Link>
        <a href="mailto:youremail@example.com">Поддержка</a>
      </div>
    </footer>
  );
}
