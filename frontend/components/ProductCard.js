import { useState } from "react";
import Image from "next/image";
import styles from "./ProductCard.module.css"; // ваши стили

export default function ProductCard({ product, onAddToCart }) {
  const [showModal, setShowModal] = useState(false);
  const [size, setSize] = useState(product.sizes[0] || "");

  const handleAdd = () => {
    onAddToCart({ ...product, selectedSize: size });
    setShowModal(false);
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageWrapper} onClick={() => setShowModal(true)}>
          <Image
            src={product.image}
            alt={product.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className={styles.info}>
          <div className={styles.price}>{product.price} ₽</div>
          <div className={styles.title}>{product.title}</div>
        </div>
      </div>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <Image
              src={product.image}
              alt={product.title}
              width={300}
              height={300}
            />
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <p>
              <strong>Состав:</strong> {product.composition}
            </p>

            <label htmlFor={`size-${product.id}`}>
              Размер:
              <select
                id={`size-${product.id}`}
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {product.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <button className={styles.addBtn} onClick={handleAdd}>
              В корзину
            </button>
          </div>
        </div>
      )}
    </>
  );
}
