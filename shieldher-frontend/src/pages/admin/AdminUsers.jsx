import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";

function UserProfiles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken"); 

      const config = {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      };

      // Backend route fetch connection
      const response = await axios.get(
        `http://localhost:8000/api/admin/users?page=${page}&limit=20`, 
        config
      );
      
      if (response.data && response.data.data) {
        setUsers(response.data.data);
        setTotalPages(Math.ceil(response.data.total / 20) || 1);
      }
    } catch (error) {
      console.error("Error retrieving user list data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-[50vh] flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
          <div className="h-6 w-6 rounded-full border-2 border-t-[#ec4899] border-gray-800 animate-spin" />
          Loading Registered Profiles...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* User Friendly Page Header */}
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">User Profiles</h1>
        <p className="text-sm text-gray-400">Manage and view details of all registered users on the platform</p>
      </div>

      {/* Modern Professional Data Table */}
      <div className="overflow-x-auto bg-[#0d0e12] border border-gray-900 rounded-2xl shadow-xl">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#12141c]/50 border-b border-gray-900 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">User ID</th>
              <th className="px-6 py-4">Contact Link</th>
              <th className="px-6 py-4 text-center">Trusted Contacts</th>
              <th className="px-6 py-4 text-center">Uploaded Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900/60 text-sm text-gray-300">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium italic">
                  No registered user profiles found in the database.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-900/20 transition-colors">
                  
                  {/* Profile Avatar & Full Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || "https://placehold.co/40x40/0d0e12/ffffff?text=U"} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-800" 
                      />
                      <span className="font-semibold text-white tracking-wide">{user.name}</span>
                    </div>
                  </td>

                  {/* Unique Object ID */}
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {user._id}
                  </td>

                  {/* Communications Columns */}
                  <td className="px-6 py-4">
                    <div className="text-gray-300">{user.email}</div>
                    <div className="text-xs text-blue-400 font-medium mt-0.5">{user.phone || "No phone added"}</div>
                  </td>

                  {/* Dynamic Trusted Contacts Count Badge */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {user.trustedContactsCount || 0} Saved
                    </span>
                  </td>

                  {/* Dynamic Vault Assets Counter Badge */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {user.uploadedEvidencesCount || 0} Files
                    </span>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Clean Pagination Navigation Panel */}
      <div className="flex justify-between items-center mt-8 text-sm">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(prev => prev - 1)}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            page === 1 
              ? "bg-[#0d0e12] border border-gray-900 text-gray-600 cursor-not-allowed" 
              : "bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 active:scale-95"
          }`}
        >
          &larr; Previous
        </button>
        
        <span className="text-gray-500 font-medium tracking-wide">
          Page {page} of {totalPages}
        </span>
        
        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(prev => prev + 1)}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            page === totalPages 
              ? "bg-[#0d0e12] border border-gray-900 text-gray-600 cursor-not-allowed" 
              : "bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 active:scale-95"
          }`}
        >
          Next &rarr;
        </button>
      </div>

    </AdminLayout>
  );
}

export default UserProfiles;