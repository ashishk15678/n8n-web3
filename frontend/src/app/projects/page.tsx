"use client";
import {
  useCreateProject,
  useDeleteProject,
  useProject,
  useUser,
} from "@/server-store";
import { useState } from "react";
import {
  Clock,
  Play,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  Workflow,
  Activity,
  Calendar,
  Plus,
  X,
  Trash,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  FolderKanban,
} from "lucide-react";

// Helper function to get status color and icon
const getStatusInfo = (status: string) => {
  switch (status) {
    case "active":
      return {
        color: "text-emerald-500",
        bgColor: "bg-emerald-50",
        icon: <Play size={14} />,
        label: "Active",
      };
    case "paused":
      return {
        color: "text-amber-500",
        bgColor: "bg-amber-50",
        icon: <PauseCircle size={14} />,
        label: "Paused",
      };
    case "error":
      return {
        color: "text-red-500",
        bgColor: "bg-red-50",
        icon: <AlertCircle size={14} />,
        label: "Error",
      };
    default:
      return {
        color: "text-zinc-500",
        bgColor: "bg-zinc-50",
        icon: <Clock size={14} />,
        label: "Inactive",
      };
  }
};

// Helper function to format date
const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function ListProjects() {
  const { data: projectsData } = useProject();
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const { data: user } = useUser();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const { mutate: createProject } = useCreateProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "lastRun" | "status">(
    "lastRun"
  );

  // Mock data for demonstration - replace with real data from your backend
  const getProjectStats = (project: any) => ({
    status: project.nodes?.length > 0 ? "active" : "inactive",
    lastRun: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
    workflowCount: project.nodes?.length || 0,
    successRate: Math.floor(Math.random() * 100), // Random success rate
    executionCount: Math.floor(Math.random() * 1000), // Random execution count
  });

  const filteredProjects = projects
    .filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const statsA = getProjectStats(a);
      const statsB = getProjectStats(b);
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "lastRun":
          return statsB.lastRun.getTime() - statsA.lastRun.getTime();
        case "status":
          return statsA.status.localeCompare(statsB.status);
        default:
          return 0;
      }
    });

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        },
      });
    }
  };

  const handleCreateProject = () => {
    if (!user?.id || !newProjectName.trim()) return;

    createProject(
      {
        userId: user.id,
        project: {
          id: crypto.randomUUID(),
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
          // nodes: [],
          // edges: [],
          data: [],
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setNewProjectName("");
          setNewProjectDesc("");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Projects
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Manage your web3 automation workflows and monitor their
                  performance
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors duration-200"
              >
                <Plus size={16} className="mr-2" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-zinc-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg bg-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-10 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              >
                <option value="lastRun">Last Run</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown size={16} className="text-zinc-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project);
            const statusInfo = getStatusInfo(stats.status);

            return (
              <div
                key={project.id}
                onClick={() =>
                  (window.location.href = `/projects/${project.id}`)
                }
                className="group bg-white rounded-xl border border-zinc-200 hover:border-zinc-400 hover:inset-shadow-md 
                 transition-all duration-200 cursor-pointer "
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-zinc-900 truncate">
                        {project.name}
                      </h2>
                      {project.description && (
                        <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, project.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all duration-200 ml-2 flex-shrink-0"
                      title="Delete project"
                    >
                      <Trash size={16} className="text-red-500" />
                    </button>
                  </div>

                  {/* Status and Workflow Count */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`px-2.5 py-1 rounded-full ${statusInfo.bgColor} flex items-center gap-1.5`}
                    >
                      {statusInfo.icon}
                      <span
                        className={`text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Workflow size={14} />
                      <span className="text-xs font-medium">
                        {stats.workflowCount}{" "}
                        {stats.workflowCount === 1 ? "workflow" : "workflows"}
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                    <div>
                      <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">Last Run</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-900">
                        {formatDate(stats.lastRun)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <Activity size={14} />
                        <span className="text-xs font-medium">
                          Success Rate
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${stats.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-zinc-900 min-w-[3rem] text-right">
                          {stats.successRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Executions */}
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Clock size={14} />
                        <span className="text-xs font-medium">
                          Total Executions
                        </span>
                      </div>
                      <span className="text-sm font-medium text-zinc-900">
                        {stats.executionCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <FolderKanban size={24} className="text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-1">
              No projects found
            </h3>
            <p className="text-zinc-500 mb-6">
              {searchQuery
                ? "No projects match your search criteria"
                : "Get started by creating your first project"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
              >
                <Plus size={16} className="mr-2" />
                Create Project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw]">
            <div className="p-6 border-b border-zinc-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Create New Project
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors duration-200"
                >
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-sm"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent text-sm"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-white rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw]">
            <div className="p-6 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-900">
                Delete Project
              </h2>
            </div>
            <div className="p-6">
              <p className="text-zinc-600">
                Are you sure you want to delete this project? This action cannot
                be undone.
              </p>
            </div>
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-white rounded-lg transition-colors duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
