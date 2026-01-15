import db from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import styles from '../shop/shop.module.css';

export const dynamic = 'force-dynamic';

export default function AuctionsPage() {
  const auctions = db.prepare('SELECT * FROM products WHERE is_auction = 1 ORDER BY auction_end_time ASC').all();

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Live Auctions</h1>
        <p className={styles.heroSubtitle}>
          Bid on exclusive numismatic rarities. Secure your piece of history before the hammer falls.
        </p>
      </header>

      {auctions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#666' }}>No active auctions at the moment.</p>
          <p>Check back soon or browse our <Link href="/shop" style={{ color: 'var(--color-deep-green)', fontWeight: 'bold' }}>Direct Collection</Link>.</p>
        </div>
      ) : (
        <section>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '2rem', 
            color: 'var(--color-deep-green)',
            borderLeft: '5px solid var(--color-gold)',
            paddingLeft: '1rem'
          }}>
            Current Lots
          </h2>
          <div className={styles.grid}>
            {auctions.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
