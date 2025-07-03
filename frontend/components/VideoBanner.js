import styles from "./VideoBanner.module.css";

/**
 * VideoBanner component
 * @param {{ bottomMargin?: string, sloganText?: string }} props
 * @param bottomMargin - CSS value for margin-bottom of the video section (e.g., '2rem', '50px')
 * @param sloganText - Text to display over the video
 */
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
        {sloganText.toUpperCase()}
      </div>
    </div>
  );
}
