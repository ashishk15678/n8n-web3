"use client";

import "@/app/globals.css";
import { useProject } from "@/store";
import { useParams } from "react-router";
import { useEffect } from "react";

// This is the actual page component that Next.js expects
export default function ProjectRoute() {
  const { projectId } = useParams();
  return <ProjectPageContent projectId={projectId as string} />;
}

// This is the component that accepts props
function ProjectPageContent({ projectId }: { projectId: string }) {
  const { project, setProject } = useProject();

  useEffect(() => {
    if (!project || project.id !== projectId) {
    }
  }, [projectId, project, setProject]);

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-red-500">
      <h1>ProjectPage</h1>
      <p>Project ID: {projectId}</p>
      <p>Project Name: {project.name}</p>
      <p>Description: {project.description}</p>
    </div>
  );
}
