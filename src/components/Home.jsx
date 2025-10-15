import { useState, useEffect } from "react";
import yemi from "../assets/yemi.png"

export default function HomePage() {
  const [isTheme, setIsTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme")
    return storedTheme ? JSON.parse(storedTheme) : false
  })
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isTheme))
    // localStorage.clear()
  }, [isTheme])
  const toggleTheme = () => {
    setIsTheme(!isTheme)
  }

  return (
    <div className={`home ${isTheme ? "light" : ""}`}>
      <nav className="navbar">
        <h1 className="intro">Spotify Artist Finder</h1>
        <button onClick={toggleTheme}>toggle</button>
      </nav>
      <div className="box">
        <div className="card search-box">
          <form className="search">
            <input type="text" maxLength={10} placeholder="Enter Artist Name..." required/>
            <button>Search</button>
          </form>
        </div>
        <div className="card artist-profile">
          <div className="artist-info">
            <img className="avatar" src={yemi} alt="artiste avatar" />
            <ul className="info">
              <li className="name">Adeyemi Akinyemi</li>
              <li className="genre"><span>Pop</span> <span>Rock</span> <span>Fuji</span></li>
              <li className="pop">999,999,999</li>
            </ul>
          </div>
          <div className="btns">
            <button className="albums-btn">view albums</button>
            <button className="tracks-btn">view top tracks</button>
          </div>
        </div>
        <div className="card extras"></div>
      </div>
    </div>
  );
}