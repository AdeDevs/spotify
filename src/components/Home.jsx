import { useState } from "react";
import yemi from "../assets/yemi.png";
import { getValidToken } from "../api/getToken.js";

export default function HomePage() {
  const [isTheme, setIsTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? JSON.parse(storedTheme) : false;
  });
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState(null);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");

  const toggleTheme = () => setIsTheme(!isTheme);

  const searchArtist = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoader(true);
    setError("");
    setArtist(null);

    try {
      const token = await getValidToken();

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=artist&limit=1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch artist.");

      const data = await response.json();

      if (data.artists.items.length === 0) {
        setError("No artist found.");
      } else {
        setArtist(data.artists.items[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className={`home ${isTheme ? "light" : ""}`}>
      <nav className="navbar">
        <h1 className="intro">Spotify Artist Finder</h1>
        {/* <button onClick={toggleTheme}>toggle</button> */}
      </nav>

      <div className="box">
        {/* Search Box */}
        <div className="card search-box">
          <form className="search" onSubmit={searchArtist}>
            <input
              type="text"
              maxLength={50}
              placeholder="Enter Artist Name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button type="submit">Search</button>
          </form>
        </div>

        {loader ? (
          <LoaderScreen />
        ) : (
          artist && <ArtistCard artist={artist} />
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

// Loader placeholder UI
function LoaderScreen() {
  return (
    <div className="card loader-profile">
      <div className="artist-info">
        <div className="avatar loader-avatar" />
        <ul className="info">
          <li className="name loader-text"></li>
          <li className="genre">
            <span className="gen loader-text"></span>
            <span className="gen loader-text"></span>
            <span className="gen loader-text"></span>
          </li>
          <li className="pop loader-text"></li>
        </ul>
      </div>
      <div className="btns">
        <button className="albums-btn loader-btn"></button>
        <button className="tracks-btn loader-btn"></button>
      </div>
    </div>
  );
}

// Presentational Artist Card
function ArtistCard({ artist }) {
  const [albums, setAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [albumLoader, setAlbumLoader] = useState(false)
  const [trackLoader, setTrackLoader] = useState(false)

  const fetchAlbums = async () => {
    if (!artist) return;
    setTopTracks([])
    setAlbumLoader(true)
    try {
      const token = await getValidToken();
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch albums.");
      const data = await res.json();
      setAlbums(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setAlbumLoader(false)
    }
  };

  const fetchTopTracks = async () => {
    if (!artist) return;
    setTrackLoader(true)
    setAlbums([])
    try {
      const token = await getValidToken();
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch top tracks.");
      const data = await res.json();
      setTopTracks(data.tracks);
    } catch (err) {
      console.error(err);
    } finally {
      setTrackLoader(false)
    }
  };

  return (
    <section className="artiste-box">
      <div className="card artist-profile">
        <div className="artist-info">
          <img
            className="avatar"
            src={artist.images[0]?.url || yemi}
            alt={artist.name}
          />
          <ul className="info">
            <li className="name">
              <a
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
              >
                {artist.name}
              </a>
            </li>
            <li className="genre">
              {artist.genres.length
                ? artist.genres.map((genre, i) => (
                  <span className="gen" key={i}>
                    {genre}
                  </span>
                ))
                : "No genre info"}
            </li>
            <li className="pop">
              Followers: {artist.followers?.total.toLocaleString() || 0}
            </li>
          </ul>
        </div>

        <div className="btns">
          <button className="albums-btn" onClick={fetchAlbums}>
            view albums
          </button>
          <button className="tracks-btn" onClick={fetchTopTracks}>
            view top tracks
          </button>
        </div>
      </div>
      {albumLoader ? ( <AlbumLoader/> ) : ( albums.length > 0 && (
        <div className="card albums">
          <h3>Albums & EPs</h3>
          <div className="album-list">
            {albums.map((album) => (
              <div key={album.id} className="album-item">
                <a
                  href={album.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={album.images[0]?.url || yemi}
                    alt={album.name}
                  />
                </a>
                <a
                  href={album.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {album.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}

      {trackLoader ? ( <TrackLoader /> ) : (topTracks.length > 0 && (
        <div className="card top-tracks">
          <h3>Top Tracks</h3>
          <ol className="tracks">
            {topTracks.map((track) => {
              const minutes = Math.floor(track.duration_ms / 60000);
              const seconds = Math.floor((track.duration_ms % 60000) / 1000)
                .toString()
                .padStart(2, "0");
              return (
                <li key={track.id}>
                  <span className="track-name">
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {track.name}
                    </a>
                  </span>
                  <span className="track-title">
                    Album:{" "}
                    <span className="track-albm">
                      ({track.album.name})
                    </span>
                  </span>
                  <span className="track-title track-albm">
                    Duration: {minutes}:{seconds}
                  </span>
                  <span className="track-title track-albm">
                    Popularity: {track.popularity}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}

function AlbumLoader() {
  return (
    <div className="card albums album-loader">
      <h3></h3>
      <div className="album-list">
        <div className="album-item">
          <a className="albm-img"></a>
          <a className="albm-title"></a>
        </div>
        <div className="album-item">
          <a className="albm-img"></a>
          <a className="albm-title"></a>
        </div>
        <div className="album-item">
          <a className="albm-img"></a>
          <a className="albm-title"></a>
        </div>
      </div>
    </div>
  )
}

function TrackLoader() {
  return (
    <div className="card top-tracks track-loader">
      <h3></h3>
      <ol className="tracks">
        <li></li>
        <li></li>
        <li></li>
      </ol>
    </div>
  )
}