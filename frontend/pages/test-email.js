import { useState } from "react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Ошибка при отправке письма");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Тестовое письмо</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Введите email для теста:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "10px", marginTop: "10px" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", marginTop: "10px" }}
        >
          {loading ? "Отправка..." : "Отправить письмо"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "20px", color: loading ? "blue" : "green" }}>
          {message}
        </div>
      )}
    </div>
  );
}
