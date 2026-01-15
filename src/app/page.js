import db from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import styles from './shop/shop.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const auctionsRes = await db.query('SELECT * FROM products WHERE is_auction = TRUE ORDER BY auction_end_time ASC LIMIT 4');
  const auctions = auctionsRes.rows;

  const newArrivalsRes = await db.query('SELECT * FROM products WHERE is_auction = FALSE ORDER BY created_at DESC LIMIT 4');
  const newArrivals = newArrivalsRes.rows;

  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>AK COLLECTIBLES</h1>
        <p className={styles.heroSubtitle}>
          Curators of fine antique coins, stamps, and collectibles.
        </p>
        <Link href="/shop" className={styles.heroButton}>
          Browse Full Collection
        </Link>
      </section>

      {/* Featured Auctions */}
      {auctions.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', borderBottom: '3px solid var(--color-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
              Live Auctions
            </h2>
            <Link href="/shop" style={{ color: 'var(--color-deep-green)', fontWeight: 'bold' }}>View All →</Link>
          </div>
          <div className={styles.grid}>
            {auctions.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', borderBottom: '3px solid var(--color-deep-green)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            New Arrivals
          </h2>
          <Link href="/shop" style={{ color: 'var(--color-deep-green)', fontWeight: 'bold' }}>View All →</Link>
        </div>
        <div className={styles.grid}>
          {newArrivals.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
