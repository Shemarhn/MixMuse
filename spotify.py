import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

load_dotenv()  # Load environment variables from .env file  

client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')

sp = spotipy.Spotify( 
    auth_manager=SpotifyClientCredentials( #SpotifyClientCredentials is used instead of SpotifyOAuth because this doesn't need personalized data from Spotify. Just need to access their servers and their public data
        client_id=client_id,
        client_secret= client_secret
    )
)


def search_track(track_name, artist_name):
    query = f"artist:{artist_name} track:{track_name}"
    results = sp.search(q=query, type='track', limit=1) #The sp.search function searches on Spotify the requested track. And the limit is set to 1 to have only one result.
    items = results.get('tracks', {}).get('items', [])
    if items:
        return items[0]  # Return the first matching track
    return None

def audio_features(track_id):
    return sp.audio_features([track_id])[0]  # Returns a list, so we take the first element


#Demo
if __name__ == "__main__":
    track = search_track("Blinding Lights", "The Weeknd")
    if track:
        print(f"Found track: {track['name']} by {track['artists'][0]['name']}")
        features = audio_features(track['id'])
        print("Audio Features:", features)
    else:
        print("Track not found.")