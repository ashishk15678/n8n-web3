"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useRef, useEffect } from "react";
import "@/app/globals.css";

// Icons
const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const EthIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
      fill="#627EEA"
    />
    <path d="M16.498 4V13.87L23.995 16.22L16.498 4Z" fill="#C0CBF6" />
    <path d="M16.498 4L9 16.22L16.498 13.87V4Z" fill="white" />
    <path d="M16.498 21.968V27.995L24 17.616L16.498 21.968Z" fill="#C0CBF6" />
    <path d="M16.498 27.995V21.967L9 17.616L16.498 27.995Z" fill="white" />
    <path
      d="M16.498 20.573L23.995 16.22L16.498 13.871V20.573Z"
      fill="#8197EE"
    />
    <path d="M9 16.22L16.498 20.573V13.871L9 16.22Z" fill="#C0CBF6" />
  </svg>
);

const SolanaIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.4 24C6.6 23.8 6.8 23.8 7 24L25.4 5.6C25.6 5.4 25.8 5.4 26 5.6L27.4 7C27.6 7.2 27.6 7.4 27.4 7.6L9 26C8.8 26.2 8.6 26.2 8.4 26L7 24.6C6.8 24.4 6.8 24.2 6.4 24Z"
      fill="#00FFA3"
    />
    <path
      d="M6.4 7.6C6.6 7.4 6.8 7.4 7 7.6L25.4 26C25.6 26.2 25.8 26.2 26 26L27.4 24.6C27.6 24.4 27.6 24.2 27.4 24L9 5.6C8.8 5.4 8.6 5.4 8.4 5.6L7 7C6.8 7.2 6.8 7.4 6.4 7.6Z"
      fill="#00FFA3"
    />
  </svg>
);

const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// Updated ConnectionStatus with glow effect
const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => (
  <div className="relative">
    <div
      className={`w-2 h-2 rounded-full ${
        isConnected ? "bg-green-500" : "bg-gray-300"
      }`}
    />
    {isConnected && (
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
    )}
  </div>
);

// Wallet Button Components
function EthConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
          <EthIcon />
          <span className="truncate font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <ConnectionStatus isConnected={isConnected} />
        </div>
        <button
          onClick={() => disconnect()}
          className="text-red-500 hover:text-red-600 text-sm px-4 py-1 hover:bg-red-50 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <EthIcon />
          <span>Connect {connector.name}</span>
        </button>
      ))}
    </div>
  );
}

function SolanaConnectButton() {
  const { publicKey, disconnect, connect, select, wallets } = useWallet();

  if (publicKey) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
          <SolanaIcon />
          <span className="truncate font-mono">
            {publicKey.toString().slice(0, 6)}...
            {publicKey.toString().slice(-4)}
          </span>
          <ConnectionStatus isConnected={!!publicKey} />
        </div>
        <button
          onClick={() => disconnect()}
          className="text-red-500 hover:text-red-600 text-sm px-4 py-1 hover:bg-red-50 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {wallets.map((wallet) => (
        <button
          key={wallet.adapter.name}
          onClick={() => {
            select(wallet.adapter.name);
            connect();
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <SolanaIcon />
          <span>Connect {wallet.adapter.name}</span>
        </button>
      ))}
    </div>
  );
}

export function WalletButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isConnected: isEthConnected } = useAccount();
  const { publicKey: solanaPublicKey } = useWallet();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="absolute z-100 top-2 right-2 group flex justify-end"
      ref={dropdownRef}
    >
      <div className="flex flex-col items-end">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white/10 backdrop-blur-sm rounded-full border border-gray-200/20 hover:bg-white/20 transition-all duration-200"
        >
          <div className="relative">
            <WalletIcon />
            {/* <div className="absolute -top-1 -right-1 flex gap-1">
              <ConnectionStatus isConnected={isEthConnected} />
              <ConnectionStatus isConnected={!!solanaPublicKey} />
            </div> */}
          </div>
          <ChevronDown />
        </button>

        {/* Hover Table */}
        <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-72">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
              Connected Wallets
            </div>
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <EthIcon />
                  <span className="text-sm font-medium">Ethereum</span>
                </div>
                <ConnectionStatus isConnected={isEthConnected} />
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <SolanaIcon />
                  <span className="text-sm font-medium">Solana</span>
                </div>
                <ConnectionStatus isConnected={!!solanaPublicKey} />
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
              Connect Wallet
            </div>
            <div className="p-2 space-y-4">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center gap-2">
                  <EthIcon />
                  <span>Ethereum</span>
                  <ConnectionStatus isConnected={isEthConnected} />
                </div>
                <EthConnectButton />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center gap-2">
                  <SolanaIcon />
                  <span>Solana</span>
                  <ConnectionStatus isConnected={!!solanaPublicKey} />
                </div>
                <SolanaConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
