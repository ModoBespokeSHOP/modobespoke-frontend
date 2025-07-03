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

  // --- Form state ---
  const [form, setForm] = useState({
    id: null,
    title: "",
    shortSpecs: {},
    description: "",
    price: "",
    image: "",
    sizes: [],
    _file: null,
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- Modal state for delete confirmation ---
  const [toDeleteId, setToDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch products once authorized
  useEffect(() => {
    if (!authorized) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.data || []))
      .catch(console.error);
  }, [authorized]);

  // Handlers
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
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, _file: file }));
    setPreview(URL.createObjectURL(file));
  }

  async function handlePublish(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      let imageUrl = form.image;
      if (form._file) {
        const fd = new FormData();
        fd.append("file", form._file);
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
        imageUrl = json.secure_url;
      }
      const newProduct = {
        id: form.id ?? Date.now(),
        title: form.title,
        shortSpecs: form.shortSpecs,
        description: form.description,
        price: Number(form.price),
        image: imageUrl,
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
        image: "",
        sizes: [],
        _file: null,
      });
      setPreview("");
      setMessage("Товар сохранён");
    } catch (err) {
      console.error(err);
      setMessage("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(p) {
    setForm({
      id: p.id,
      title: p.title,
      shortSpecs: p.shortSpecs || {},
      description: p.description,
      price: p.price,
      image: p.image,
      sizes: p.sizes || [],
      _file: null,
    });
    setPreview(p.image);
    setMessage("");
  }

  async function handleDelete(id) {
    const updated = products.filter((p) => p.id !== id);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setProducts(updated);
    setMessage("Товар удалён");
  }

  // Modal helpers
  function openDeleteModal(id) {
    setToDeleteId(id);
    setIsModalOpen(true);
  }
  function closeDeleteModal() {
    setToDeleteId(null);
    setIsModalOpen(false);
  }
  async function confirmDelete() {
    await handleDelete(toDeleteId);
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
            <p>Вы уверены, что хотите удалить этот товар?</p>
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
              Изображение
              <input type="file" accept="image/*" onChange={handleFile} />
            </label>
            {preview && (
              <div className={styles.previewWrapper}>
                <img src={preview} className={styles.preview} alt="preview" />
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
                  <img src={p.image} alt={p.title} />
                  <div>
                    <strong>{p.title}</strong>
                    <div>{p.price}₽</div>
                  </div>
                  <button onClick={() => handleEdit(p)}>Ред.</button>
                  <button onClick={() => openDeleteModal(p.id)}>Удал.</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
