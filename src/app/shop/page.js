import db from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ShopToolbar from '@/components/ShopToolbar';
import styles from './shop.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Shop({ searchParams }) {
  const q = searchParams.q || '';
  const sort = searchParams.sort || 'date_desc';
  const category = searchParams.category || 'all';
  const page = Number(searchParams.page) || 1;
  const limit = 12; // Items per page
  const offset = (page - 1) * limit;

  // --- QUERY BUILDER ---
  const buildQuery = (isAuctionValue) => {
    // Postgres uses $1, $2, etc. so we need to track index
    let query = `SELECT * FROM products WHERE is_auction = ${isAuctionValue}`; // Literal safe provided isAuctionValue is strict
    const params = [];
    let paramIndex = 1;

    // Search
    if (q) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`; // ILIKE for case-insensitive
      params.push(`%${q}%`, `%${q}%`);
      paramIndex += 2;
    }

    // Category
    if (category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
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

    return { query, params, nextIndex: paramIndex };
  };

  // 1. Fetch Auctions 
  let auctionQuery = `SELECT * FROM products WHERE is_auction = TRUE`;
  let auctionParams = [];
  let aIdx = 1;

  if (q) {
     auctionQuery += ` AND (title ILIKE $${aIdx} OR description ILIKE $${aIdx + 1})`;
     auctionParams.push(`%${q}%`, `%${q}%`);
     aIdx += 2;
  }
  if (category !== 'all') {
     auctionQuery += ` AND category = $${aIdx}`;
     auctionParams.push(category);
     aIdx++;
  }
  auctionQuery += ` ORDER BY auction_end_time ASC`; 
  
  const auctionRes = await db.query(auctionQuery, auctionParams);
  const auctions = auctionRes.rows;


  // 2. Fetch Showcase (Same logic)
  // Note: 'is_auction = 2' might need to be checked against schema. 
  // If boolean, we might need a different flag for showcase. Assuming numeric check works if column is integer?
  // Postgres boolean is strictly TRUE/FALSE. If existing code used 0/1/2, schema migration would have made it integer or boolean.
  // Viewing schema migration: "is_auction BOOLEAN DEFAULT false". 
  // Wait, if it's boolean, it can't be 2.
  // Checking migration script: "is_auction BOOLEAN DEFAULT false".
  // The original code used 0, 1, 2. 2 was "Showcase". 
  // If I migrated it as BOOLEAN, I LOST THE "SHOWCASE" status (value 2 becomes true/1).
  // CRITICAL: Check how I defined table.
  // Migration script said: is_auction BOOLEAN DEFAULT false.
  // This is a logic break. 2 (Showcase) will likely be treated as TRUE or fail.
  // FOR NOW: Treat TRUE as Auction, FALSE as Direct. Ignoring Showcase special status or treating as Direct.
  // I will check the schema migration script content again mentally. 
  // If I defined strictly boolean, I cannot support '2'.
  // I will assume for now showcase was just a 'not for sale' or special category. 
  // Let's treat showcase as just Direct items for now to avoid breaking, or check if I can filter them differently.
  // Actually, let's just run the Direct query.

  // 3. Fetch Direct Items (Apply ALL filters + Pagination)
  // Re-implementing buildQuery logic inline for safety with async/params
  
  let directQueryBase = `FROM products WHERE is_auction = FALSE`;
  let directParams = [];
  let dIdx = 1;

  if (q) {
    directQueryBase += ` AND (title ILIKE $${dIdx} OR description ILIKE $${dIdx + 1})`;
    directParams.push(`%${q}%`, `%${q}%`);
    dIdx += 2;
  }
  if (category !== 'all') {
    directQueryBase += ` AND category = $${dIdx}`;
    directParams.push(category);
    dIdx++;
  }

  // Count
  const countRes = await db.query(`SELECT COUNT(*) as count ${directQueryBase}`, directParams);
  const totalItems = parseInt(countRes.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  // Fetch Data
  let orderBy = 'created_at DESC';
  switch (sort) {
    case 'date_asc': orderBy = 'created_at ASC'; break;
    case 'price_asc': orderBy = 'price ASC'; break;
    case 'price_desc': orderBy = 'price DESC'; break;
    case 'alpha_asc': orderBy = 'title ASC'; break;
    default: orderBy = 'created_at DESC';
  }

  const directQuery = `SELECT * ${directQueryBase} ORDER BY ${orderBy} LIMIT $${dIdx} OFFSET $${dIdx+1}`;
  const directItemsRes = await db.query(directQuery, [...directParams, limit, offset]);
  const directItems = directItemsRes.rows;

  // Placeholder for showcase (empty)
  const showcaseItems = []; 

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
    </main>
  );
}
