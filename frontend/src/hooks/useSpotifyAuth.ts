import { useState, useEffect } from 'react';

export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('spotify_token');
    console.log('Current token:', token); // Add debug logging
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);
  
  const login = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/url`);
      const { url } = await response.json();
      console.log('Redirecting to:', url); // Add debug logging
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('spotify_token');
    setIsAuthenticated(false);
  };
  
  return { isAuthenticated, isLoading, login, logout };
}
