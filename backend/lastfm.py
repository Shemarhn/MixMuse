import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

API_KEY = os.getenv('LASTFM_API_KEY')
USERNAME = os.getenv('LASTFM_USERNAME') 

def recenttracks(limit=100): #This gets the last 100 tracks played by the user
    if not API_KEY or not USERNAME:
        raise ValueError("API_KEY and USERNAME must be set in environment variables") #Raises an error if the API key or username is not set
    

    url = "http://ws.audioscrobbler.com/2.0/" # Last.fm API endpoint
    params = {                              # Parameters for the API request
        "method": "user.getrecenttracks", # Method to get recent tracks included in the Last.fm API
        "user": USERNAME,
        "api_key": API_KEY,
        "format": "json", # Response format of the data
        "limit": limit #Sets the limit of tracks to be returned
    }
    response = requests.get(url, params=params) # Sends a GET request to the Last.fm API with the specified parameters
    if response.status_code != 200:
        raise Exception(f"Error fetching data from Last.fm API: {response.status_code}") # Raises an error if the request was not successful
    
    data = response.json() #Parses the JSON response from the API

    if 'recenttracks' not in data: # Checks if 'recenttracks' is in the response data
        raise ValueError("Invalid response from Last.fm API")
    
    tracks = data['recenttracks']['track'] # Extracts the list of tracks from the response
    cleaned = [] # Initializes an empty list to store cleaned track data

    for track in tracks: # Iterates through each track in the list
        cleaned.append({ # Appends a dictionary with cleaned track data to the cleaned list
            "artist": track['artist']['#text'],
            "name": track['name'],
            "album": track['album']['#text'],
            "played_at": track.get('date', {}).get('#text', 'Now Playing')  # Gets the played date, defaults to 'Now Playing' if not available
        })

    return cleaned

def get_similar_tracks(artist, track_name, limit=10):
    url= "http://ws.audioscrobbler.com/2.0/"
    params = {
        "method": "track.getsimilar",
        "artist": artist,
        "track": track_name,
        "api_key": API_KEY,
        "format": "json",
        "limit": limit
    }
    response = requests.get(url, params=params)
    data = response.json()
    if 'similartracks' not in data or 'track' not in data['similartracks']:
        return []  # Return an empty list if no similar tracks are found
    similar_tracks= data['similartracks']['track']
    cleaned = []

    for track in similar_tracks:
        cleaned.append({
            "artist": track['artist']['name'],
            "name": track['name']
        })
    return cleaned


if __name__ == "__main__":
    tracks = recenttracks()
   # for track in tracks:
   #     print(f"{track['artist']} - {track['name']} from {track['album']} ({track['played_at']})")

    # Example usage of get_similar_tracks
    first_track = tracks[0] if tracks else None
    if first_track:
        similar_tracks = get_similar_tracks(first_track['artist'], first_track['name'])
        print(f"\nSimilar tracks to {first_track['name']} by {first_track['artist']}:")
        for similar in similar_tracks:
            print(f"{similar['artist']} - {similar['name']}")




        


    


