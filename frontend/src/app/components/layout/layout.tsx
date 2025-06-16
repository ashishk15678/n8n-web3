import React from "react";
import { LeftNavbar } from "./navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-zinc-50">
      <LeftNavbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
