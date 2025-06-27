import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Неверный пароль");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 360, margin: "100px auto", padding: 24 }}
    >
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
          style={{ width: "100%", padding: "8px 40px 8px 12px" }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {show ? "Скрыть" : "Показать"}
        </button>
      </div>
      <button
        type="submit"
        style={{ marginTop: 12, width: "100%", padding: 10 }}
      >
        Войти
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
