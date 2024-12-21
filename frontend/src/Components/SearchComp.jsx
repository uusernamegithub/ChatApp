import React, { useState, useEffect } from "react";
import '../styles/SearchComp.css'; // Import the CSS file

const SearchComp = ({ selectedChatId, setSelectedChatId }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  ('chatId' + selectedChatId);

  useEffect(() => {
    // Fetch all users
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:3256/chatApp/v1/users/allUsers",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setUsers(data.data); // Set the full user list
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [token]); // Dependency on `token`

  // Filtered users derived directly from the `users` array and `searchQuery`
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Start a new chat
  const handleUserSelect = async (userId) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:3256/chatApp/v1/chat/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: userId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      ("Chat started successfully:", data);
      setSelectedChatId(data._id);
      setSearchQuery('');
      // setSelectedChatName(data.)
      // Handle post-chat-start logic here
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <ul className="user-list">
        {searchQuery && filteredUsers.map((user) => (
          <li
            key={user._id}
            className="user-card"
            onClick={() => handleUserSelect(user._id)}
          >
            <img
              src={user.pic}
              alt={user.name}
              className="user-image"
            />
            <div>
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </li>
        ))}
      </ul>
      {/* {searchQuery && filteredUsers.length === 0 && (
        <p className="no-results">No users found</p>
      )} */}
    </div>
  );
};

export default SearchComp;
