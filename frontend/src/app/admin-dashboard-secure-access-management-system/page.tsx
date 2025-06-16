"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Settings,
  Shield,
  Activity,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  UserPlus,
  Mail,
  Lock,
  Globe,
  Calendar,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  status: "active" | "suspended" | "pending";
  role: "user" | "admin";
  projectCount: number;
  workflowCount: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  totalProjects: number;
  totalWorkflows: number;
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }[];
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  // Fetch admin stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  // Filter and sort users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(user.status);
    const matchesRole =
      roleFilter.length === 0 || roleFilter.includes(user.role);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const sortedUsers = filteredUsers?.sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? (a.name || "").localeCompare(b.name || "")
        : (b.name || "").localeCompare(a.name || "");
    } else if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return sortOrder === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
  });

  if (isLoadingUsers || isLoadingStats) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Manage users, monitor activity, and configure system settings
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors duration-200">
                  <UserPlus size={16} className="mr-2" />
                  Add User
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-zinc-200 text-sm font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors duration-200">
                  <Settings size={16} className="mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Total Users</p>
                <p className="text-2xl font-semibold text-zinc-900 mt-1">
                  {stats?.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Users size={24} className="text-zinc-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-medium">
                {stats?.activeUsers} active
              </span>
              <span className="mx-2 text-zinc-300">•</span>
              <span className="text-zinc-500">
                {stats?.pendingUsers} pending
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Total Projects
                </p>
                <p className="text-2xl font-semibold text-zinc-900 mt-1">
                  {stats?.totalProjects}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Globe size={24} className="text-zinc-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-zinc-500">
                Across {stats?.totalUsers} users
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Total Workflows
                </p>
                <p className="text-2xl font-semibold text-zinc-900 mt-1">
                  {stats?.totalWorkflows}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Activity size={24} className="text-zinc-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-zinc-500">
                Active workflows in the system
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  System Status
                </p>
                <p className="text-2xl font-semibold text-emerald-600 mt-1">
                  Healthy
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Shield size={24} className="text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-medium">
                All systems operational
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-zinc-200">
          {/* Table Header */}
          <div className="p-6 border-b border-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-zinc-400" />
                  <select
                    value={statusFilter.join(",")}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value ? e.target.value.split(",") : []
                      )
                    }
                    className="px-3 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-zinc-400" />
                  <select
                    value={roleFilter.join(",")}
                    onChange={(e) =>
                      setRoleFilter(
                        e.target.value ? e.target.value.split(",") : []
                      )
                    }
                    className="px-3 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split("-");
                      setSortBy(by as "name" | "date" | "status");
                      setSortOrder(order as "asc" | "desc");
                    }}
                    className="px-3 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="status-asc">Status A-Z</option>
                    <option value="status-desc">Status Z-A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {sortedUsers?.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                          {user.name ? (
                            <span className="text-sm font-medium text-zinc-600">
                              {user.name[0].toUpperCase()}
                            </span>
                          ) : (
                            <Users size={20} className="text-zinc-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-zinc-900">
                            {user.name || "Unnamed User"}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : user.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.status === "active" ? (
                          <CheckCircle2 size={12} className="mr-1" />
                        ) : user.status === "suspended" ? (
                          <XCircle size={12} className="mr-1" />
                        ) : (
                          <AlertCircle size={12} className="mr-1" />
                        )}
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-zinc-100 text-zinc-800"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield size={12} className="mr-1" />
                        ) : (
                          <Users size={12} className="mr-1" />
                        )}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {user.projectCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-zinc-400 hover:text-zinc-500">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-500">
                Showing {sortedUsers?.length} of {users?.length} users
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent">
                  Previous
                </button>
                <button className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-zinc-900 mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-200">
            {stats?.recentActivity.map((activity, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    {activity.type === "user" ? (
                      <Users size={16} className="text-zinc-600" />
                    ) : activity.type === "project" ? (
                      <Globe size={16} className="text-zinc-600" />
                    ) : activity.type === "workflow" ? (
                      <Activity size={16} className="text-zinc-600" />
                    ) : (
                      <Settings size={16} className="text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900">
                      {activity.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
