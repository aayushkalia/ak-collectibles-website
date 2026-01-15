'use client';

import { useState } from 'react';
import styles from '../app/shop/[id]/product.module.css';

export default function ProductGallery({ items, title }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const currentItem = items[selectedIndex];

  return (
    <div className={styles.galleryContainer}>
      {/* Main Stage */}
      <div className={styles.mainStage}>
        {currentItem.type === 'video' ? (
          <video 
            src={currentItem.url} 
            controls 
            className={styles.mainMedia}
          />
        ) : (
          <img 
            src={currentItem.url} 
            alt={title} 
            className={styles.mainMedia}
          />
        )}
      </div>

      {/* Thumbnail Strip */}
      {items.length > 1 && (
        <div className={styles.thumbnailStrip}>
          {items.map((item, index) => (
            <button 
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`${styles.thumbnailButton} ${index === selectedIndex ? styles.activeThumbnail : ''}`}
            >
              {item.type === 'video' ? (
                <div className={styles.videoThumbnail}>
                  ▶
                </div>
              ) : (
                <img 
                  src={item.url} 
                  alt={`View ${index + 1}`} 
                  className={styles.thumbnailImage}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
