import db from '@/lib/db';
import Link from 'next/link';
import styles from './product.module.css';
import ProductActions from '@/components/ProductActions';
import ProductGallery from '@/components/ProductGallery';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }) {
  const productRes = await db.query('SELECT * FROM products WHERE id = $1', [params.id]);
  const product = productRes.rows[0];

  if (!product) {
    return (
      <main className={styles.container} style={{ textAlign: 'center' }}>
        <h1>Product Not Found</h1>
        <Link href="/shop" className={styles.backLink}>← Back to Shop</Link>
      </main>
    );
  }

  // Handle boolean conversion if needed (Postgres driver usually returns boolean for boolean type)
  const isAuction = product.is_auction === true; 

  // Fetch additional media
  const mediaRes = await db.query('SELECT * FROM product_media WHERE product_id = $1', [params.id]);
  const mediaItems = mediaRes.rows;
  const allMedia = mediaItems.length > 0 
    ? mediaItems 
    : [{ type: 'image', url: product.image_url }];

  // Fetch highest bidder (if auction)
  let highestBidderId = null;
  if (isAuction) {
     const lastBidRes = await db.query("SELECT user_id FROM bids WHERE product_id = $1 AND status = 'valid' ORDER BY amount DESC LIMIT 1", [params.id]);
     const lastBid = lastBidRes.rows[0];
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
                ₹{Number(product.price).toFixed(2)}
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
