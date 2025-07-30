import { useEffect } from "react";

const CDEKWIDGET = ({ setDelivery }) => {
  useEffect(() => {
    if (typeof window.CDEKWidget === "undefined") {
      console.error(
        "CDEKWidget не загружен. Убедитесь, что скрипт подключён в App.js."
      );
      alert("Ошибка: CDEKWidget не загружен. Проверьте подключение скрипта.");
      return;
    }

    try {
      console.log("Инициализация виджета CDEK...");
      const widget = new window.CDEKWidget({
        from: { code: 270 },
        root: "cdek-widget",
        servicePath: "/api/cdek",
        apiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "",
        defaultLocation: "Kostroma",
        choose: true,
        detailed: true,
        showHeader: true,
        goods: [
          {
            weight: 0.25,
            length: 25,
            width: 7,
            height: 25,
          },
        ],
        onChoose: (data) => {
          console.log("Тип данных в onChoose:", typeof data);
          console.log(
            "Полные данные ПВЗ из виджета:",
            JSON.stringify(data, null, 2)
          );
          if (typeof data === "string") {
            console.error("Ошибка: данные — строка, ожидался объект");
          } else {
            setDelivery({
              office: data.address || "Адрес не указан",
              price: data.delivery_sum || 0,
              method: data.method || "Неизвестный метод",
            });
          }
        },
        onError: (error) => {
          console.error("Ошибка виджета CDEK:", JSON.stringify(error, null, 2));
          alert(
            "Ошибка в виджете CDEK: " + (error.message || "Неизвестная ошибка")
          );
        },
        onReady: () => {
          console.log("Виджет CDEK успешно инициализирован");
        },
      });

      const observer = new MutationObserver((mutations) => {
        const addressElement = document.querySelector(".cdek-fsvu2f");
        const deliveryOptions = document.querySelectorAll(
          ".cdek-pog16f.cdek-18beit"
        );
        let selectedPrice = 0;
        let selectedMethod = "Неизвестный метод";
        let selectedAddress = addressElement
          ? addressElement.textContent.trim()
          : "Адрес не указан";

        deliveryOptions.forEach((option) => {
          const bgColor = getComputedStyle(option).backgroundColor;
          // Проверяем, является ли background-color выбранным (rgba(26,178,72,...) с любой прозрачностью)
          if (bgColor.includes("26, 178, 72")) {
            const methodElement = option.querySelector("p[data-v-cddb6908]");
            const priceElement = option.querySelector(
              ".cdek-psbor4 div[data-v-cddb6908]:last-child"
            );

            selectedMethod = methodElement
              ? methodElement.textContent.trim()
              : "Неизвестный метод";
            const priceText = priceElement
              ? priceElement.textContent.trim()
              : "0 RUB";
            const priceMatch = priceText.match(/\d+(\.\d+)?/);
            selectedPrice = priceMatch ? parseFloat(priceMatch[0]) : 0;
          }
        });

        console.log("Извлечено из DOM:", {
          address: selectedAddress,
          method: selectedMethod,
          price: selectedPrice,
        });

        setDelivery({
          office: selectedAddress,
          price: selectedPrice,
          method: selectedMethod,
        });
      });

      const widgetContainer = document.getElementById("cdek-widget");
      if (widgetContainer) {
        observer.observe(widgetContainer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style", "class"],
          characterData: true,
        });
      } else {
        console.error("Контейнер cdek-widget не найден в DOM");
      }

      return () => {
        console.log("Размонтирование виджета CDEK");
        observer.disconnect();
        widget?.destroy();
      };
    } catch (error) {
      console.error("Ошибка инициализации виджета CDEK:", {
        message: error.message,
        stack: error.stack,
        details: error.details || "Нет дополнительных деталей",
      });
      alert(
        "Не удалось инициализировать виджет: " +
          (error.message || "Неизвестная ошибка")
      );
    }
  }, [setDelivery]);

  return (
    <div
      id="cdek-widget"
      style={{ height: "500px", border: "1px solid #ccc" }}
    />
  );
};

export default CDEKWIDGET;
