import db from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ShopToolbar from '@/components/ShopToolbar';
import styles from './shop.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Shop({ searchParams }) {
  const q = searchParams.q || '';
  const sort = searchParams.sort || 'date_desc';
  const category = searchParams.category || 'all';
  const page = Number(searchParams.page) || 1;
  const limit = 12; // Items per page
  const offset = (page - 1) * limit;

  // --- QUERY BUILDER ---
  const buildQuery = (isAuctionValue) => {
    let query = `SELECT * FROM products WHERE is_auction = ${isAuctionValue}`;
    const params = [];

    // Search
    if (q) {
      query += ` AND (title LIKE ? OR description LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    // Category
    if (category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    // Sort
    let orderBy = 'created_at DESC';
    switch (sort) {
      case 'date_asc': orderBy = 'created_at ASC'; break;
      case 'price_asc': orderBy = 'price ASC'; break;
      case 'price_desc': orderBy = 'price DESC'; break;
      case 'alpha_asc': orderBy = 'title ASC'; break;
      default: orderBy = 'created_at DESC';
    }
    query += ` ORDER BY ${orderBy}`;

    return { query, params };
  };

  // 1. Fetch Auctions (Usually verified separately, but let's apply search to them too if user searches)
  // For auctions, we usually sort by end time, but if user specifically asks for price sort, we honor it.
  // HOWEVER, by default auctions should be by end_time.
  // Let's only filter auctions by SEARCH and CATEGORY. Sort is special for auctions (Time Remaining).
  let auctionQuery = `SELECT * FROM products WHERE is_auction = 1`;
  let auctionParams = [];
  if (q) {
     auctionQuery += ` AND (title LIKE ? OR description LIKE ?)`;
     auctionParams.push(`%${q}%`, `%${q}%`);
  }
  if (category !== 'all') {
     auctionQuery += ` AND category = ?`;
     auctionParams.push(category);
  }
  auctionQuery += ` ORDER BY auction_end_time ASC`; // Always show ending soonest first
  const auctions = db.prepare(auctionQuery).all(...auctionParams);


  // 2. Fetch Showcase (Same logic)
  let showcaseQuery = `SELECT * FROM products WHERE is_auction = 2`;
  let showcaseParams = [];
  if (q) {
     showcaseQuery += ` AND (title LIKE ? OR description LIKE ?)`;
     showcaseParams.push(`%${q}%`, `%${q}%`);
  }
  if (category !== 'all') {
     showcaseQuery += ` AND category = ?`;
     showcaseParams.push(category);
  }
  showcaseQuery += ` ORDER BY created_at DESC`;
  const showcaseItems = db.prepare(showcaseQuery).all(...showcaseParams);


  // 3. Fetch Direct Items (Apply ALL filters + Pagination)
  const directBuilder = buildQuery(0);
  
  // Get Total Count for Pagination
  const countQuery = `SELECT COUNT(*) as count FROM products WHERE is_auction = 0` + 
                     (q ? ` AND (title LIKE ? OR description LIKE ?)` : '') +
                     (category !== 'all' ? ` AND category = ?` : '');
  
  const countParams = [];
  if (q) countParams.push(`%${q}%`, `%${q}%`);
  if (category !== 'all') countParams.push(category);
  
  const totalItems = db.prepare(countQuery).get(...countParams).count;
  const totalPages = Math.ceil(totalItems / limit);

  // Get Paginated Data
  const finalDirectQuery = directBuilder.query + ` LIMIT ? OFFSET ?`;
  const directItems = db.prepare(finalDirectQuery).all(...directBuilder.params, limit, offset);

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>The Collection</h1>
        <p className={styles.heroSubtitle}>
          Explore our curated selection of rare coins, stamps, and antique treasures.
        </p>
      </header>

      {/* Toolbar */}
      <ShopToolbar />

      {/* Auctions Section */}
      {auctions.length > 0 && (
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '2rem', 
            color: 'var(--color-deep-green)',
            borderLeft: '5px solid var(--color-gold)',
            paddingLeft: '1rem'
          }}>
            Live Auctions {q && `(Matches for "${q}")`}
          </h2>
          <div className={styles.grid}>
            {auctions.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Direct Buy Section */}
      <section style={{ marginBottom: '5rem' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '2rem', 
          color: 'var(--color-deep-green)',
          borderLeft: '5px solid var(--color-deep-green)',
          paddingLeft: '1rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          Direct Collection
          <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>
            {totalItems} items found
          </span>
        </h2>
        
        {directItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                <h3>No products found matching your criteria.</h3>
                <Link href="/shop" style={{ color: 'var(--color-deep-green)', textDecoration: 'underline' }}>Clear Filters</Link>
            </div>
        ) : (
            <>
                <div className={styles.grid}>
                {directItems.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <Link 
                                key={p} 
                                href={{
                                    pathname: '/shop',
                                    query: { ...searchParams, page: p }
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '1px solid var(--color-deep-green)',
                                    backgroundColor: p === page ? 'var(--color-deep-green)' : 'transparent',
                                    color: p === page ? 'white' : 'var(--color-deep-green)',
                                    borderRadius: '4px',
                                    textDecoration: 'none'
                                }}
                            >
                                {p}
                            </Link>
                        ))}
                    </div>
                )}
            </>
        )}
      </section>

      {/* Showcase Section */}
      {showcaseItems.length > 0 && (
        <section>
          <div style={{ backgroundColor: '#f5f5f5', padding: '3rem', borderRadius: '12px' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              marginBottom: '1rem', 
              color: '#555',
              textAlign: 'center',
              fontFamily: 'var(--font-cinzel)'
            }}>
              Museum Collection
            </h2>
            <div className={styles.grid}>
              {showcaseItems.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
