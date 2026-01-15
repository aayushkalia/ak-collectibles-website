'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    upi_id: '',
    whatsapp_number: '',
    instructions: '',
    qr_code_url: '',
    email: ''
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setFormData({
            upi_id: data.upi_id || '',
            whatsapp_number: data.whatsapp_number || '',
            instructions: data.instructions || '',
            qr_code_url: data.qr_code_url || '',
            email: data.email || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load settings', 'error');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast('Settings updated successfully!');
        router.refresh();
      } else {
        showToast('Failed to update settings', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-deep-green)' }}>Payment Settings</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
        
        <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '4px', textAlign: 'center', marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Payment QR Code</label>
          
          {formData.qr_code_url ? (
            <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
               <img src={formData.qr_code_url} alt="QR Code" style={{ width: '150px', height: '150px', objectFit: 'contain' }} />
               <button 
                 type="button" 
                 onClick={() => setFormData(p => ({ ...p, qr_code_url: '' }))}
                 style={{ 
                    position: 'absolute', top: -10, right: -10, background: 'red', color: 'white', 
                    borderRadius: '50%', width: '25px', height: '25px', border: 'none', cursor: 'pointer' 
                 }}
               >×</button>
            </div>
          ) : (
             <div style={{ width: '150px', height: '150px', background: '#f5f5f5', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                No QR Code
             </div>
          )}

          <input 
            type="file" 
            accept="image/*" 
            onChange={async (e) => {
               const file = e.target.files[0];
               if (!file) return;
               
               const data = new FormData();
               data.append('file', file);
               
               try {
                 showToast('Uploading QR Code...');
                 const res = await fetch('/api/upload', { method: 'POST', body: data });
                 const result = await res.json();
                 if (result.success) {
                    setFormData(prev => ({ ...prev, qr_code_url: result.url }));
                    showToast('QR Code uploaded!');
                 } else {
                    showToast('Upload failed', 'error');
                 }
               } catch (err) {
                 console.error(err);
                 showToast('Upload error', 'error');
               }
            }}
            style={{ display: 'block', margin: '0 auto' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>UPI ID</label>
          <input 
            type="text" 
            name="upi_id" 
            value={formData.upi_id} 
            onChange={handleChange}
            placeholder="e.g. yourname@upi"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Used for payment instructions.</p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>WhatsApp Number</label>
          <input 
            type="text" 
            name="whatsapp_number" 
            value={formData.whatsapp_number} 
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>For customers to send payment screenshots.</p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Contact Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            placeholder="e.g. contact@example.com"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Displayed in the Footer as the support email.</p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Payment Instructions</label>
          <textarea 
            name="instructions" 
            rows="4"
            value={formData.instructions} 
            onChange={handleChange}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={saving}
          style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--color-deep-green)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '1.1rem', 
            fontWeight: 'bold',
            marginTop: '1rem',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </main>
  );
}
