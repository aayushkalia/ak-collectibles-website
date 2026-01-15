import Link from 'next/link';
import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  // Analytics Queries
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  
  const revenueResult = db.prepare("SELECT SUM(total_amount) as revenue FROM orders WHERE status != 'cancelled'").get();
  const totalRevenue = revenueResult ? revenueResult.revenue || 0 : 0;

  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const usersCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
  
  const soldCount = products.filter(p => p.status === 'sold').length;
  const totalProducts = products.length;


  // Stat Card Component
  const StatCard = ({ title, value, color, icon }) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `5px solid ${color}` }}>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.8rem', color: '#333', marginTop: 0 }}>{value}</h3>
    </div>
  );

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-deep-green)' }}>Admin Dashboard</h1>
        
        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/admin/users" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#555', color: 'white', fontWeight: 'bold', borderRadius: '4px', textDecoration: 'none' }}>
            Users
          </Link>
          <Link href="/admin/orders" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-deep-green)', color: 'white', fontWeight: 'bold', borderRadius: '4px', textDecoration: 'none' }}>
            Orders
          </Link>
          <Link href="/admin/products/new" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-gold)', color: 'var(--color-deep-green)', fontWeight: 'bold', borderRadius: '4px', textDecoration: 'none' }}>
            + Add Product
          </Link>
          <Link href="/admin/settings" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#333', color: 'white', fontWeight: 'bold', borderRadius: '4px', textDecoration: 'none' }}>
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="var(--color-deep-green)" />
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
                <td style={{ padding: '1rem' }}>₹{p.price.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  {p.is_auction === 1 ? (
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
                    {p.is_auction === 1 && (
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
