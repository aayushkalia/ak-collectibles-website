'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, type = 'alert', onConfirm }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {title && <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-deep-green)', fontFamily: 'var(--font-cinzel)' }}>{title}</h3>}
        
        <div style={{ marginBottom: '1.5rem', color: '#555' }}>
          {children}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          {type === 'confirm' || type === 'prompt' ? (
            <>
              <button 
                onClick={onClose}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'var(--color-deep-green)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </>
          ) : (
             <button 
                onClick={onClose}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: 'var(--color-deep-green)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
