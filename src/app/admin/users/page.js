import db from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch users (excluding password)
  const usersRes = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  const users = usersRes.rows;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-deep-green)' }}>User Management</h1>
        <div style={{ backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            Total Users: <strong>{users.length}</strong>
        </div>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem', color: '#888' }}>{user.id}</td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{user.name || 'N/A'}</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                    <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor: user.role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                        color: user.role === 'admin' ? '#1976d2' : '#616161'
                    }}>
                        {user.role}
                    </span>
                </td>
                <td style={{ padding: '1rem', color: '#666' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
