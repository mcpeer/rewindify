import { useState } from 'react';
import { DateRangePicker } from '../components/DateRangePicker';
import { TrackList } from '../components/TrackList';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { Button } from '../components/Button';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { 
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  uri: string;
  played_at?: string;
}

export default function Home() {
  const { isAuthenticated, isLoading, login } = useSpotifyAuth();
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchTracks = async () => {
    if (!dateRange.start || !dateRange.end) return;
    
    setIsFetching(true);
    try {
      const token = localStorage.getItem('spotify_token');
      // Convert dates to UTC ISO string
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();
      
      console.log('Fetching tracks with dates:', { startDate, endDate }); // Debug log
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/history?` + 
        `start_date=${startDate}&` +
        `end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include' // Add this line
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch tracks');
      }
      
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      alert('Failed to fetch tracks. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const createPlaylist = async () => {
    if (tracks.length === 0) return;
    
    setIsCreating(true);
    try {
      const name = playlistName || 
        `Rewindify ${dateRange.start?.toLocaleDateString()} to ${dateRange.end?.toLocaleDateString()}`;
      
      // Sort tracks from oldest to newest before getting URIs
      const sortedTracks = [...tracks].sort((a, b) => {
        if (!a.played_at || !b.played_at) return 0;
        return new Date(a.played_at).getTime() - new Date(b.played_at).getTime();
      });
      
      const trackUris = sortedTracks.map(track => track.uri);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name,
          track_uris: trackUris
        })
      });
      
      if (!response.ok) throw new Error('Failed to create playlist');
      
      const playlistData = await response.json();
      
      const confirmed = window.confirm(
        `Playlist created successfully! Click OK to open the playlist in Spotify.`
      );
      
      if (confirmed && playlistData.external_urls?.spotify) {
        window.open(playlistData.external_urls.spotify, '_blank');
      }
      
      setPlaylistName('');
      setTracks([]);
      setDateRange({ start: null, end: null });
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button onClick={login}>Login with Spotify</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Rewindify</h1>
      
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Select Time Range</h2>
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onChange={setDateRange}
        />
        
        <Button
          onClick={fetchTracks}
          disabled={!dateRange.start || !dateRange.end || isFetching}
          className="mt-4 w-full"
        >
          {isFetching ? 'Loading...' : 'Get Tracks'}
        </Button>
      </div>
      
      {tracks.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Playlist Name
            </label>
            <input
              type="text"
              placeholder="Enter playlist name (optional)"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <TrackList
            tracks={tracks}
            onTracksChange={setTracks}
          />
          
          <Button
            onClick={createPlaylist}
            disabled={isCreating}
            className="mt-6 w-full"
          >
            {isCreating ? 'Creating...' : 'Create Playlist'}
          </Button>
        </div>
      )}
    </div>
  );
}
