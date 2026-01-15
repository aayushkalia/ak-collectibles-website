'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    shipping_cost: '', // Added
    stock: 1, // Added
    max_per_user: '', // Added
    category: 'Coins',
    media: [], 
    is_auction: false,
    selling_mode: '0',
    auction_end_time: ''
  });

  useEffect(() => {
    console.log('Fetching product:', params.id);
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.message || data.error) {
          showToast(data.message || data.error, 'error');
          router.push('/admin');
          return;
        }
        
        // Ensure media is a valid array
        let safeMedia = data.media || [];
        if (!Array.isArray(safeMedia)) safeMedia = [];
        // Filter out empty URL placeholders
        safeMedia = safeMedia.filter(m => m.url && m.url !== '' && m.url !== 'null');

        console.log('Loaded media:', safeMedia);

        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          shipping_cost: data.shipping_cost || '', // Populate
          stock: data.stock !== null ? data.stock : 1, // Populate
          max_per_user: data.max_per_user || '', // Populate
          category: data.category,
          media: safeMedia,
          is_auction: data.is_auction === 1,
          selling_mode: data.is_auction.toString(),
          auction_end_time: data.auction_end_time ? new Date(data.auction_end_time).toISOString().slice(0, 16) : ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showToast('Error fetching product', 'error');
        setLoading(false);
      });
  }, [params.id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const fileInput = e.target;
    const files = Array.from(fileInput.files || []);
    if (files.length === 0) return;

    setLoading(true);
    console.log('Uploading files:', files.length);

    const newMedia = [];

    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: data });
        const result = await res.json();
        
        if (result.success) {
          console.log('Upload success:', result.url);
          const type = file.type.startsWith('video/') ? 'video' : 'image';
          newMedia.push({ url: result.url, type });
          showToast(`Uploaded ${file.name}`);
        } else {
          console.error('Upload fail:', result);
          showToast(`Upload failed for ${file.name}`, 'error');
        }
      } catch (err) {
        console.error('Upload error:', err);
        showToast(`Upload error for ${file.name}`, 'error');
      }
    }

    setFormData(prev => {
        const updated = { ...prev, media: [...prev.media, ...newMedia] };
        console.log('State updated with new media:', updated.media);
        return updated;
    });
    
    setLoading(false);
    fileInput.value = ''; // Safe reset
  };

  const removeMedia = (e, indexToRemove) => {
    e.preventDefault(); // Stop form submission
    e.stopPropagation();
    console.log('Removing media at index:', indexToRemove);
    setFormData(prev => {
        const newMedia = prev.media.filter((_, i) => i !== indexToRemove);
        console.log('State after remove:', newMedia);
        return { ...prev, media: newMedia };
    });
    showToast('Media removed');
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...formData,
           is_auction: parseInt(formData.selling_mode),
           auction_end_time: formData.selling_mode === '1' ? formData.auction_end_time : null
        })
      });

      if (res.ok) {
        showToast('Product updated successfully!');
        router.push('/admin');
        router.refresh();
      } else {
        showToast('Failed to update product', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error updating product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/products/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Product deleted');
        router.push('/admin');
        router.refresh();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error deleting', 'error');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-deep-green)' }}>Edit Product</h1>
        <button 
          onClick={handleDelete}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
        >
          Delete Product
        </button>
      </div>
      
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
              min="0"
              step="1"
              required
              value={formData.stock} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Product Media</label>
          <input 
            type="file" 
            multiple 
            accept="image/*,video/*" 
            onChange={handleFileUpload} 
            style={{ marginBottom: '1rem' }} 
          />
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {formData.media.map((item, index) => (
              <div key={item.url || index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                {item.type === 'video' ? (
                  <video src={item.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                  <img 
                    src={item.url} 
                    alt="Preview" 
                    onError={(e) => {
                      console.error('Image load failed:', item.url);
                      e.target.style.border = '2px solid red';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                  />
                )}
                <button 
                  type="button" 
                  onClick={(e) => removeMedia(e, index)} 
                  style={{ 
                    position: 'absolute', 
                    top: -5, 
                    right: -5, 
                    backgroundColor: 'red', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '20px', 
                    height: '20px', 
                    border: 'none', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    lineHeight: '1'
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
                name="selling_mode" 
                value="0" 
                checked={formData.selling_mode === '0'} 
                onChange={handleChange} 
              /> Direct Buy
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="radio" 
                name="selling_mode" 
                value="1" 
                checked={formData.selling_mode === '1'} 
                onChange={handleChange} 
              /> Auction
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--color-deep-green)' }}>
              <input 
                type="radio" 
                name="selling_mode" 
                value="2" 
                checked={formData.selling_mode === '2'} 
                onChange={handleChange} 
              /> Showcase Only
            </label>
          </div>

          {formData.selling_mode === '1' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#d32f2f' }}>Auction End Time</label>
              <input 
                type="datetime-local" 
                name="auction_end_time" 
                required
                value={formData.auction_end_time} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="button" 
            onClick={() => router.back()}
            style={{ 
              flex: 1,
              padding: '1rem', 
              backgroundColor: '#eee', 
              color: '#333', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              flex: 2,
              padding: '1rem', 
              backgroundColor: 'var(--color-deep-green)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
}
