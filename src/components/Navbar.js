'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav style={{ 
      padding: '1rem', 
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#FDFDF8',
      position: 'relative'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Brand */}
        <Link href="/" style={{ 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-cinzel)', 
          color: 'var(--color-deep-green)', 
          fontWeight: 'bold',
          whiteSpace: 'nowrap' // Prevent wrapping
        }}>
          AK COLLECTIBLES
        </Link>
        
        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none', // Hidden by default, shown via CSS query below
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--color-deep-green)'
          }}
          className="hamburger-btn"
        >
          ☰
        </button>

        {/* Desktop Links */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/shop" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Shop</Link>
          <Link href="/auctions" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Auctions</Link>
          
          {session?.user?.role === 'admin' && (
            <Link href="/admin" style={{ color: '#d32f2f', fontWeight: 'bold', textDecoration: 'none' }}>Admin</Link>
          )}

          <Link href="/cart" style={{ color: 'var(--color-text)', position: 'relative', textDecoration: 'none' }}>
            Cart
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-12px',
                backgroundColor: 'var(--color-gold)',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.7rem'
              }}>
                {cart.length}
              </span>
            )}
          </Link>

          {session ? (
            <>
              <Link href="/profile" style={{ color: 'var(--color-deep-green)', fontWeight: '500', textDecoration: 'none' }}>My Profile</Link>
              <button 
                onClick={() => signOut()}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-deep-green)',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none'
            }}>
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#FDFDF8',
          borderBottom: '1px solid #e0e0e0',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <Link href="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link href="/auctions" onClick={() => setIsMenuOpen(false)}>Auctions</Link>
          {session?.user?.role === 'admin' && (
            <Link href="/admin" onClick={() => setIsMenuOpen(false)} style={{ color: '#d32f2f' }}>Admin</Link>
          )}
          <Link href="/cart" onClick={() => setIsMenuOpen(false)}>Cart ({cart.length})</Link>
          {session ? (
             <>
               <Link href="/profile" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
               <button onClick={() => { signOut(); setIsMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '1rem' }}>Sign Out</button>
             </>
          ) : (
             <Link href="/login" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--color-deep-green)', fontWeight: 'bold' }}>Login</Link>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
