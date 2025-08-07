import subprocess

def findyoutubeurl(trackname: str, artist:str) -> str:
    query = f"{trackname} - {artist} official audio"
    command = ["yt-dlp",
               "--default-search", "ytsearch1", # brings back only the first search result
               "--skip-download",
               "--print", "%(webpage_url)s",
               query
               ]
    

    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True) #runs the command as if it's running in the console
        url = result.stdout.strip()
        return url
    except subprocess.CalledProcessError as e:
        print(f"Error occurred while searching Youtube: {e}")
        return None
    
if __name__ == "__main__":
    url = findyoutubeurl("Debut", "Katseye")
    print(f"Youtube URL: {url}")

