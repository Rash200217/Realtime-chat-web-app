import React, { useState } from "react";
import { MdClose, MdSearch } from "react-icons/md";
import API from "../utils/api";

const SearchUserModal = ({ onClose, onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await API.get(`/users/search?query=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-panel-bg w-full max-w-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white font-semibold">New Chat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <MdClose size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full bg-input-bg text-white pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-primary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <MdSearch className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {loading ? (
              <p className="text-center text-gray-500 py-4">Searching...</p>
            ) : results.length > 0 ? (
              results.map((user) => (
                <div 
                  key={user._id} 
                  onClick={() => onSelectUser(user)}
                  className="flex items-center gap-3 p-3 hover:bg-input-bg rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold shrink-0">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{user.username}</h4>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No users found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchUserModal;
