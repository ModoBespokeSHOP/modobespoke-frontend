import { useEffect } from "react";

const CDEKWIDGET = () => {
  useEffect(() => {
    // Проверяем, что скрипт CDEK загружен
    if (typeof window.CDEKWidget === "undefined") {
      console.error(
        "CDEKWidget не загружен. Убедитесь, что скрипт подключён в App.js."
      );
      alert("Ошибка: CDEKWidget не загружен. Проверьте подключение скрипта.");
      return;
    }

    try {
      // Инициализация виджета
      const widget = new window.CDEKWidget({
        from: { code: 270 }, // Код города отправления (Кострома)
        root: "cdek-widget", // ID HTML-элемента для виджета
        servicePath: "/api/cdek", // Путь к API-роуту
        apiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "", // Ключ Яндекс.Карт
        defaultLocation: "Кострома", // Начальная локация на карте
        choose: true, // Разрешить выбор ПВЗ
        detailed: true, // Показывать подробную информацию
        showHeader: true, // Показывать заголовок виджета
        goods: [
          {
            weight: 0.25, // Вес в кг (реальный заказ)
            length: 25, // Длина в см
            width: 7, // Ширина в см
            height: 25, // Высота в см
          },
        ], // Описание посылки
        onChoose: (data) => {
          console.log("Выбран ПВЗ:", JSON.stringify(data, null, 2));
          alert("ПВЗ выбран: " + JSON.stringify(data));
        },
        onError: (error) => {
          console.error("Ошибка виджета:", JSON.stringify(error, null, 2));
          alert(
            "Ошибка в виджете СДЭК: " + (error.message || "Неизвестная ошибка")
          );
        },
      });

      // Очистка при размонтировании компонента
      return () => {
        widget?.destroy();
      };
    } catch (error) {
      console.error("Ошибка при инициализации виджета СДЭК:", {
        message: error.message,
        stack: error.stack,
        details: error.details || "Нет дополнительных деталей",
      });
      alert(
        "Не удалось инициализировать виджет: " +
          (error.message || "Неизвестная ошибка")
      );
    }
  }, []);

  return <div id="cdek-widget" style={{ height: "500px" }} />;
};

export default CDEKWIDGET;
