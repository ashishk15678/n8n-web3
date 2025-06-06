"use client";

import "./globals.css";
import AllRoutes from "@/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WalletProviders } from "@/providers/WalletProvider";
import dynamic from "next/dynamic";
import EnvModal from "./components/env";
import { Toaster } from "sonner";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // donot remove this , helps passing serialized data to child client component , else NextJS
  // will not be able to pass data to client component
  const [queryClient] = useState(() => new QueryClient());

  const WalletButton = dynamic(
    () => import("@/wallets").then((mod) => mod.WalletButton),
    { ssr: false }
  );

  return (
    <html lang="en">
      <body>
        <title>n8n Web3</title>
        <meta
          name="description"
          content="n8n Web3 is a platform for building and deploying web3 applications , all through a single interface."
        />
        <WalletProviders>
          <WalletButton />
          <QueryClientProvider client={queryClient}>
            <AllRoutes />
            <EnvModal />
            <Toaster />
          </QueryClientProvider>
        </WalletProviders>
      </body>
    </html>
  );
}
