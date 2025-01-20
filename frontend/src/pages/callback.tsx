import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Callback() {
  const router = useRouter();
  
  useEffect(() => {
    const { code } = router.query;
    
    if (code) {
      console.log('Received code:', code); // Add debug logging
      
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
      })
      .then(async response => {
        console.log('Token exchange response:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to exchange code');
        }
        return response.json();
      })
      .then(data => {
        console.log('Received token data:', data); // Add debug logging
        localStorage.setItem('spotify_token', data.access_token);
        router.push('/');
      })
      .catch(error => {
        console.error('Auth error:', error);
        router.push('/?error=auth_failed');
      });
    }
  }, [router.query]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging you in...</p>
      </div>
    </div>
  );
}
