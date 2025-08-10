import { useContext, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { CartContext } from "../context/CartContext";
import styles from "../styles/cart.module.css";
import CDEKWIDGET from "../components/CdekWidget";

export default function CartPage() {
  const { cart, addToCart, decreaseQty, removeFromCart, clearCart } =
    useContext(CartContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountType, setDiscountType] = useState(null); // 'percent' or 'fixed'
  const [discountValue, setDiscountValue] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState({
    office: null,
    price: 0,
    method: "Неизвестный метод",
  });

  useEffect(() => {
    console.log(
      "Текущее состояние delivery:",
      JSON.stringify(delivery, null, 2)
    );
  }, [delivery]);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const calculateDiscount = (subtotal, type, value) => {
    if (type === "percent") {
      return subtotal * (value / 100);
    } else if (type === "fixed") {
      return value;
    }
    return 0;
  };

  const discount = calculateDiscount(total, discountType, discountValue);
  const discountedTotal = total - discount;
  const finalTotal =
    discountedTotal +
    (delivery.office && delivery.office !== "Адрес не указан"
      ? delivery.price
      : 0);

  // Форматирование телефона
  const formatPhone = (value) => {
    const digits = value.replace(/[^\d+]/g, "");
    let phoneNumber = digits.startsWith("+7")
      ? digits
      : "+7" + digits.replace(/^\+?/, "");
    phoneNumber = phoneNumber.slice(0, 12);
    const match = phoneNumber.match(
      /^\+7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/
    );
    if (match) {
      const formatted = `+7${match[1] ? ` (${match[1]}` : ""}${
        match[2] ? `) ${match[2]}` : ""
      }${match[3] ? `-${match[3]}` : ""}${match[4] ? `-${match[4]}` : ""}`;
      return formatted;
    }
    return phoneNumber;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(formatPhone(value));
  };

  const handlePhoneFocus = () => {
    if (!phone || phone === "+") {
      setPhone("+7");
    }
  };

  const handleApplyPromo = async () => {
    setPromoError("");
    setAppliedDiscount(0);
    setDiscountType(null);
    setDiscountValue(0);

    if (!promoCode.trim()) {
      setPromoError("Введите промокод");
      return;
    }

    try {
      const res = await fetch(
        `/api/validate-promo?code=${encodeURIComponent(promoCode)}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Неверный промокод");
      }
      const { type, value } = await res.json();
      setDiscountType(type);
      setDiscountValue(value);
      setAppliedDiscount(calculateDiscount(total, type, value));
    } catch (err) {
      setPromoError(err.message || "Неверный промокод");
    }
  };

  // Проверка валидности формы
  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      email.trim() !== "" &&
      email.includes("@") &&
      delivery.office &&
      delivery.office !== "Адрес не указан" &&
      delivery.method !== "Неизвестный метод" &&
      cart.length > 0
    );
  };

  const handlePay = async () => {
    setError("");
    setLoading(true);
    if (!name.trim() || !email.trim()) {
      setError("Пожалуйста, введите ФИО и email");
      setLoading(false);
      return;
    }
    if (!email.includes("@")) {
      setError("Пожалуйста, введите корректный email");
      setLoading(false);
      return;
    }
    if (!delivery.office || delivery.office === "Адрес не указан") {
      setError("Пожалуйста, выберите пункт выдачи заказа через СДЭК");
      setLoading(false);
      return;
    }

    const orderData = {
      cart,
      customerName: name,
      customerPhone: phone.replace(/[^\d+]/g, ""),
      customerEmail: email,
      deliveryOffice: delivery.office,
      deliveryPrice: delivery.price,
      deliveryMethod: delivery.method,
      promoCode: promoCode,
      discount: discount,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/store-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Не удалось сохранить заказ");
      }
      const data = await res.json();
      console.log("Ответ от API:", data);
      // Очищаем корзину после успешного сохранения заказа
      clearCart();
      const query = new URLSearchParams({
        orderId: data.orderId,
        telegramUrl: data.telegramUrl,
        customerName: name,
        customerPhone: phone.replace(/[^\d+]/g, ""),
        customerEmail: email,
        deliveryOffice: delivery.office,
        deliveryPrice: delivery.price.toString(),
        deliveryMethod: delivery.method,
        cart: JSON.stringify(cart),
        promoCode: promoCode,
        discount: discount.toString(),
        finalTotal: finalTotal.toString(),
      }).toString();
      window.location.href = `/order-confirmed?${query}`;
    } catch (err) {
      console.error("Ошибка при сохранении заказа:", err);
      setError(err.message || "Не удалось сохранить заказ. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Корзина — Магазин платьев</title>
      </Head>
      <main className={styles.cartContainer}>
        <div className={styles.cartItems}>
          <div className={styles.itemsHeader}>
            <h2 className={styles.itemsTitle}>Ваш заказ</h2>
          </div>
          {cart.length === 0 ? (
            <p>Ваша корзина пуста.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className={styles.cartItem}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={200}
                    height={200}
                    sizes="(max-width: 640px) 200px, 80px"
                    style={{ objectFit: "cover" }}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemDetails}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemMeta}>
                        Размер: {item.selectedSize}
                      </div>
                      <div className={styles.itemPrice}>
                        {item.price * item.qty}₽
                      </div>
                    </div>
                    <div className={styles.itemQty}>
                      <button
                        onClick={() => decreaseQty(item.id, item.selectedSize)}
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => addToCart(item, 1)}>+</button>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.clearBtn}
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Очистить корзину
              </button>
            </>
          )}
        </div>

        <div className={styles.cartSummary}>
          <h2 className={styles.summaryTitle}>Оформление заказа</h2>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ФИО</label>
            <input
              className={styles.formInput}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Телефон</label>
            <input
              className={styles.formInput}
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onFocus={handlePhoneFocus}
              placeholder="+7 (XXX) XXX-XX-XX"
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>E‑mail для чека</label>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Промокод</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                className={styles.formInput}
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Введите промокод"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className={styles.applyBtn}
              >
                Применить
              </button>
            </div>
            {promoError && <p className={styles.error}>{promoError}</p>}
            {discount > 0 && (
              <p className={styles.success}>
                Скидка применена: -{discount}₽{" "}
                {discountType === "percent" ? `(${discountValue}%)` : ""}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Выберите пункт выдачи (СДЭК):
            </label>
            <CDEKWIDGET setDelivery={setDelivery} />
            {!delivery.office || delivery.office === "Адрес не указан" ? (
              <p className={styles.error}>Пункт выдачи не выбран</p>
            ) : null}
          </div>

          <div className={styles.breakdown}>
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}`}
                className={styles.breakdownLine}
              >
                {item.qty} × {item.title} ({item.selectedSize}) ={" "}
                {item.price * item.qty}₽
              </div>
            ))}
            {discount > 0 && (
              <div className={styles.breakdownLine}>
                Скидка по промокоду ({promoCode}): -{discount}₽{" "}
                {discountType === "percent" ? `(${discountValue}%)` : ""}
              </div>
            )}
            {delivery.office && delivery.office !== "Адрес не указан" && (
              <div className={styles.breakdownLine}>
                Доставка (СДЭК, {delivery.method}): {delivery.price}₽
              </div>
            )}
          </div>

          <div className={styles.summaryTotal}>
            <span className={styles.summaryLabel}>Итого к оплате:</span>
            <span className={styles.totalAmount}>{finalTotal}₽</span>
          </div>

          <button
            type="button"
            className={styles.payBtn}
            onClick={handlePay}
            disabled={loading || !isFormValid()}
          >
            {loading ? "Пожалуйста, подождите…" : "Оплатить"}
          </button>
        </div>
      </main>
    </>
  );
}
