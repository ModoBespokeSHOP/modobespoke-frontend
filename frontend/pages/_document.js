import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <script src="https://js.yookassa.ru/v3"></script>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
