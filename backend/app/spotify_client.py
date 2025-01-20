import httpx
import asyncio
from datetime import datetime
import os
from urllib.parse import urlencode
from typing import List
from dotenv import load_dotenv

load_dotenv()

class SpotifyClient:
    BASE_URL = "https://api.spotify.com/v1"
    AUTH_URL = "https://accounts.spotify.com/authorize"
    TOKEN_URL = "https://accounts.spotify.com/api/token"
    
    def __init__(self, access_token: str = None):
        self.access_token = access_token
        self.client = httpx.AsyncClient(
            headers={"Authorization": f"Bearer {access_token}"} if access_token else {}
        )

    @staticmethod
    def get_auth_url():
        params = {
            "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
            "response_type": "code",
            "redirect_uri": os.getenv("SPOTIFY_REDIRECT_URI"),
            "scope": "user-read-recently-played playlist-modify-public playlist-modify-private"
        }
        return f"{SpotifyClient.AUTH_URL}?{urlencode(params)}"

    @staticmethod
    async def exchange_code(code: str):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                SpotifyClient.TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": os.getenv("SPOTIFY_REDIRECT_URI"),
                    "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
                    "client_secret": os.getenv("SPOTIFY_CLIENT_SECRET"),
                }
            )
            return response.json()

    async def get_listening_history(self, start_date: str, end_date: str) -> List[dict]:
        tracks = []
        # Parse the ISO string and remove the 'Z' suffix
        start_ms = int(datetime.fromisoformat(start_date.replace('Z', '+00:00')).timestamp() * 1000)
        end_ms = int(datetime.fromisoformat(end_date.replace('Z', '+00:00')).timestamp() * 1000)
        
        next_url = f"{self.BASE_URL}/me/player/recently-played?limit=50&before={end_ms}"
        
        while next_url and len(tracks) < 100:  # Limit to 100 tracks max
            response = await self.client.get(next_url)
            if response.status_code != 200:
                break
                
            data = response.json()
            
            for item in data["items"]:
                played_at = int(datetime.fromisoformat(item["played_at"].replace("Z", "+00:00")).timestamp() * 1000)
                if played_at >= start_ms and played_at <= end_ms:
                    track = item["track"]
                    track["played_at"] = item["played_at"]  # Add played_at to track data
                    tracks.append(track)
                elif played_at < start_ms:
                    next_url = None
                    break
            
            next_url = data.get("next")
            if next_url:
                await asyncio.sleep(1)  # Rate limiting
        
        return tracks

    async def create_playlist(self, name: str, track_uris: List[str]) -> dict:
        # Get user ID
        user_response = await self.client.get(f"{self.BASE_URL}/me")
        if user_response.status_code != 200:
            raise Exception("Failed to get user profile")
            
        user_id = user_response.json()["id"]
        
        # Create playlist
        playlist_response = await self.client.post(
            f"{self.BASE_URL}/users/{user_id}/playlists",
            json={
                "name": name,
                "description": "Created with Rewindify"
            }
        )
        if playlist_response.status_code != 201:
            raise Exception("Failed to create playlist")
            
        playlist_id = playlist_response.json()["id"]
        
        # Add tracks in batches of 100 (Spotify API limit)
        for i in range(0, len(track_uris), 100):
            batch = track_uris[i:i+100]
            add_tracks_response = await self.client.post(
                f"{self.BASE_URL}/playlists/{playlist_id}/tracks",
                json={"uris": batch}
            )
            if add_tracks_response.status_code != 201:
                raise Exception("Failed to add tracks to playlist")
                
            await asyncio.sleep(1)  # Rate limiting
        
        return playlist_response.json()
