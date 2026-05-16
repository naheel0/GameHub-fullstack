// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useAdmin } from "./contexts/AdminContext";
import {
  Crown,
  User,
  Ban,
  CheckCircle,
  Trash2,
  Users,
  Eye,
  X,
  Mail,
  Phone,
  ShoppingBag,
  MapPin,
  IndianRupee,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import SearchBar from "./components/SearchBar"; 
import StatusSwitch from './components/Switches';
import { BaseUrl, buildAuthHeaders } from "../../Services/api";
import { useAuth } from "../../contexts/AuthContext";

// Custom styled switches


const RoleSwitch = styled(Switch)(() => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    backgroundColor: '#374151',
    '&:before, &:after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#F59E0B',
    '&:hover': {
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#F59E0B',
  },
}));

export default function AdminUsers() {
  const { users, updateUser, deleteUser } = useAdmin();
  const { user: authUser } = useAuth();
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleViewUser = async (u) => {
    setSelectedUser(u);
    setDetailLoading(true);
    try {
      const res = await fetch(`${BaseUrl}/admin/adminusers/${u.id}`, {
        headers: { ...buildAuthHeaders(authUser?.accessToken) },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // Stored proc returns enum integers as strings ("0","1") — normalize them
        const roleMap = { "0": "user", "1": "admin" };
        const statusMap = { "0": "active", "1": "blocked" };
        setUserDetail({
          ...data,
          role: roleMap[data.role] ?? data.role?.toLowerCase() ?? "user",
          status: statusMap[data.status] ?? data.status?.toLowerCase() ?? "active",
        });
      }
    } catch { /* show basic info */ }
    setDetailLoading(false);
  };

  // Filter users based on searchTerm
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    return users.filter(user =>
      user.firstName?.toLowerCase().includes(searchTerm) ||
      user.lastName?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.phone?.includes(searchTerm) ||
      user.role?.toLowerCase().includes(searchTerm) ||
      user.status?.toLowerCase().includes(searchTerm)
    );
  }, [users, searchTerm]);

  const handleRoleChange = async (id, newRole) => {
    setUpdatingUserId(id);
    try {
      await updateUser(id, { role: newRole });
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingUserId(id);
    try {
      await updateUser(id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update user status:", error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const getStatusIcon = (status) => {
    const normalized = (status ?? "active").toLowerCase();
    return normalized === "active" ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <Ban className="w-4 h-4 text-red-400" />
    );
  };

  const getRoleIcon = (role) => {
    return role === "admin" ? (
      <Crown className="w-4 h-4 text-yellow-400" />
    ) : (
      <User className="w-4 h-4 text-blue-400" />
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };


  return (
    <div className="min-h-screen bg-black/70 backdrop-blur-md px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-3xl p-6 sm:p-8 w-full max-w-6xl mx-auto shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <Users className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  User Management
                </h2>
                <p className="text-sm text-gray-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
                </p>
              </div>
            </div>

            {/* Items Per Page Selector */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>per page</span>
            </div>
          </div>

          {/* SearchBar Component */}
          <SearchBar
            placeholder="Search users by name, email, phone, role, or status..."
            onSearch={setSearchTerm}
            className="px-3 py-3"
          />
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-2">
              Search results: {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'No users found matching your search' : 'No users found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-700/50">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="p-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      User
                    </th>
                    <th className="p-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="p-4 text-center text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-4 text-center text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      Role
                    </th>
                    <th className="p-4 text-center text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-700/50">
                  {currentUsers.map((u) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-800/30 transition-all duration-200 group"
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {u.firstName?.[0]}
                            {u.lastName?.[0]}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-gray-400 text-sm">
                              ID: {String(u.id).slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="text-gray-300">{u.email}</div>
                        {u.phone && (
                          <div className="text-gray-400 text-sm">{u.phone}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-3">
                          {getStatusIcon(u.status)}
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <StatusSwitch
                                  checked={u.status === "active"}
                                  onChange={(e) =>
                                    handleStatusChange(u.id, e.target.checked ? "active" : "blocked")
                                  }
                                  disabled={updatingUserId === u.id}
                                  size="small"
                                />
                              }
                              label={
                                <span className={`text-sm font-medium ${
                                  u.status === "active" ? "text-green-400" : "text-red-400"
                                }`}>
                                  {u.status === "active" ? "Active" : "Blocked"}
                                </span>
                              }
                              labelPlacement="start"
                              sx={{
                                margin: 0,
                                '& .MuiFormControlLabel-label': {
                                  marginLeft: 1,
                                }
                              }}
                            />
                          </FormGroup>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-3">
                          {getRoleIcon(u.role)}
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <RoleSwitch
                                  checked={u.role === "admin"}
                                  onChange={(e) =>
                                    handleRoleChange(u.id, e.target.checked ? "admin" : "user")
                                  }
                                  disabled={updatingUserId === u.id}
                                  size="small"
                                />
                              }
                              label={
                                <span className={`text-sm font-medium ${
                                  u.role === "admin" ? "text-yellow-400" : "text-blue-400"
                                }`}>{u.role === "admin" ? "Admin" : "User"}</span>
                              }
                              labelPlacement="start"
                              sx={{
                                margin: 0,
                                '& .MuiFormControlLabel-label': {
                                  marginLeft: 1,
                                }
                              }}
                            />
                          </FormGroup>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewUser(u)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={updatingUserId === u.id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 flex items-center gap-2 group"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-sm font-medium">Delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                <div className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition duration-200 ${
                      currentPage === 1
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    <ChevronLeftIcon className="h-6 w-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNumber, index) => (
                      <button
                        key={index}
                        onClick={() => typeof pageNumber === 'number' && goToPage(pageNumber)}
                        disabled={pageNumber === '...'}
                        className={`min-w-10 h-10 flex items-center justify-center rounded-lg transition duration-200 ${
                          pageNumber === currentPage
                            ? "bg-red-600 text-white"
                            : pageNumber === '...'
                            ? "text-gray-500 cursor-default"
                            : "bg-gray-700 hover:bg-gray-600 text-white"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition duration-200 ${
                      currentPage === totalPages
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    <ChevronRightIcon className="h-6 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading Overlay */}
        {updatingUserId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-3 border border-gray-700">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              <span className="text-white">Updating user...</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* User Detail Modal */}
      {selectedUser && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-gray-700/50 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${selectedUser.role === "admin" ? "text-yellow-400 border-yellow-500 bg-yellow-500/10" : "text-blue-400 border-blue-500 bg-blue-500/10"}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                <span className="text-gray-400">Loading details...</span>
              </div>
            ) : (() => {
              const d = userDetail || selectedUser;
              const status = (d.status ?? "active").toLowerCase();
              const role = (d.role ?? "user").toLowerCase();
              return (
                <div className="space-y-4">
                  {/* Info fields */}
                  <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 space-y-3">
                    <div className="flex items-center gap-3 text-gray-300">
                      <User className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-xs text-gray-500 w-20 shrink-0">User ID</span>
                      <span className="text-sm font-mono break-all">{d.id ?? selectedUser.id}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-xs text-gray-500 w-20 shrink-0">Email</span>
                      <span className="text-sm break-all">{d.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-xs text-gray-500 w-20 shrink-0">Phone</span>
                      <span className="text-sm">{d.phone || <span className="text-gray-600 italic">N/A</span>}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {role === "admin"
                        ? <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
                        : <User className="w-4 h-4 text-blue-400 shrink-0" />}
                      <span className="text-xs text-gray-500 w-20 shrink-0">Role</span>
                      <span className={`text-sm font-medium capitalize ${role === "admin" ? "text-yellow-400" : "text-blue-400"}`}>
                        {role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {status === "active"
                        ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                        : <Ban className="w-4 h-4 text-red-400 shrink-0" />}
                      <span className="text-xs text-gray-500 w-20 shrink-0">Status</span>
                      <span className={`text-sm font-medium capitalize ${status === "active" ? "text-green-400" : "text-red-400"}`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 text-center">
                      <ShoppingBag className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{d.orderCount ?? 0}</p>
                      <p className="text-xs text-gray-400 mt-1">Orders</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 text-center">
                      <MapPin className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-white">{d.addressCount ?? 0}</p>
                      <p className="text-xs text-gray-400 mt-1">Addresses</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 text-center">
                      <IndianRupee className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xl font-bold text-white">₹{(d.totalSpent ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">Spent</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
