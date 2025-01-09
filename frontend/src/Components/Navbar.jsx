import React, { useState } from "react";
import "../styles/Navbar.css";
import SearchComp from "./SearchComp";
import GroupComp from "./GroupComp";
import imageSrc from '../image.png';


const Navbar = ({ selectedChatId, setSelectedChatId,selectedChatpic }) => {
  const loggedin = JSON.parse(localStorage.getItem("loggedin"));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.setItem("loggedin", "false");
    window.location.href = "/login"; // Redirect to login page
  };

  const handleCreateGroup = () => {
    ("Create New Group clicked!");
    // Add logic for creating a new group
  };

  return (
    <nav className="navbar">
      <div className="heading-container">
      <img
          style={{ width: '40px', height: '40px' }}
          src={imageSrc}
          alt="Descriptive text"
        />
      <h1 className="heading">ChatApplication</h1>
         {/* Mobile Menu Toggle Button */}
         {loggedin && <button
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span>
            <img style={{width:'50px',height:'50px',borderRadius:'50%'}}src={selectedChatpic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="Profile" onError={(e) => e.target.style.display = "none"} />
            </span>

          </button>}
      </div>
      {loggedin ? (
        <>
          {/* <div className="search-container">
            <SearchComp
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
            />
          </div> */}
          <div className="Laptop-view">
            <div>
              <GroupComp
                selectedChatId={selectedChatId}
                setSelectedChatId={setSelectedChatId}
              />
            </div>
            <button onClick={handleLogout} className="link desktop-only">
              Logout
            </button>
          </div>
          
          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="navbar-mobile-menu">
              <div className="mobile-menu-item">
                <GroupComp
                  selectedChatId={selectedChatId}
                  setSelectedChatId={setSelectedChatId}
                />
              </div>
              <div className="mobile-menu-item">
                  <button onClick={handleLogout} className="logout-mobile">
                    Logout
                  </button>
              </div>
              
            </div>
          )}
        </>
      ) : (
        <div className="links-container">
          <a href="/login" className="link">
            Login
          </a>
          <a href="/signup" className="link">
            Signup
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
