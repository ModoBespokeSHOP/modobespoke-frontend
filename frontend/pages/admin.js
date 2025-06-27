import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/admin.module.css";

export default function AdminPage() {
  // === аутентификация ===
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // === данные товаров ===
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    price: "",
    image: "",
    _file: null,
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Загружаем товары при авторизации
  useEffect(() => {
    if (!authorized) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        setProducts(arr);
      })
      .catch(console.error);
  }, [authorized]);

  // Обработчики формы товара
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, _file: file }));
    setPreview(URL.createObjectURL(file));
  }

  // Публикация или обновление товара
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
        description: form.description,
        price: Number(form.price),
        image: imageUrl,
      };
      const updated = form.id
        ? products.map((p) => (p.id === form.id ? newProduct : p))
        : [...products, newProduct];
      const save = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!save.ok) {
        const err = await save.json();
        throw new Error(err.message || "Save failed");
      }
      setProducts(updated);
      setForm({
        id: null,
        title: "",
        description: "",
        price: "",
        image: "",
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

  // Удаление товара
  async function handleDelete(id) {
    const updated = products.filter((p) => p.id !== id);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setProducts(updated);
      setMessage("Товар удалён");
    } else {
      setMessage("Ошибка удаления");
    }
  }

  // Редактирование товара
  function handleEdit(p) {
    setForm({ ...p, _file: null });
    setPreview(p.image);
    setMessage("");
  }

  // Авторизация
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

  // Если не авторизованы — показываем форму
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

  // Иначе — UI админки
  return (
    <>
      <Head>
        <title>Админка — Магазин платьев</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.heading}>Панель администратора</h1>
        <div className={styles.panel}>
          {/* Форма добавления/редактирования */}
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
            <label>
              Описание
              <textarea
                name="description"
                rows={3}
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
            <label>
              Изображение
              <input type="file" accept="image/*" onChange={handleFile} />
            </label>
            {preview && (
              <div className={styles.previewWrapper}>
                <img src={preview} alt="preview" className={styles.preview} />
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

          {/* Список товаров */}
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
                  <button onClick={() => handleDelete(p.id)}>Удал.</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
