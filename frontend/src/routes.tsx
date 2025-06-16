"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import NotFound from "@/app/not-found";
import ProjectRoute from "@/app/projects/[projectId]/page";
import { authClient } from "./lib/auth";
import SignIn from "./app/components/auth-comp";
import { User } from "./generated/prisma";
import { useUser } from "./server-store";
import ListProjects from "./app/projects/page";
import { Layout } from "./app/components/layout/layout";
import SettingsPage from "./app/settings/page";
import LogsPage from "./app/logs/page";
import AdminDashboard from "./app/admin-dashboard-secure-access-management-system/page";

const LandingPage = dynamic(() => import("@/app/page"), { ssr: false });

export default function AllRoutes() {
  const [mounted, setMounted] = useState(false);
  const { data: user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const protectedRoutes = [
    {
      path: "/projects/:projectId",
      element: <ProjectRoute />,
    },
    {
      path: "/projects",
      element: <ListProjects />,
    },
    {
      path: "/logs",
      element: <LogsPage />,
    },
    {
      path: "/settings",
      element: <SettingsPage />,
    },
    {
      path: "/admin-dashboard-secure-access-management-system",
      element: <AdminDashboard />,
    },
  ];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={user ? <Layout>{route.element}</Layout> : <SignIn />}
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
