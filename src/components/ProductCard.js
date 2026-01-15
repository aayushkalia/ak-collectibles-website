import Link from 'next/link';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const isAuction = product.is_auction === 1;
  
  return (
    <Link href={`/shop/${product.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {isAuction && <span className={styles.badge}>AUCTION</span>}
        {product.is_auction === 2 && <span className={styles.badge} style={{ backgroundColor: '#757575' }}>SHOWCASE</span>}
        <img 
          src={product.image_url} 
          alt={product.title} 
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.category}>{product.category}</div>
        <h3 className={styles.title}>
          {product.title}
        </h3>
        <div className={styles.price}>
          ₹{product.price.toFixed(2)}
        </div>
        
        <span className={`${styles.button} ${isAuction ? styles.auctionButton : ''}`}>
          {isAuction ? 'Place Bid' : (product.is_auction === 2 ? 'View Item' : 'View Details')}
        </span>
      </div>
    </Link>
  );
}
