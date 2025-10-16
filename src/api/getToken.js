export async function getSpotifyToken() {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  
    const encoded = btoa(`${clientId}:${clientSecret}`);
  
    try {
      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encoded}`,
        },
        body: "grant_type=client_credentials",
      });
  
      if (!res.ok) throw new Error("Failed to fetch Spotify token");
  
      const data = await res.json();
      localStorage.setItem("spotify_token", data.access_token);
      localStorage.setItem("spotify_token_expiry", Date.now() + data.expires_in * 1000);
  
      return data.access_token;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  
  export async function getValidToken() {
    const storedToken = localStorage.getItem("spotify_token");
    const expiry = localStorage.getItem("spotify_token_expiry");
  
    if (storedToken && expiry && Date.now() < expiry) {
      return storedToken;
    }
  
    return await getSpotifyToken();
  }
  