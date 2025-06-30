// components/ProductCard.js
import { useState } from "react";
import Image from "next/image";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product = {}, onAddToCart }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);
  const handleAdd = () => {
    onAddToCart({ ...product, selectedSize });
    handleClose();
  };

  return (
    <>
      <div className={styles.card} onClick={handleOpen}>
        <div className={styles.imageWrapper}>
          <Image
            src={product.image}
            alt={product.title}
            layout="responsive"
            width={300}
            height={300}
            objectFit="contain"
          />
        </div>
        <div className={styles.info}>
          <div className={styles.price}>{product.price} ₽</div>
          <div className={styles.title}>{product.title}</div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={handleClose}>
              ✕
            </button>

            <div className={styles.modalImage}>
              <Image
                src={product.image}
                alt={product.title}
                layout="fill"
                objectFit="cover"
              />
            </div>

            <div className={styles.modalDetails}>
              <h2 className={styles.modalTitle}>{product.title}</h2>
              <p className={styles.modalPrice}>{product.price} ₽</p>
              <p className={styles.modalDescription}>{product.description}</p>
              <div className={styles.sizeSelector}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`${styles.sizeBtn} ${
                      selectedSize === size ? styles.active : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={!selectedSize}
              >
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
