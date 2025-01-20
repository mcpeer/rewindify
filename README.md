# Spotify Rewindify 🎵

A web application that lets you create Spotify playlists from your listening history within specific date ranges. Built entirely with [aider](https://github.com/paul-gauthier/aider) AI coding assistant for less than $2 worth of Anthropic tokens!

## Features

- 🔐 Secure Spotify OAuth authentication
- 📅 Date range selection with time precision
- 📝 Customizable playlist names
- 🎵 Interactive track list with drag-and-drop reordering
- 🌙 Modern dark theme UI
- 🔗 Direct links to created playlists

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React Beautiful DnD

### Backend
- FastAPI
- Python
- Spotify Web API

## Getting Started

### Backend Setup

1. Create a Spotify Developer account and register your application:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new application
   - Add `http://localhost:3000/callback` to the Redirect URIs

2. Set up the Python environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the `backend` directory:
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

4. Start the backend server:
```bash
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Visit `http://localhost:3000`
2. Log in with your Spotify account
3. Select a date range to fetch your listening history
4. Customize the track list by dragging and dropping songs
5. (Optional) Enter a custom playlist name
6. Click "Create Playlist" to save to your Spotify account
7. Click OK in the confirmation dialog to open your new playlist in Spotify

## Development Notes

- The backend uses FastAPI's automatic OpenAPI documentation, available at `http://localhost:8000/docs`
- Frontend components are built with TypeScript for better type safety
- The application uses Spotify's Web API with OAuth 2.0 authentication
- All styling is done with Tailwind CSS for consistent design

## Contributing

Feel free to open issues or submit pull requests if you have suggestions for improvements!

## License

MIT License - feel free to use this code for your own projects!

## Acknowledgments

- Built with [aider](https://github.com/paul-gauthier/aider) AI coding assistant
- Uses the [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- Inspired by the desire to create playlists from specific time periods in our listening history
