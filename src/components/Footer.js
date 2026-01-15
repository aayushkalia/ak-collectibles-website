'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [settings, setSettings] = useState({ 
    whatsapp_number: '9876543210', 
    qr_code_url: '',
    email: 'contact@kalia-numismatics.com'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
            setSettings(prev => ({
                whatsapp_number: data.whatsapp_number || prev.whatsapp_number,
                qr_code_url: data.qr_code_url || '',
                email: data.email || prev.email
            }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer style={{ backgroundColor: '#1a472a', color: 'white', padding: '3rem 1rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        
        {/* Brand */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', marginBottom: '1rem', color: '#ffd700' }}>AK COLLECTIBLES</h2>
          <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.6' }}>
            Preserving history through timeless collectibles. We specialize in rare coins, stamps, and notes with guaranteed authenticity.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#ffd700' }}>Explore</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}><Link href="/shop" style={{ color: '#fff', textDecoration: 'none', opacity: 0.9 }}>Shop Collection</Link></li>
            <li style={{ marginBottom: '0.5rem' }}><Link href="/auctions" style={{ color: '#fff', textDecoration: 'none', opacity: 0.9 }}>Live Auctions</Link></li>
            <li style={{ marginBottom: '0.5rem' }}><Link href="/about" style={{ color: '#fff', textDecoration: 'none', opacity: 0.9 }}>About Us</Link></li>
          </ul>
        </div>

        {/* Contact & QR */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#ffd700' }}>Contact Us</h3>
          
          <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📞</span>
            <a href={`https://wa.me/91${settings.whatsapp_number}`} target="_blank" style={{ color: '#fff', textDecoration: 'none' }}>
              +91 {settings.whatsapp_number} (WhatsApp)
            </a>
          </div>
          
          <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📧</span>
            <a href={`mailto:${settings.email}`} style={{ color: '#fff', textDecoration: 'none' }}>
              {settings.email}
            </a>
          </div>

          <div style={{ marginTop: '1rem', backgroundColor: 'white', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
            {/* Dynamic QR Code */}
             <div style={{ width: '100px', height: '100px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '0.7rem', textAlign: 'center', overflow: 'hidden' }}>
                {settings.qr_code_url ? (
                    <img src={settings.qr_code_url} alt="Scan QR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span>UPI QR Code</span>
                )}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#333', marginTop: '4px', textAlign: 'center', fontWeight: 'bold' }}>Scan to Pay</div>
          </div>

        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: '#aaa' }}>
        © {new Date().getFullYear()} AK COLLECTIBLES. All rights reserved.
      </div>
    </footer>
  );
}
