"use client";
import { useCreateProject, useProject, useUser } from "@/server-store";
import { X } from "lucide-react";
import { useState } from "react";
import { redirect } from "react-router";

export default function ListProjects() {
  const { data: projects } = useProject(undefined);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <h1>Projects</h1>

      <div className="flex flex-col w-full md:w-1/3 p-4 gap-4">
        {projects &&
          // @ts-ignore
          projects?.map((project) => (
            <div
              key={project.id}
              className="bg-zinc-100 p-4 rounded-lg cursor-pointer"
              onClick={() => (window.location.href = `/projects/${project.id}`)}
            >
              <h2>{project.name}</h2>
            </div>
          ))}

        <button
          className="bg-zinc-900 p-4 rounded-lg cursor-pointer text-white"
          onClick={() => setIsOpen(true)}
        >
          Create project
        </button>
      </div>
      {isOpen && <CreateProjectModal isOpen={isOpen} setIsOpen={setIsOpen} />}
    </div>
  );
}

export function CreateProjectModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  if (!isOpen) return null;
  const { data: user } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { mutate: createProject } = useCreateProject();

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
      <div className="bg-white p-4 rounded-lg border border-zinc-200 bg-zinc-100/40 w-1/4 shadow-xl shadow-zinc-200/80">
        <div className="flex justify-end">
          <X
            onClick={() => setIsOpen(false)}
            className="cursor-pointer"
            size={20}
          />
        </div>
        <h1 className="text-2xl font-bold">Create project</h1>
        <div className="flex flex-col gap-2 mt-4">
          <label htmlFor="project-name" className="text-sm">
            Project name
          </label>
          <input
            id="project-name"
            type="text"
            placeholder="Project name"
            className="w-full p-2 rounded-md bg-zinc-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <label htmlFor="project-description" className="text-sm">
            Project description
          </label>
          <textarea
            id="project-description"
            placeholder="Project description"
            className="w-full p-2 rounded-md bg-zinc-100"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          className="bg-zinc-100 p-2 rounded-md mt-6 w-full ring ring-zinc-200 hover:shadow-md active:bg-zinc-200 transition-all duration-200"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            try {
              if (name === "") {
                alert("Please enter a name");
                return;
              }
              if (description === "") {
                alert("Please enter a description");
                return;
              }

              if (!user?.id) {
                window.location.href = "/login";
                return;
              }

              createProject({
                userId: user?.id,
                project: {
                  id: crypto.randomUUID(),
                  name,
                  description,
                  nodes: [],
                  edges: [],
                  data: [],
                  userId: user?.id,
                },
              });
              setIsOpen(false);
            } catch (error) {
              console.error(error);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
