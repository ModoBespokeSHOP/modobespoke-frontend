/* frontend/components/Product.js */
import { useState } from "react";
import Image from "next/image";
import styles from "./ProductCard.module.css";

const SPEC_LABELS = {
  color: "Цвет",
  material: "Материал",
  pattern: "Узор",
};

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
        <Image
          className={styles.cardImage}
          src={product.image}
          alt={product.title}
          layout="responsive"
          width={300}
          height={300}
          objectFit="contain"
        />
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{product.title}</h3>
          <p className={styles.cardPrice}>{product.price} ₽</p>
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

              {product.shortSpecs &&
                Object.keys(product.shortSpecs).length > 0 && (
                  <div className={styles.specsBlock}>
                    <h3 className={styles.blockHeader}>Характеристики</h3>
                    {Object.entries(product.shortSpecs).map(([key, val]) =>
                      val ? (
                        <div key={key} className={styles.specItem}>
                          <span className={styles.specKey}>
                            {SPEC_LABELS[key] || key}:
                          </span>
                          <span className={styles.specValue}>{val}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                )}

              {product.description && (
                <div className={styles.descriptionBlock}>
                  <h3 className={styles.blockHeader}>Описание</h3>
                  <p className={styles.descText}>{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
