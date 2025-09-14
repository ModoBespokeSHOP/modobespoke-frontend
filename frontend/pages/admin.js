// pages/admin.js
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/admin.module.css";

const DEFAULT_SPECS = [
  { field: "color", label: "Цвет" },
  { field: "material", label: "Материал" },
  { field: "pattern", label: "Узор" },
];
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL"];

export default function AdminPage() {
  const router = useRouter();

  // --- Auth state ---
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // --- Products state ---
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  // --- Form state for products ---
  const [form, setForm] = useState({
    id: null,
    title: "",
    shortSpecs: {},
    description: "",
    price: "",
    images: [], // Массив URLs
    sizes: [],
    _files: [], // Массив новых файлов для загрузки
  });
  const [previews, setPreviews] = useState([]); // Массив {src: string, type: 'existing' | 'new'}
  const [loading, setLoading] = useState(false);

  // --- Promo codes state ---
  const [promocodes, setPromocodes] = useState([]);
  const [promoForm, setPromoForm] = useState({
    id: null,
    code: "",
    type: "percent", // 'percent' or 'fixed'
    value: "",
  });
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // --- Modal state for delete confirmation ---
  const [toDeleteId, setToDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'product' or 'promo'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch products and promocodes once authorized
  useEffect(() => {
    if (!authorized) return;

    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.data || []))
      .catch(console.error);

    fetch("/api/promocodes")
      .then((r) => r.json())
      .then((data) =>
        setPromocodes(Array.isArray(data) ? data : data.data || [])
      )
      .catch(console.error);
  }, [authorized]);

  // Handlers for auth
  async function handleAuth(e) {
    e.preventDefault();
    setLoadingAuth(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error();
      setAuthorized(true);
    } catch {
      setAuthError("Неверный пароль");
    } finally {
      setLoadingAuth(false);
    }
  }

  // Handlers for product form
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }
  function handleSpecChange(field, value) {
    setForm((f) => ({
      ...f,
      shortSpecs: { ...f.shortSpecs, [field]: value },
    }));
  }
  function handleSizeToggle(size) {
    setForm((f) => {
      const has = f.sizes.includes(size);
      return {
        ...f,
        sizes: has ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
      };
    });
  }
  function handleFiles(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = [...form._files, ...files];
    setForm((f) => ({ ...f, _files: newFiles }));
    const newPreviews = files.map((file) => ({
      src: URL.createObjectURL(file),
      type: "new",
    }));
    setPreviews((p) => [...p, ...newPreviews]);
  }

  function handleDeletePreview(idx) {
    const item = previews[idx];
    if (item.type === "existing") {
      const newImages = form.images.filter((url) => url !== item.src);
      setForm((f) => ({ ...f, images: newImages }));
    } else {
      // Calculate index in _files: idx - number of existing
      const existingCount = previews.filter(
        (p) => p.type === "existing"
      ).length;
      const fileIdx = idx - existingCount;
      const newFiles = form._files.filter((_, i) => i !== fileIdx);
      setForm((f) => ({ ...f, _files: newFiles }));
    }
    setPreviews((p) => p.filter((_, i) => i !== idx));
  }

  async function handlePublish(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      let imageUrls = [...form.images]; // Существующие URLs
      if (form._files.length > 0) {
        for (const file of form._files) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          );
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: fd }
          );
          const json = await res.json();
          if (!res.ok) throw new Error(json.error?.message || "Upload failed");
          imageUrls.push(json.secure_url);
        }
      }
      const newProduct = {
        id: form.id ?? Date.now(),
        title: form.title,
        shortSpecs: form.shortSpecs,
        description: form.description,
        price: Number(form.price),
        images: imageUrls, // Массив
        sizes: form.sizes,
      };
      const updated = form.id
        ? products.map((p) => (p.id === form.id ? newProduct : p))
        : [...products, newProduct];
      const save = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!save.ok)
        throw new Error((await save.json()).message || "Save failed");
      setProducts(updated);
      setForm({
        id: null,
        title: "",
        shortSpecs: {},
        description: "",
        price: "",
        images: [],
        sizes: [],
        _files: [],
      });
      setPreviews([]);
      setMessage("Товар сохранён");
    } catch (err) {
      console.error(err);
      setMessage("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(p) {
    const images = p.images || (p.image ? [p.image] : []);
    setForm({
      id: p.id,
      title: p.title,
      shortSpecs: p.shortSpecs || {},
      description: p.description,
      price: p.price,
      images: images, // Совместимость со старыми данными
      sizes: p.sizes || [],
      _files: [],
    });
    setPreviews(images.map((url) => ({ src: url, type: "existing" })));
    setMessage("");
  }

  async function handleDeleteProduct(id) {
    const updated = products.filter((p) => p.id !== id);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setProducts(updated);
    setMessage("Товар удалён");
  }

  // Handlers for promo codes
  function handlePromoChange(e) {
    const { name, value } = e.target;
    setPromoForm((f) => ({ ...f, [name]: value }));
  }

  async function handlePublishPromo(e) {
    e.preventDefault();
    setPromoLoading(true);
    setPromoMessage("");
    try {
      const newPromo = {
        id: promoForm.id ?? Date.now(),
        code: promoForm.code.toUpperCase(),
        type: promoForm.type,
        value: Number(promoForm.value),
      };
      if (isNaN(newPromo.value) || newPromo.value <= 0) {
        throw new Error("Некорректное значение скидки");
      }
      const updated = promoForm.id
        ? promocodes.map((p) => (p.id === promoForm.id ? newPromo : p))
        : [...promocodes, newPromo];
      const save = await fetch("/api/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!save.ok)
        throw new Error((await save.json()).message || "Save failed");
      setPromocodes(updated);
      setPromoForm({
        id: null,
        code: "",
        type: "percent",
        value: "",
      });
      setPromoMessage("Промокод сохранён");
    } catch (err) {
      console.error(err);
      setPromoMessage("Ошибка: " + err.message);
    } finally {
      setPromoLoading(false);
    }
  }

  function handleEditPromo(p) {
    setPromoForm({
      id: p.id,
      code: p.code,
      type: p.type,
      value: p.value,
    });
    setPromoMessage("");
  }

  async function handleDeletePromo(id) {
    const updated = promocodes.filter((p) => p.id !== id);
    await fetch("/api/promocodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setPromocodes(updated);
    setPromoMessage("Промокод удалён");
  }

  function openDeleteModal(id, type) {
    setToDeleteId(id);
    setDeleteType(type);
    setIsModalOpen(true);
  }

  function closeDeleteModal() {
    setToDeleteId(null);
    setDeleteType(null);
    setIsModalOpen(false);
  }

  async function confirmDelete() {
    if (deleteType === "product") {
      await handleDeleteProduct(toDeleteId);
    } else if (deleteType === "promo") {
      await handleDeletePromo(toDeleteId);
    }
    closeDeleteModal();
  }

  // --- Render login if not authorized ---
  if (!authorized) {
    return (
      <>
        <Head>
          <title>Вход в админку</title>
        </Head>
        <div className={styles.loginWrapper}>
          <form onSubmit={handleAuth} className={styles.loginForm}>
            <h2>Пароль админки</h2>
            <div className={styles.inputWrapper}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
              <button
                type="button"
                className={styles.showBtn}
                onClick={() => setShowPwd((s) => !s)}
              >
                {showPwd ? "Скрыть" : "Показать"}
              </button>
            </div>
            <button type="submit" disabled={loadingAuth}>
              {loadingAuth ? "Проверка…" : "Войти"}
            </button>
            {authError && <p className={styles.error}>{authError}</p>}
          </form>
        </div>
      </>
    );
  }

  // --- Main admin panel ---
  return (
    <>
      <Head>
        <title>Админка — Магазин платьев</title>
      </Head>

      {/* Delete-confirmation modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>
              Вы уверены, что хотите удалить этот{" "}
              {deleteType === "product" ? "товар" : "промокод"}?
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.modalBtnCancel}
                onClick={closeDeleteModal}
              >
                Отмена
              </button>
              <button
                className={styles.modalBtnConfirm}
                onClick={confirmDelete}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <h1 className={styles.heading}>Панель администратора</h1>
        <div className={styles.panel}>
          <h2>Управление товарами</h2>
          <form className={styles.form} onSubmit={handlePublish}>
            {message && <div className={styles.error}>{message}</div>}
            <label>
              Заголовок
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>
            {DEFAULT_SPECS.map((spec) => (
              <label key={spec.field}>
                {spec.label}
                <input
                  type="text"
                  value={form.shortSpecs[spec.field] || ""}
                  onChange={(e) => handleSpecChange(spec.field, e.target.value)}
                />
              </label>
            ))}
            <label>
              Описание
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </label>
            <label>
              Цена, ₽
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>
            <div className={styles.sizesField}>
              <label className={styles.sizesLegend}>Доступные размеры</label>
              <div className={styles.sizesButtons}>
                {AVAILABLE_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`${styles.sizeBtn} ${
                      form.sizes.includes(sz) ? styles.activeBtn : ""
                    }`}
                    onClick={() => handleSizeToggle(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
            <label>
              Изображения (можно несколько)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
              />
            </label>
            {previews.length > 0 && (
              <div className={styles.previewWrapper}>
                {previews.map((prev, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    <img
                      src={prev.src}
                      className={styles.preview}
                      alt={`preview ${idx}`}
                    />
                    <button
                      type="button"
                      className={styles.deleteImageBtn}
                      onClick={() => handleDeletePreview(idx)}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="submit" disabled={loading}>
              {loading
                ? "Сохраняем…"
                : form.id
                ? "Обновить товар"
                : "Добавить товар"}
            </button>
          </form>

          <div className={styles.list}>
            <h2>Список товаров</h2>
            {products.length === 0 ? (
              <p>Ничего нет</p>
            ) : (
              products.map((p) => (
                <div key={p.id} className={styles.listItem}>
                  <img src={p.images?.[0] || p.image} alt={p.title} />
                  <div>
                    <strong>{p.title}</strong>
                    <div>{p.price}₽</div>
                  </div>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(p)}
                  >
                    Ред.
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => openDeleteModal(p.id, "product")}
                  >
                    Удал.
                  </button>
                </div>
              ))
            )}
          </div>

          <h2>Управление промокодами</h2>
          <form className={styles.form} onSubmit={handlePublishPromo}>
            {promoMessage && <div className={styles.error}>{promoMessage}</div>}
            <label>
              Код (верхний регистр автоматически)
              <input
                type="text"
                name="code"
                value={promoForm.code}
                onChange={handlePromoChange}
                required
              />
            </label>
            <label>
              Тип скидки
              <select
                name="type"
                value={promoForm.type}
                onChange={handlePromoChange}
              >
                <option value="percent">Процент (%)</option>
                <option value="fixed">Фиксированная сумма (₽)</option>
              </select>
            </label>
            <label>
              Значение скидки
              <input
                type="number"
                name="value"
                value={promoForm.value}
                onChange={handlePromoChange}
                required
              />
            </label>
            <button type="submit" disabled={promoLoading}>
              {promoLoading
                ? "Сохраняем…"
                : promoForm.id
                ? "Обновить промокод"
                : "Добавить промокод"}
            </button>
          </form>

          <div className={styles.list}>
            <h2>Список промокодов</h2>
            {promocodes.length === 0 ? (
              <p>Ничего нет</p>
            ) : (
              promocodes.map((p) => (
                <div key={p.id} className={styles.listItem}>
                  <div>
                    <strong>{p.code}</strong>
                    <div>
                      {p.value} {p.type === "percent" ? "%" : "₽"}
                    </div>
                  </div>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditPromo(p)}
                  >
                    Ред.
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => openDeleteModal(p.id, "promo")}
                  >
                    Удал.
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
