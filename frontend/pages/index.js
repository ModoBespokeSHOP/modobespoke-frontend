// frontend/pages/index.js

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "public", "data", "products.json");
  let raw = "[]";
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {}
  let parsed = [];
  try {
    parsed = JSON.parse(raw);
  } catch {}
  const products = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.products)
    ? parsed.products
    : [];
  return { props: { products } };
}

export default function Home({ products }) {
  return (
    <>
      <Head>
        <title>Магазин платьев</title>
        <meta name="description" content="Выбор летних платьев" />
      </Head>

      <main className="container mx-auto px-4">
        {products.length === 0 ? (
          <p className="text-center text-gray-600">Товары отсутствуют.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
              >
                <div className="p-4 flex items-center justify-center">
                  <Image
                    src={prod.image}
                    alt={prod.title}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">{prod.title}</h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {prod.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold">{prod.price}₽</span>
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                      Добавить в корзину
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
