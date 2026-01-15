'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';


export default function ShopToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [sort, setSort] = useState(searchParams.get('sort') || 'date_desc');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) params.set('q', debouncedSearch);
    else params.delete('q');
    
    // Reset page on new search
    params.set('page', '1');
    
    router.push(`/shop?${params.toString()}`);
  }, [debouncedSearch, router]);

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSort(val);
    const params = new URLSearchParams(searchParams);
    params.set('sort', val);
    router.push(`/shop?${params.toString()}`);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    const params = new URLSearchParams(searchParams);
    if (val === 'all') params.delete('category');
    else params.set('category', val);
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div style={{ 
      marginBottom: '2rem', 
      padding: '1rem', 
      backgroundColor: '#fff', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Search */}
      <div style={{ flex: '1 1 200px' }}>
         <input 
           type="text" 
           placeholder="Search products..." 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           style={{ 
             width: '100%', 
             padding: '0.8rem', 
             borderRadius: '4px', 
             border: '1px solid #e0e0e0',
             fontSize: '1rem'
           }}
         />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Category Filter */}
        <select 
          value={category} 
          onChange={handleCategoryChange}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #e0e0e0', cursor: 'pointer' }}
        >
          <option value="all">All Categories</option>
          <option value="Coins">Coins</option>
          <option value="Stamps">Stamps</option>
          <option value="Notes">Notes</option>
          <option value="Artifacts">Artifacts</option>
        </select>

        {/* Sort */}
        <select 
          value={sort} 
          onChange={handleSortChange}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #e0e0e0', cursor: 'pointer' }}
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="alpha_asc">Name: A-Z</option>
        </select>
      </div>
    </div>
  );
}

// Custom Debounce Hook (internal to avoid installing dependency if possible)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return [debouncedValue];
}
