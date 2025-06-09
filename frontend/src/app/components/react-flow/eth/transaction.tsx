import { useEffect, useReducer, useRef, useState } from "react";
import { WrapperWithTrigger, Wrapper } from "../wrapper";
import { Input } from "../../env";
import { ethers } from "ethers";

type WalletType = "metamask" | "phantom" | null;
type ChainType = "ethereum" | "solana";

interface WalletState {
  type: WalletType;
  chain: ChainType;
  address: string | null;
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
}

export default function EthTransaction({ id }: { id: string }) {
  const [data, setData] = useReducer(
    (state: any, newState: any) => ({ ...state, ...newState }),
    {
      recipient: "",
      value: "",
      gasLimit: "",
    }
  );

  const [walletState, setWalletState] = useState<WalletState>({
    type: null,
    chain: "ethereum",
    address: null,
    provider: null,
    signer: null,
    isConnected: false,
  });

  // Initialize wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      // Check MetaMask
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            setWalletState({
              type: "metamask",
              chain: "ethereum",
              address: accounts[0],
              provider,
              signer,
              isConnected: true,
            });
            return;
          }
        } catch (error) {
          console.error("MetaMask connection error:", error);
        }
      }

      // Check Phantom
      if (window.solana?.isPhantom) {
        try {
          const resp = await window.solana.connect();
          if (resp.publicKey) {
            // For Solana, we'll need to handle differently
            setWalletState({
              type: "phantom",
              chain: "solana",
              address: resp.publicKey.toString(),
              provider: null, // We'll handle Solana differently
              signer: null,
              isConnected: true,
            });
            return;
          }
        } catch (error) {
          console.error("Phantom connection error:", error);
        }
      }
    };

    checkWalletConnection();

    // Setup event listeners
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        setWalletState((prev) => ({
          ...prev,
          isConnected: false,
          address: null,
        }));
      } else {
        // Account changed
        if (walletState.type === "metamask") {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setWalletState((prev) => ({
            ...prev,
            address: accounts[0],
            provider,
            signer,
            isConnected: true,
          }));
        }
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    const handleDisconnect = () => {
      setWalletState({
        type: null,
        chain: "ethereum",
        address: null,
        provider: null,
        signer: null,
        isConnected: false,
      });
    };

    // Add event listeners
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);
    }

    if (window.solana) {
      window.solana.on("disconnect", handleDisconnect);
      window.solana.on("accountChanged", (publicKey: any) => {
        if (publicKey) {
          setWalletState((prev) => ({
            ...prev,
            address: publicKey.toString(),
            isConnected: true,
          }));
        } else {
          handleDisconnect();
        }
      });
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }
      if (window.solana) {
        window.solana.removeListener("disconnect", handleDisconnect);
        window.solana.removeListener("accountChanged", () => {});
      }
    };
  }, []);

  const connectWallet = async (type: WalletType) => {
    try {
      if (type === "metamask" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setWalletState({
          type: "metamask",
          chain: "ethereum",
          address: accounts[0],
          provider,
          signer,
          isConnected: true,
        });
      } else if (type === "phantom" && window.solana?.isPhantom) {
        const resp = await window.solana.connect();
        setWalletState({
          type: "phantom",
          chain: "solana",
          address: resp.publicKey.toString(),
          provider: null,
          signer: null,
          isConnected: true,
        });
      }
    } catch (error) {
      console.error(`Failed to connect to ${type}:`, error);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (walletState.type === "metamask" && window.ethereum) {
        // MetaMask doesn't have a disconnect method, we just clear the state
        setWalletState({
          type: null,
          chain: "ethereum",
          address: null,
          provider: null,
          signer: null,
          isConnected: false,
        });
      } else if (walletState.type === "phantom" && window.solana) {
        await window.solana.disconnect();
        setWalletState({
          type: null,
          chain: "solana",
          address: null,
          provider: null,
          signer: null,
          isConnected: false,
        });
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const ref = useRef<HTMLButtonElement>(null);
  if (ref.current) {
    ref.current.onclick = async () => {
      const error = document.getElementById("errorEthTransaction");
      if (!error) return;

      if (!walletState.isConnected) {
        error.textContent = "Please connect your wallet first";
        return;
      }

      if (!data.recipient || !data.value) {
        error.textContent = "Recipient and value are required";
        return;
      }

      try {
        if (walletState.type === "metamask" && walletState.signer) {
          const gasPrice = await walletState.provider?.getFeeData();

          const transaction = {
            to: data.recipient,
            value: ethers.parseEther(data.value),
            gasLimit: data.gasLimit || 21000,
            gasPrice: gasPrice?.gasPrice || undefined,
          };

          const tx = await walletState.signer.sendTransaction(transaction);
          console.log("Transaction sent:", tx.hash);

          const receipt = await tx.wait();
          console.log("Transaction mined:", receipt);

          error.textContent = "Transaction successful!";
          error.className = "text-sm text-green-500 font-bold";
        } else if (walletState.type === "phantom") {
          // Handle Solana transaction
          error.textContent = "Solana transactions not implemented yet";
          error.className = "text-sm text-yellow-500 font-bold";
        }
      } catch (err: any) {
        console.error("Transaction failed:", err);
        error.textContent = err.message || "Transaction failed";
        error.className = "text-sm text-red-500 font-bold";
      }
    };
  }

  return (
    <div className="bg-white rounded-md p-4 ring ring-zinc-200 shadow-md">
      <Wrapper id={id}>
        {/* @ts-ignore */}
        <WrapperWithTrigger id={id} ref={ref}>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">
                {walletState.chain === "ethereum"
                  ? "Send ETH Transaction"
                  : "Send SOL Transaction"}
              </span>
              {walletState.isConnected ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">
                    {walletState.address?.slice(0, 6)}...
                    {walletState.address?.slice(-4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => connectWallet("metamask")}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Connect MetaMask
                  </button>
                  <button
                    onClick={() => connectWallet("phantom")}
                    className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                  >
                    Connect Phantom
                  </button>
                </div>
              )}
            </div>

            {walletState.isConnected && (
              <>
                <div>
                  <label htmlFor="recipient" className="text-sm text-zinc-400">
                    Recipient Address
                  </label>
                  <Input
                    props={{ type: "text", id: "recipient" }}
                    onChange={(e) => setData({ recipient: e.target.value })}
                    value={data.recipient}
                    placeholder={
                      walletState.chain === "ethereum"
                        ? "0x..."
                        : "Solana address..."
                    }
                  />
                </div>

                <div>
                  <label htmlFor="value" className="text-sm text-zinc-400">
                    Amount ({walletState.chain === "ethereum" ? "ETH" : "SOL"})
                  </label>
                  <Input
                    props={{
                      type: "number",
                      id: "value",
                      step: "0.000000000000000001",
                    }}
                    onChange={(e) => setData({ value: e.target.value })}
                    value={data.value}
                    placeholder="0.0"
                  />
                </div>

                {walletState.chain === "ethereum" && (
                  <div>
                    <label htmlFor="gasLimit" className="text-sm text-zinc-400">
                      Gas Limit (optional)
                    </label>
                    <Input
                      props={{ type: "number", id: "gasLimit" }}
                      onChange={(e) => setData({ gasLimit: e.target.value })}
                      value={data.gasLimit}
                      placeholder="21000"
                    />
                  </div>
                )}
              </>
            )}

            <p
              className="text-sm text-red-500 font-bold"
              id="errorEthTransaction"
            ></p>
          </div>
        </WrapperWithTrigger>
      </Wrapper>
    </div>
  );
}
