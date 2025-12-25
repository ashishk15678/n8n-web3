import AppHeader from "@/components/custom/app-header";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<>Loading...</>}>
        <AppHeader />
        <main>{children}</main>
      </Suspense>
    </>
  );
}
