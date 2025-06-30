// components/VideoBanner.js
import styles from "./VideoBanner.module.css";

export default function VideoBanner() {
  return (
    <div className={styles.videoBannerWrapper}>
      <video
        className={styles.videoBannerVideo}
        src="/videos/banner.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
}
