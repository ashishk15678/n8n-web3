"use client";
import { authClient } from "@/lib/auth";
import { useCreateProject, useProject } from "@/server-store";
import { useNavigate } from "react-router-dom";
import { useProject as getProject } from "@/store";

export default function LandingPage() {
  const { useSession } = authClient;
  const { mutate: createProject } = useCreateProject();
  const { data: projects } = useProject(
    useSession.get().data?.user.id as string
  );
  const navigate = useNavigate();
  const { setProject } = getProject();
  return (
    <div>
      <pre>{JSON.stringify(useSession.get().data, null, 2)}</pre>
      <button
        onClick={() => {
          createProject({
            userId: useSession.get().data?.user.id as string,
            project: {
              userId: useSession.get().data?.user.id as string,
              name: "Test Project",
              description: "Test Description",
              id: crypto.randomUUID(),
            },
          });
        }}
        className="bg-blue-500 text-white p-2 rounded-md"
      >
        Create Project
      </button>

      <p className="text-2xl font-bold">All projects</p>
      <div className="flex flex-col gap-4">
        {projects?.map((project) => (
          <button
            key={project.id}
            onClick={() => {
              setProject(project);
              navigate(`/projects/${project.id}`);
            }}
            className="w-full text-left bg-gray-100 hover:bg-gray-200 rounded-md p-4"
          >
            <p>{project.name}</p>
            <p>{project.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
