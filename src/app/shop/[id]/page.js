import db from '@/lib/db';
import Link from 'next/link';
import styles from './product.module.css';
import ProductActions from '@/components/ProductActions';
import ProductGallery from '@/components/ProductGallery';

export const dynamic = 'force-dynamic';

export default function ProductPage({ params }) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(params.id);

  if (!product) {
    return (
      <main className={styles.container} style={{ textAlign: 'center' }}>
        <h1>Product Not Found</h1>
        <Link href="/shop" className={styles.backLink}>← Back to Shop</Link>
      </main>
    );
  }

  const isAuction = product.is_auction === 1;

  // Fetch additional media
  const mediaItems = db.prepare('SELECT * FROM product_media WHERE product_id = ?').all(params.id);
  const allMedia = mediaItems.length > 0 
    ? mediaItems 
    : [{ type: 'image', url: product.image_url }];

  // Fetch highest bidder (if auction)
  let highestBidderId = null;
  if (isAuction) {
     const lastBid = db.prepare("SELECT user_id FROM bids WHERE product_id = ? AND status = 'valid' ORDER BY amount DESC LIMIT 1").get(params.id);
     if (lastBid) {
       highestBidderId = lastBid.user_id;
     }
  }

  return (
    <main className={styles.container}>
      {/* Back Link */}
      <Link href="/shop" className={styles.backLink}>
        ← Back to Collection
      </Link>

      <div className={styles.productLayout}>
        {/* Media Gallery */}
        <div className={styles.gallery}>
           <ProductGallery items={allMedia} title={product.title} />
        </div>

        {/* Details Section */}
        <div className={styles.info}>
          <span className={styles.category}>
            {product.category}
          </span>
          
          <h1 className={styles.title}>{product.title}</h1>
          <p className={styles.description}>
            {product.description}
          </p>

          <div className={styles.purchaseCard}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className={styles.priceLabel}>
                {isAuction ? 'Current Highest Bid' : 'Price'}
              </p>
              <p className={styles.price}>
                ₹{product.price.toFixed(2)}
              </p>
            </div>

            <ProductActions product={product} highestBidderId={highestBidderId} />
            
            <div className={styles.securityBadges}>
              <span>Secure Payment</span>
              <span>•</span>
              <span>Verified Authenticity</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
