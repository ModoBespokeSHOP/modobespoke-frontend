// frontend/pages/admin.js

import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/admin.module.css";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    price: "",
    image: "",
    _file: null, // временно хранит выбранный файл
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Загрузка существующих товаров
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        setProducts(arr);
      })
      .catch(console.error);
  }, []);

  // Обработчик изменения текстовых полей
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Обработчик выбора файла
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

      // Если выбран новый файл, загружаем его на Cloudinary
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
        throw new Error(err.message || "Ошибка сохранения");
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
    }
  }

  // Заполнение формы для редактирования
  function handleEdit(p) {
    setForm({ ...p, _file: null });
    setPreview(p.image);
    setMessage("");
  }

  return (
    <>
      <Head>
        <title>Админка — Магазин платьев</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.heading}>Панель администратора</h1>

        <div className={styles.panel}>
          {/* Форма */}
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
