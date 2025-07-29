import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import styles from "../styles/cart.module.css";

export default function CDEKDelivery() {
  const [city, setCity] = useState("Москва"); // Начальный город - Москва
  const [showModal, setShowModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const widgetRef = useRef(null);
  const { setDeliveryInfo } = useCart();
  const { showToast } = useToast();

  // Проверка ключа API
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY) {
      console.error("Яндекс.Карты API ключ отсутствует в переменных окружения");
      showToast("Ошибка: Не настроен ключ API Яндекс.Карт", 5000);
    }
  }, [showToast]);

  // Автоподсказка городов через Яндекс.Карты
  const handleCityInput = async (e) => {
    const query = e.target.value;
    setCity(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    if (!apiKey) {
      showToast("Ошибка: Ключ API Яндекс.Карт не настроен", 5000);
      return;
    }

    const url = `https://suggest-maps.yandex.ru/v1/suggest?text=${encodeURIComponent(
      query
    )}&types=locality&lang=ru_RU&apikey=${apiKey}`;
    console.log("Запрос автоподсказки:", url);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ошибка: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Ответ автоподсказки:", JSON.stringify(data, null, 2));
      setSuggestions(data.results || []);
    } catch (error) {
      console.error("Ошибка автоподсказки:", error.message, error.stack);
      showToast(
        "Не удалось загрузить список городов. Проверьте подключение.",
        5000
      );
      setSuggestions([]);
    }
  };

  // Инициализация виджета СДЭК в модальном окне
  useEffect(() => {
    if (showModal && typeof window.CDEKWidget !== "undefined") {
      console.log("Инициализация виджета СДЭК с городом:", city);
      try {
        widgetRef.current = new window.CDEKWidget({
          from: { code: 213 }, // Москва (код города для Москвы)
          root: "cdek-widget",
          servicePath: "/api/cdek",
          apiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "",
          defaultLocation: city || "Москва", // Гарантируем Москву по умолчанию
          choose: true,
          detailed: true,
          showHeader: true,
          goods: [
            {
              weight: 0.25, // Реальный заказ
              length: 25,
              width: 7,
              height: 25,
            },
          ],
          onChoose: (data) => {
            const deliveryData = {
              office: data.address,
              pvzCode: data.code,
              price: data.tariff?.delivery_sum || 0,
              tariff: data.tariff?.tariff_code || "137",
              deliveryPeriod: `${data.tariff?.period_min}-${data.tariff?.period_max} дней`,
            };
            setDeliveryInfo(deliveryData);
            setShowModal(false);
            console.log("Выбран ПВЗ:", JSON.stringify(deliveryData, null, 2));
            showToast("Пункт выдачи выбран: " + data.address, 3000);
          },
          onError: (error) => {
            console.error("Ошибка виджета:", JSON.stringify(error, null, 2));
            showToast(
              "Ошибка в виджете СДЭК: " +
                (error.message || "Неизвестная ошибка"),
              5000
            );
          },
        });

        return () => {
          console.log("Уничтожение виджета СДЭК");
          widgetRef.current?.destroy();
        };
      } catch (error) {
        console.error("Ошибка инициализации виджета СДЭК:", error);
        showToast(
          "Не удалось инициализировать виджет СДЭК: " +
            (error.message || "Неизвестная ошибка"),
          5000
        );
      }
    } else if (showModal) {
      console.error("CDEKWidget не загружен");
      showToast(
        "Ошибка: Виджет СДЭК не загружен. Проверьте подключение скрипта.",
        5000
      );
    }
  }, [showModal, city, setDeliveryInfo, showToast]);

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>Город доставки</label>
      <div className="relative">
        <input
          type="text"
          value={city}
          onChange={handleCityInput}
          className={styles.formInput}
          placeholder="Введите город (например, Москва)"
        />
        {suggestions.length > 0 && (
          <ul
            className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            style={{ top: "100%", marginTop: "4px" }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setCity(suggestion.title.text);
                  setSuggestions([]);
                }}
              >
                {suggestion.title.text}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => setShowModal(true)}
        className={`${styles.payBtn} mt-2`}
        style={{ background: "#333" }}
      >
        Выбрать ПВЗ
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 w-full max-w-3xl mx-4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Выберите пункт выдачи</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div id="cdek-widget" style={{ height: "500px" }} />
          </div>
        </div>
      )}
    </div>
  );
}
