from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from .spotify_client import SpotifyClient
from .auth import get_current_user
from datetime import datetime
from typing import List
from pydantic import BaseModel

class TokenRequest(BaseModel):
    code: str

class PlaylistCreate(BaseModel):
    name: str
    track_uris: List[str]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # Add this line
)

@app.get("/api/auth/url")
async def get_auth_url():
    return {"url": SpotifyClient.get_auth_url()}

@app.post("/api/auth/token")
async def exchange_token(request: TokenRequest):
    try:
        token_data = await SpotifyClient.exchange_code(request.code)
        print("Token exchange response:", token_data)  # Add debug logging
        return token_data
    except Exception as e:
        print("Token exchange error:", str(e))  # Add debug logging
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/history")
async def get_history(
    start_date: str,
    end_date: str,
    current_user: dict = Depends(get_current_user)
):
    client = SpotifyClient(current_user["access_token"])
    return await client.get_listening_history(start_date, end_date)

@app.post("/api/playlist")
async def create_playlist(
    playlist: PlaylistCreate,
    current_user: dict = Depends(get_current_user)
):
    client = SpotifyClient(current_user["access_token"])
    return await client.create_playlist(playlist.name, playlist.track_uris)
