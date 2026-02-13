import React, { useState, useEffect, useContext } from "react";
import { FaUsers, FaChartLine, FaCog, FaBars, FaTimes, FaSearch, FaBan, FaTrash, FaCheck } from "react-icons/fa";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  // Data States
  const [stats, setStats] = useState({ totalUsers: 0, totalMessages: 0, activeChats: 0, newUsers: 0 });
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search/Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Fetch Stats on Mount
  useEffect(() => {
    fetchStats();
  }, []);

  // 2. Fetch Data based on Tab
  useEffect(() => {
    if (activeTab === "Users") fetchUsers();
    if (activeTab === "Chats") fetchChats();
  }, [activeTab, page, searchTerm]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/users?search=${searchTerm}&page=${page}`);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/chats");
      setChats(res.data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm("Are you sure you want to ban/unban this user?")) return;
    try {
      await API.put(`/admin/users/${userId}/ban`);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error banning user:", err);
      alert("Failed to ban user");
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat forever?")) return;
    try {
      await API.delete(`/admin/chats/${chatId}`);
      fetchChats(); // Refresh list
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Failed to delete chat");
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-primary flex flex-col md:flex-row relative font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center shadow-md text-white border-b border-gray-800">
        <h1 className="text-2xl font-bold">AdminPanel</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white text-2xl focus:outline-none">
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-panel-bg p-6 flex flex-col gap-6 shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 border-r border-gray-700`}>
        <h1 className="text-3xl font-extrabold text-white tracking-wider">Admin<span className="text-primary">Panel</span></h1>
        <nav className="flex flex-col gap-4">
          {["Dashboard", "Users", "Chats"].map((item) => (
            <div
              key={item}
              onClick={() => { setActiveTab(item); setIsSidebarOpen(false); }}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-l-4 ${activeTab === item ? "bg-input-bg border-primary text-white" : "border-transparent text-gray-400 hover:bg-gray-800 hover:text-white"}`}
            >
              <span className="text-lg"><FaChartLine /></span>
              <span className="font-medium">{item}</span>
            </div>
          ))}

          <div
            onClick={() => {
               if(window.confirm("Are you sure you want to logout?")) {
                 logout();
                 navigate("/login");
               }
            }}
            className="group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-l-4 border-transparent text-gray-400 hover:bg-red-900/20 hover:text-red-500 mt-auto"
          >
             <span className="text-lg"><MdLogout /></span>
             <span className="font-medium">Logout</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-app-bg">
        <h2 className="text-3xl font-bold mb-8 text-white">{activeTab} Overview</h2>

        {/* DASHBOARD TAB */}
        {activeTab === "Dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Total Users", value: stats.totalUsers, color: "from-green-500 to-green-700", icon: <FaUsers /> },
              { title: "Active Chats", value: stats.activeChats, color: "from-blue-500 to-blue-700", icon: <FaChartLine /> },
              { title: "Total Messages", value: stats.totalMessages, color: "from-orange-500 to-orange-700", icon: <FaChartLine /> },
            ].map((stat, idx) => (
              <div key={idx} className={`relative bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300 text-white`}>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full"></div>
                <div className="relative z-10">
                   <div className="text-white/80 text-3xl mb-2">{stat.icon}</div>
                   <h3 className="text-white/90 text-sm uppercase tracking-wider font-semibold">{stat.title}</h3>
                   <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "Users" && (
          <div className="bg-panel-bg rounded-2xl overflow-hidden shadow-xl border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="relative w-full sm:w-64">
                 <FaSearch className="absolute left-3 top-3 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search users..." 
                   className="w-full bg-input-bg text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-input-bg text-gray-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Username</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Registered</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-800 transition-colors">
                      <td className="p-4 text-white font-medium">{user.username} {user.role === 'admin' && <span className="text-xs bg-primary px-1 rounded ml-1">ADMIN</span>}</td>
                      <td className="p-4 text-gray-400">{user.email}</td>
                      <td className="p-4">
                        {user.isBanned ? (
                           <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded text-xs font-bold border border-red-800">Banned</span>
                        ) : (
                           <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs font-bold border border-green-800">Active</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleBanUser(user._id)} 
                            className={`${user.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1`}
                          >
                             {user.isBanned ? <><FaCheck size={12}/> Unban</> : <><FaBan size={12}/> Ban</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !loading && <p className="text-center text-gray-500 p-8">No users found.</p>}
            </div>
          </div>
        )}

        {/* CHATS TAB */}
        {activeTab === "Chats" && (
          <div className="bg-panel-bg rounded-2xl overflow-hidden shadow-xl border border-gray-700">
             <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-input-bg text-gray-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Chat ID</th>
                    <th className="p-4">Participants</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {chats.map((chat) => (
                    <tr key={chat._id} className="hover:bg-gray-800 transition-colors">
                      <td className="p-4 text-gray-400 font-mono text-xs">{chat._id}</td>
                      <td className="p-4 text-white">
                         {chat.isGroup ? chat.groupName : chat.participants.map(p => p.username).join(", ")}
                      </td>
                      <td className="p-4 text-gray-500 text-sm">{new Date(chat.updatedAt).toLocaleString()}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleDeleteChat(chat._id)} 
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                        >
                           <FaTrash size={12}/> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {chats.length === 0 && !loading && <p className="text-center text-gray-500 p-8">No active chats found.</p>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
