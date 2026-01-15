'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Coins',
    media: [], // Array of { url, type }
    is_auction: false,
    selling_mode: '0',
    auction_end_time: '',
    stock: 1
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    const newMedia = [];

    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: data });
        const result = await res.json();
        if (result.success) {
          const type = file.type.startsWith('video/') ? 'video' : 'image';
          newMedia.push({ url: result.url, type });
        }
      } catch (err) {
        console.error('Upload failed for', file.name, err);
      }
    }

    setFormData(prev => ({ ...prev, media: [...prev.media, ...newMedia] }));
    setLoading(false);
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...formData,
           is_auction: formData.selling_mode === '2' ? 2 : (formData.is_auction ? 1 : 0)
        })
      });

      if (res.ok) {
        router.push('/shop'); 
        router.refresh();
      } else {
        alert('Failed to create product');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-deep-green)' }}>Add New Product</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
          <input 
            type="text" 
            name="title" 
            required 
            value={formData.title} 
            onChange={handleChange}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
          <textarea 
            name="description" 
            required 
            rows="4"
            value={formData.description} 
            onChange={handleChange}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Price (₹)</label>
            <input 
              type="number" 
              name="price" 
              required 
              min="0"
              step="0.01"
              value={formData.price} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Shipping Cost (₹)</label>
            <input 
              type="number" 
              name="shipping_cost" 
              min="0"
              step="0.01"
              value={formData.shipping_cost || ''} 
              onChange={handleChange}
              placeholder="0 (Free Shipping)"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Stock Quantity</label>
            <input 
              type="number" 
              name="stock" 
              min="1"
              step="1"
              required
              value={formData.stock || 1} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Max Limit (Per User)</label>
            <input 
              type="number" 
              name="max_per_user" 
              min="1"
              step="1"
              placeholder="Default: Unlimited"
              value={formData.max_per_user || ''} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Coins">Coins</option>
              <option value="Stamps">Stamps</option>
              <option value="Notes">Notes</option>
              <option value="Artifacts">Artifacts</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Product Media (Images/Videos)</label>
          <input 
            type="file" 
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            style={{ marginBottom: '1rem' }}
          />
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {formData.media.map((item, index) => (
              <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                {item.type === 'video' ? (
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                  <img src={item.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <button 
                  type="button"
                  onClick={() => removeMedia(index)}
                  style={{ 
                    position: 'absolute', top: -5, right: -5, 
                    backgroundColor: 'red', color: 'white', 
                    borderRadius: '50%', width: '20px', height: '20px', 
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Selling Mode</label>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="radio" 
                name="is_auction" 
                checked={!formData.is_auction && formData.selling_mode !== '2'} // Logic adjust needed
                onChange={() => setFormData(p => ({...p, is_auction: false, selling_mode: '0'}))}
              /> Direct Buy
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="radio" 
                name="is_auction" 
                checked={formData.is_auction} 
                onChange={() => setFormData(p => ({...p, is_auction: true, selling_mode: '1'}))}
              /> Auction
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--color-deep-green)' }}>
              <input 
                type="radio" 
                name="selling_mode" 
                checked={formData.selling_mode === '2'} 
                onChange={() => setFormData(p => ({...p, is_auction: false, selling_mode: '2'}))}
              /> Showcase Only
            </label>
          </div>

          {formData.is_auction && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#d32f2f' }}>Auction End Time</label>
              <input 
                type="datetime-local" 
                name="auction_end_time" 
                required={formData.is_auction}
                value={formData.auction_end_time} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--color-deep-green)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '1.1rem', 
            fontWeight: 'bold',
            marginTop: '1rem',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Processing...' : 'Create Product'}
        </button>
      </form>
    </main>
  );
}
