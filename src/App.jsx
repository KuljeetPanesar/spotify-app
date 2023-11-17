import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const CLIENT_ID = "fd277b9307754f819cc13c4c29b995be";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }
    setToken(token);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    setSearchPerformed(false);
  };

  const searchArtists = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchKey,
        type: "artist",
      },
    });
    const artists = data.artists.items.slice(0, 15);

    for (const artist of artists) {
      const artistId = artist.id;

      const { data: topTracksData } = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            country: "GB",
          },
        }
      );
      artist.topTracks = topTracksData.tracks.slice(0, 5);

      const { data: albumsData } = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/albums`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      artist.albums = albumsData.items.slice(0, 5);
    }

    setArtists(artists);
    setSearchPerformed(true);
    setIsLoading(false);
  };

  // For onClick version
  // const fetchArtistInfo = async (artist) => {
  //   if (artist.showDetails) {
  //     // If details are already displayed, hide them
  //     artist.showDetails = false;
  //   } else {
  //     // Otherwise, fetch top tracks and albums
  //     const artistId = artist.id;

  //     // Fetch top tracks
  //     const { data: topTracksData } = await axios.get(
  //       `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         params: {
  //           country: "GB",
  //         },
  //       }
  //     );
  //     artist.topTracks = topTracksData.tracks;

  //     // Fetch albums
  //     const { data: albumsData } = await axios.get(
  //       `https://api.spotify.com/v1/artists/${artistId}/albums`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     artist.albums = albumsData.items;

  //     // Show artist details
  //     artist.showDetails = true;
  //   }

  //   // Update the state to trigger re-rendering
  //   setArtists([...artists]);
  // };

  const renderArtists = () => {
    const artistsToRender = artists.map((artist) => (
      <div className="artists-section" key={artist.id}>
        <span className="divider" />
        <div className="card">
          {" "}
          {/* className={`${hovered ? "show-details"}*/}
          <div className="img">
            {artist.images.length ? (
              <img width={"80%"} src={artist.images[0].url} alt="" />
            ) : (
              <div>No Image</div>
            )}
            <div
              className="artist-name"
              // onClick={() => fetchArtistInfo(artist)}
            >
              {artist.name}
            </div>
          </div>
          <div className="details">
            {/* {artist.showDetails && ( */}
            <div>
              <div className="top-tracks">
                <h3>Top Tracks</h3>
                <ul>
                  {artist.topTracks.map((track) => (
                    <li key={track.id}>{track.name}</li>
                  ))}
                </ul>
              </div>
              <div className="albums">
                <h3>Albums</h3>
                <ul>
                  {artist.albums.map((album) => (
                    <li key={album.id}>{album.name}</li>
                  ))}
                </ul>
              </div>
            </div>
            {/* )} */}
          </div>
        </div>
      </div>
    ));

    return (
      <div className="artists-container">
        {artists.length > 0 ? (
          <>
            <p>Top 15 results related to your search:</p>
            {artistsToRender}
          </>
        ) : (
          <div className="no-results">No artists found</div>
        )}
        <span className="divider" />
      </div>
    );
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Artist Finder</h1>
        {!token ? (
          <button id="login">
            <a
              href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            >
              Login to Spotify
            </a>
          </button>
        ) : (
          <button id="logout" onClick={logout}>
            Logout
          </button>
        )}

        {token ? (
          <form className="search" onSubmit={searchArtists}>
            <input
              id="search-bar"
              type="text"
              placeholder="Find artists..."
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <button id="search-button" type={"submit"}>
              Search
            </button>
          </form>
        ) : (
          <div>
            <h2>Please log in</h2>
            <div class="dots-7"></div>
          </div>
        )}

        {isLoading ? (
          <span>
            <div class="dots-7"></div>
          </span>
        ) : null}
        {searchPerformed ? renderArtists() : null}
      </header>
    </div>
  );
}

export default App;

//only open the one card thats hovered on at a time
// keep text small nd size of white section the same when expanded (for long artist names)

// error handling -- when need to login

// new app with bpm - tempo in api - showing tracks in existing library? or search for bpm for related tracks
