import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProject, useUser } from "@/server-store";
import { Project } from "@/generated/prisma";
import {
  FolderKanban,
  Settings,
  ChevronRight,
  Plus,
  Clock,
  FolderPlus,
  Trash,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useCreateProject, useDeleteProject } from "@/server-store";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  isExpanded: boolean;
}

const NavItem = ({
  icon,
  label,
  href,
  isActive,
  onClick,
  children,
  isExpanded,
}: NavItemProps) => {
  const [isItemExpanded, setIsItemExpanded] = useState(false);
  const location = useLocation();
  const isCurrentActive = location.pathname.startsWith(href);

  return (
    <div className="relative group">
      <Link
        to={href}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
          if (children) {
            e.preventDefault();
            setIsItemExpanded(!isItemExpanded);
          }
        }}
        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 rounded-lg
          ${
            isCurrentActive || isActive
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
      >
        <div className="w-5 h-5 flex-shrink-0">{icon}</div>
        {isExpanded && (
          <>
            <span className="flex-1 whitespace-nowrap">{label}</span>
            {children && (
              <ChevronRight
                size={16}
                className={`transition-transform duration-200 flex-shrink-0 ${
                  isItemExpanded ? "rotate-90" : ""
                }`}
              />
            )}
          </>
        )}
      </Link>

      {children && isItemExpanded && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">{children}</div>
      )}
    </div>
  );
};

export function LeftNavbar() {
  const { data: projectsData } = useProject();
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const { data: user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { mutate: createProject } = useCreateProject();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreateProject = () => {
    if (!user?.id || !newProjectName.trim()) return;

    createProject(
      {
        userId: user.id,
        project: {
          id: crypto.randomUUID(),
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
          nodes: [],
          edges: [],
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

  const handleDeleteProject = () => {
    if (!projectToDelete) return;
    deleteProject(projectToDelete, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
      },
    });
  };

  return (
    <div
      className={`h-screen bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 ease-in-out ${
        isExpanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-zinc-200 flex items-center justify-center">
        {isExpanded ? (
          <h1 className="text-xl font-semibold text-zinc-900">n8n-web3</h1>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
            <span className="text-sm font-medium text-white">n</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <NavItem
          icon={<FolderKanban size={20} />}
          label="Projects"
          href="/projects"
          isExpanded={isExpanded}
        >
          <div className="space-y-1">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                className="group/project flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-50"
              >
                <Link
                  to={`/projects/${project.id}`}
                  className="flex-1 text-sm text-zinc-600 hover:text-zinc-900 truncate"
                >
                  {project.name}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setProjectToDelete(project.id);
                    setIsDeleteModalOpen(true);
                  }}
                  className="opacity-0 group-hover/project:opacity-100 p-1 hover:bg-red-50 rounded"
                >
                  <Trash size={14} className="text-red-500" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg"
            >
              <FolderPlus size={16} />
              {isExpanded && <span>New Project</span>}
            </button>
          </div>
        </NavItem>

        <NavItem
          icon={<Clock size={20} />}
          label="Logs"
          href="/logs"
          isExpanded={isExpanded}
        />

        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          href="/settings"
          isExpanded={isExpanded}
        />
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-zinc-600">
              {user?.name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="w-full bg-zinc-900 text-white py-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <h2 className="text-lg font-semibold mb-4">Delete Project</h2>
            <p className="text-zinc-600 mb-6">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
