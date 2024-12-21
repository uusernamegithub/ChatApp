import React, { useState, useEffect } from "react";
import "../styles/GroupComp.css";

export default function CenteredDiv({ selectedChatId, setSelectedChatId }) {
    const [showDiv, setShowDiv] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [groupUsers, setGroupUsers] = useState([]);
    const [groupName, setGroupName] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
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
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const data = await response.json();
                if (data.success) setUsers(data.data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        fetchUsers();
    }, [token]);

    const handleButtonClick = () => {setShowDiv(true);}
    const handleAddToGroup = (user) => {
        if (!groupUsers.some((groupUser) => groupUser._id === user._id)) {
            setGroupUsers((prevGroupUsers) => [...prevGroupUsers, user]);
        }
    };
    const handleCreateGroup = async () => {
        if (groupUsers.length < 1 || !groupName) {
            alert("Please select users and provide a group name.");
            return;
        }

        const userIds = groupUsers.map((user) => user._id);
        const groupData = { users: userIds, name: groupName };

        try {
            const response = await fetch(
                "http://127.0.0.1:3256/chatApp/v1/chat/group",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(groupData),
                }
            );
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setSelectedChatId(data._id);
            setShowDiv(false);
        } catch (error) {
            console.error("Failed to create group:", error);
            alert("An error occurred while creating the group.");
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <button className="group-create-button" onClick={handleButtonClick}>
                Create New Group
            </button>
            {showDiv && (
                <div className="group-modal">
                    <h3>Create a New Group</h3>
                    <input
                        type="text"
                        className="group-name-input"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    <div className="group-container">
                        <div className="user-search-container">
                            <input
                                type="text"
                                className="user-search-input"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery.length > 0 && (
                                <div className="filtered-user-list">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user._id}
                                                className="filtered-user-item"
                                                onClick={() => handleAddToGroup(user)}
                                            >
                                                <strong>{user.name}</strong>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-users-found">No users found</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="group-users-container">
                            <p className="group-users-title">Group Users:</p>
                            {groupUsers.length > 0 ? (
                                groupUsers.map((user) => (
                                    <div key={user._id} className="group-user-item">
                                        {user.name}
                                    </div>
                                ))
                            ) : (
                                <p className="no-group-users">No users added</p>
                            )}
                        </div>
                    </div>
                    <button className="create-group-button" onClick={handleCreateGroup}>
                        Create Group
                    </button>
                    <button className="close-modal-button" onClick={() => setShowDiv(false)}>
                        Close
                    </button>
                </div>
            )}
        </>
    );
}
