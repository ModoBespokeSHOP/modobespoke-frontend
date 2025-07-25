import { useEffect } from "react";

const CDEKWIDGET = () => {
  useEffect(() => {
    if (typeof window.CDEKWidget === "undefined") {
      console.error("CDEKWidget не загружен");
      return;
    }

    console.log(
      "Инициализация CDEK Widget с ключом:",
      process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY
    );
    const widget = new window.CDEKWidget({
      from: "Москва",
      root: "cdek-widget",
      servicePath: "/api/cdek",
      apiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
      defaultLocation: [55.7558, 37.6173],
      choose: true,
      detailed: true,
      showHeader: true,
      goods: [
        {
          weight: 1,
          length: 10,
          width: 10,
          height: 10,
        },
      ],
      cityFrom: 44,
      city: 44,
      hideFilters: false,
      hideDeliveryOptions: false,
      onError: (error) => {
        console.error("Ошибка виджета CDEK:", error);
      },
      onReady: () => {
        console.log("Виджет CDEK готов");
      },
      onChoose: (data) => {
        console.log("Выбран ПВЗ или доставка:", data);
      },
    });

    return () => {
      console.log("Уничтожение виджета CDEK");
      widget?.destroy();
    };
  }, []);

  return <div id="cdek-widget" style={{ height: "500px", width: "100%" }} />;
};

export default CDEKWIDGET;
