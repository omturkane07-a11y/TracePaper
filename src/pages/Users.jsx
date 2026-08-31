import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Power,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/users";

export default function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "investigator",
    phone: "",
    department: "",
  });

  // ============================================
  // FETCH USERS
  // ============================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      if (response.data.status === "success") {
        setUsers(response.data.users || []);
      }

    } catch (err) {
      console.error("Users loading error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ============================================
  // FILTER USERS
  // ============================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = search.toLowerCase();

      const matchesSearch =
        user.full_name?.toLowerCase().includes(text) ||
        user.email?.toLowerCase().includes(text);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  // ============================================
  // FORM
  // ============================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openAddModal = () => {
    setEditingUser(null);

    setForm({
      full_name: "",
      email: "",
      password: "",
      role: "investigator",
      phone: "",
      department: "",
    });

    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      role: user.role || "investigator",
      phone: user.phone || "",
      department: user.department || "",
    });

    setShowModal(true);
  };

  // ============================================
  // SAVE USER
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await axios.put(
          `${API_URL}/${editingUser.id}`,
          {
            full_name: form.full_name,
            email: form.email,
            role: form.role,
            phone: form.phone,
            department: form.department,
          }
        );
      } else {
        await axios.post(API_URL, form);
      }

      setShowModal(false);
      fetchUsers();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to save user"
      );
    }
  };

  // ============================================
  // STATUS
  // ============================================

  const toggleStatus = async (user) => {
    try {
      await axios.patch(
        `${API_URL}/${user.id}/status`,
        {
          is_active: !user.is_active,
        }
      );

      fetchUsers();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to update user status"
      );
    }
  };

  // ============================================
  // DELETE
  // ============================================

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete user "${user.full_name}"?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/${user.id}`
      );

      fetchUsers();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to delete user"
      );
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Users
          </h1>

          <p className="text-slate-500 mt-2">
            Manage application users here.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
        >
          <UserPlus size={18} />
          Add User
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* USERS CARD */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        {/* TOP */}

        <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Application Users
            </h2>

            <p className="text-slate-500 mt-1">
              Users registered in TracePaper.
            </p>
          </div>

          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold">
            {filteredUsers.length} Users
          </div>

        </div>

        {/* FILTERS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="border border-slate-200 rounded-xl px-4 py-2.5 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="investigator">Investigator</option>
            <option value="exam_board">Exam Board</option>
            <option value="exam_center">Exam Center</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border border-slate-200 rounded-xl px-4 py-2.5 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b text-slate-500">

                  <th className="pb-3">ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="py-4 font-semibold">
                      {user.id}
                    </td>

                    <td className="font-semibold">
                      {user.full_name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {user.role}
                      </span>

                    </td>

                    <td>
                      {user.department || "-"}
                    </td>

                    <td>

                      <span
                        className={
                          user.is_active
                            ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"
                            : "bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold"
                        }
                      >
                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td>
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            openEditModal(user)
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                          title="Edit"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() =>
                            toggleStatus(user)
                          }
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                          title={
                            user.is_active
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          <Power size={17} />
                        </button>

                        <button
                          onClick={() =>
                            deleteUser(user)
                          }
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ============================================
          ADD / EDIT MODAL
      ============================================ */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-bold">
                {editingUser
                  ? "Edit User"
                  : "Add User"}
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="text-slate-500 hover:text-red-500"
              >
                <X />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <input
                name="full_name"
                placeholder="Full Name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3"
              />

              {!editingUser && (
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3"
                />
              )}

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="investigator">
                  Investigator
                </option>
                <option value="admin">
                  Admin
                </option>
                <option value="exam_board">
                  Exam Board
                </option>
                <option value="exam_center">
                  Exam Center
                </option>
                <option value="viewer">
                  Viewer
                </option>
              </select>

              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                {editingUser
                  ? "Update User"
                  : "Create User"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}