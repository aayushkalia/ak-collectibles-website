import Link from 'next/link';
import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const period = searchParams?.period || 'all';
  let dateClause = "";
  let queryParams = [];

  if (period === 'today') {
    dateClause = "AND created_at >= CURRENT_DATE";
  } else if (period === '7d') {
    dateClause = "AND created_at >= NOW() - INTERVAL '7 days'";
  } else if (period === '30d') {
    dateClause = "AND created_at >= NOW() - INTERVAL '30 days'";
  }

  // Analytics Queries
  const productsRes = await db.query('SELECT * FROM products ORDER BY created_at DESC');
  const products = productsRes.rows;
  
  // Safe interpolation for clause since it's static strings based on limited enum input
  const revenueRes = await db.query(`SELECT SUM(total_amount) as revenue FROM orders WHERE status != 'cancelled' ${dateClause}`);
  const totalRevenue = revenueRes.rows[0].revenue ? Number(revenueRes.rows[0].revenue) : 0;

  const ordersCountRes = await db.query('SELECT COUNT(*) as count FROM orders');
  const ordersCount = ordersCountRes.rows[0].count;

  const usersCountRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
  const usersCount = usersCountRes.rows[0].count;
  
  const soldCount = products.filter(p => p.status === 'sold').length;
  const totalProducts = products.length;


  // Stat Card Component
  const StatCard = ({ title, value, color, icon, extra }) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `5px solid ${color}`, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</p>
                <h3 style={{ fontSize: '1.8rem', color: '#333', marginTop: 0 }}>{value}</h3>
            </div>
            {extra && <div>{extra}</div>}
        </div>
    </div>
  );

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ color: 'var(--color-deep-green)', margin: 0 }}>Admin Dashboard</h1>
        
        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/admin/users" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#555', color: 'white', fontWeight: 'bold', borderRadius: '4px', textDecoration: 'none', flex: '1 0 auto', textAlign: 'center' }}>
            Users
          </Link>
          <Link href="/admin/orders" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-deep-green)', color: 'white', fontWeight: 'bold', borderRadius: '4px', textDecoration: 'none', flex: '1 0 auto', textAlign: 'center' }}>
            Orders
          </Link>
          <Link href="/admin/products/new" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-gold)', color: 'var(--color-deep-green)', fontWeight: 'bold', borderRadius: '4px', textDecoration: 'none', flex: '1 0 auto', textAlign: 'center' }}>
            + Add Product
          </Link>
          <Link href="/admin/settings" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#333', color: 'white', fontWeight: 'bold', borderRadius: '4px', textDecoration: 'none', flex: '1 0 auto', textAlign: 'center' }}>
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
            title={`Total Revenue (${period === 'all' ? 'All Time' : period})`} 
            value={`₹${totalRevenue.toLocaleString()}`} 
            color="var(--color-deep-green)" 
            extra={
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <Link href="/admin?period=today" style={{ textDecoration: period === 'today' ? 'underline' : 'none', fontWeight: period === 'today' ? 'bold' : 'normal' }}>Today</Link>
                    <Link href="/admin?period=7d" style={{ textDecoration: period === '7d' ? 'underline' : 'none', fontWeight: period === '7d' ? 'bold' : 'normal' }}>7d</Link>
                    <Link href="/admin?period=30d" style={{ textDecoration: period === '30d' ? 'underline' : 'none', fontWeight: period === '30d' ? 'bold' : 'normal' }}>30d</Link>
                    <Link href="/admin" style={{ textDecoration: period === 'all' ? 'underline' : 'none', fontWeight: period === 'all' ? 'bold' : 'normal' }}>All</Link>
                </div>
            }
        />
        <StatCard title="Total Orders" value={ordersCount} color="var(--color-gold)" />
        <StatCard title="Registered Users" value={usersCount} color="#1976d2" />
        <StatCard title="Inventory" value={`${soldCount} Sold / ${totalProducts}`} color="#d32f2f" />
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#333', margin: 0 }}>Product Inventory</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem', color: '#888' }}>#{p.id}</td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{p.title}</td>
                <td style={{ padding: '1rem' }}>{p.category}</td>
                <td style={{ padding: '1rem' }}>₹{Number(p.price).toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  {p.is_auction === true ? (
                    <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Auction</span>
                  ) : (
                    <span style={{ color: 'green' }}>Direct Buy</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                   {p.status === 'sold' ? <span style={{ color: 'red', fontWeight: 'bold' }}>SOLD</span> : <span style={{ color: 'green' }}>Available</span>}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/admin/products/${p.id}/edit`} style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '4px', 
                      color: '#333', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      Edit
                    </Link>
                    {p.is_auction === true && (
                      <Link href={`/admin/products/${p.id}/bids`} style={{ 
                        padding: '0.25rem 0.75rem', 
                        backgroundColor: '#e8f5e9', 
                        border: '1px solid #1a472a',
                        borderRadius: '4px', 
                        color: '#1a472a', 
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        Bids
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
