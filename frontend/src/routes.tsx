"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import NotFound from "@/app/not-found";
import ProjectRoute from "@/app/projects/[projectId]/page";
import { useProject, useUser } from "@/store";
import { authClient } from "./lib/auth";
import SignIn from "./app/components/auth-comp";
import { User } from "./generated/prisma";

const LandingPage = dynamic(() => import("@/app/page"), { ssr: false });

export default function AllRoutes() {
  const [mounted, setMounted] = useState(false);
  const { setUser } = useUser();
  const { useSession } = authClient;
  const session = useSession.get();

  useEffect(() => {
    setMounted(true);
    console.log("Session state:", {
      isPending: session.isPending,
      hasData: !!session.data,
      hasUser: !!session.data?.user,
      error: session.error,
    });
  }, [session]);

  useEffect(() => {
    if (session.data?.user) {
      setUser(session.data.user as User);
    }
  }, [session.data?.user, setUser]);

  if (!mounted) return null;

  if (session.isPending) {
    console.log("Session is pending, checking auth...");
    return <div>Loading session...</div>;
  }

  if (session.error) {
    console.error("Session error:", session.error);
    return <div>Error loading session</div>;
  }

  const protectedRoutes = [
    {
      path: "/projects/:projectId",
      element: <ProjectRoute />,
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
            element={session.data?.user ? route.element : <SignIn />}
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
