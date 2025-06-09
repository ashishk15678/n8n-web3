"use client";

import "@/app/globals.css";
import { Navigate, useParams } from "react-router";
import React, { Suspense } from "react";
import "@xyflow/react/dist/style.css";
import { ProjectPageContent } from "./main";

export default function ProjectRoute() {
  const { projectId } = useParams();
  if (!projectId) {
    return Navigate({ to: "/signin" });
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectPageContent projectId={projectId as string} />
    </Suspense>
  );
}
