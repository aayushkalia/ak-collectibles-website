'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function BidManagementPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const productId = params.id;

  // Fetch Bids on Load
  useEffect(() => {
    if (status === 'authenticated') {
        if (session?.user?.role !== 'admin') {
            router.push('/');
            return;
        }
        fetchBids();
    }
  }, [session, status]);

  const fetchBids = async () => {
    try {
        // We need a server action or API to list bids. 
        // We haven't created a dedicated API for 'Listing Bids for Admin'.
        // Wait, I planned to just query DB in the page.js (Server Component)?
        // Ah, this file is 'use client' because of interactivity.
        // I should make the Page Server Component and pass data to a Client Component.
        // OR creating a quick API route. 
        // Let's use Server Component pattern for fetching data.
    } catch (error) {
        console.error(error);
    }
  };
  
  // WAIT - Converting to Server Component pattern below.
  return null; 
}
