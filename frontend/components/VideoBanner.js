import styles from "./VideoBanner.module.css";

export default function VideoBanner({
  bottomMargin = "var(--section-offset)",
  sloganText = "Удобная женственность с духом авантюризма",
}) {
  return (
    <div
      className={styles.videoBannerWrapper}
      style={{ marginBottom: bottomMargin }}
    >
      <video
        className={styles.videoBannerVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/banner.mp4" type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>
      <div className={styles.overlay} />
      <div className={styles.slogan} aria-label={`Слоган: ${sloganText}`}>
        {sloganText} {/* без toUpperCase() */}
      </div>
    </div>
  );
}
