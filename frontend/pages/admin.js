// frontend/pages/admin.js

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Функция для нормализации данных в массив
  function normalize(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.products)) return data.products;
    return [];
  }

  // Load existing products via API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(normalize(data));
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      });
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      setForm((f) => ({ ...f, image: json.secure_url || "" }));
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handlePublish = async () => {
    setLoading(true);
    setMessage("");
    // Собираем обновлённый массив
    const updated = [...products];
    if (form.id) {
      const idx = updated.findIndex((p) => p.id === form.id);
      if (idx !== -1) updated[idx] = { ...updated[idx], ...form };
    } else {
      updated.push({ ...form, id: Date.now() });
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const result = await res.json();
      if (res.ok) {
        setProducts(updated);
        setForm({ title: "", description: "", price: "", image: "" });
      }
      setMessage(result.message);
    } catch (err) {
      console.error("Publish error:", err);
      setMessage("Ошибка при публикации товара");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setMessage("");
    const updated = products.filter((p) => p.id !== id);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const result = await res.json();
      if (res.ok) {
        setProducts(updated);
      }
      setMessage(result.message);
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("Ошибка при удалении товара");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => setForm(p);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Админка магазина</h1>

      <div className="border p-4 rounded">
        <h2 className="text-xl mb-2">Загрузка изображения</h2>
        <div
          {...getRootProps()}
          className="border-dashed border-2 border-gray-400 p-4 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Отпустите файл...</p>
          ) : (
            <p>Перетащите или кликните для загрузки</p>
          )}
        </div>
        {loading && <p>Загрузка...</p>}
        {form.image && (
          <img
            src={form.image}
            alt="preview"
            className="mt-4 w-32 h-32 object-contain"
          />
        )}
      </div>

      <div className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Название"
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Описание"
          className="w-full p-2 border rounded"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Цена"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handlePublish}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Опубликовать товар
        </button>
      </div>

      {message && <p className="text-green-600">{message}</p>}

      <h2 className="text-xl">Список товаров</h2>
      <ul className="space-y-2">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex justify-between items-center border p-2"
          >
            <div className="flex items-center gap-4">
              <img
                src={p.image}
                alt={p.title}
                className="w-12 h-12 object-cover"
              />
              <span>
                {p.title} — {p.price}₽
              </span>
            </div>
            <div>
              <button
                onClick={() => handleEdit(p)}
                className="mr-2 text-blue-500"
              >
                Редактировать
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-500"
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
