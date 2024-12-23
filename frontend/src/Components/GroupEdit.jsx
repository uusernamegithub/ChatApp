import React, { useState, useEffect } from "react";
import "../styles/GroupEdit.css";

export default function GroupEdit({ chatDetails,setChatDetails }) {
  const [isBtnClicked, setBtnClicked] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState();
  const [groupMembers,SetgroupMembers] = useState(chatDetails.users);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://chat-appliacation.onrender.com/chatApp/v1/users/allUsers",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        if (data.success) setUsers(data.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [token]);

  const handleBtnClick = () => setBtnClicked(true);
  const handleCloseModal = () => setBtnClicked(false);

  const handleRemoveUser = async (userId) => {
    try {
      const response = await fetch(
        "https://chat-appliacation.onrender.com/chatApp/v1/chat/group/remove",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId: chatDetails._id,
            userId,
          }),
        }
      );

      if (!response.ok) throw new Error(`Failed to remove user: ${response.status}`);
      const result = await response.json();
      SetgroupMembers(groupMembers.filter((user) => user._id !== userId));
      setChatDetails(chatDetails);
    } catch (error) {
      console.error("Failed to send request:", error);
    }
  };

  const handleAddToGroup = async (user) => {
    try {
      const response = await fetch(
        "https://chat-appliacation.onrender.com/chatApp/v1/chat/group/add",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId: chatDetails._id,
            userId: user._id,
          }),
        }
      );

      if (!response.ok) throw new Error(`Failed to add user: ${response.status}`);
      const result = await response.json();
      SetgroupMembers([...groupMembers, user]);
      setChatDetails(chatDetails);

    } catch (error) {
      console.error("Failed to send request:", error);
    }
  };

  const handleRenameGroup = async () => {
    try {
      const response = await fetch(
        "https://chat-appliacation.onrender.com/chatApp/v1/chat/group/rename",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId: chatDetails._id,
            chatName: groupName,
          }),
        }
      );

      if (!response.ok) throw new Error(`Failed to rename group: ${response.status}`);
      const result = await response.json();
      setChatDetails(chatDetails);

      if (result.success) console.log("Group renamed successfully");
      else console.error("Error:", result.message);
    } catch (error) {
      console.error("Failed to send request:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <span><button className="group-edit-button" onClick={handleBtnClick}>
        Edit
      </button></span>
      {isBtnClicked && (
        <div className="group-edit-modal">
          <h3>Edit Group</h3>
          <button className="close-modal-button" onClick={handleCloseModal}>
            Close
          </button>
          <div>
            <strong>Group Members:</strong>
            <div className="group-members">
              {groupMembers.map((user) => (
                <div key={user._id} className="group-member-item">
                  <span>{user.name}</span>
                  <button
                    className="remove-user-button"
                    onClick={() => handleRemoveUser(user._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <strong>Add to Group:</strong>
            <input
              type="text"
              className="search-users-input"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.length > 0 && (
              <div className="filtered-users">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="filtered-user-item"
                      onClick={() => handleAddToGroup(user)}
                    >
                      {user.name}
                    </div>
                  ))
                ) : (
                  <p className="no-users">No users found</p>
                )}
              </div>
            )}
          </div>
          <div>
            <strong>Rename Group:</strong>
            <input
              type="text"
              className="rename-group-input"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button className="rename-group-button" onClick={handleRenameGroup}>
              Rename
            </button>
          </div>
        </div>
      )}
    </>
  );
}
