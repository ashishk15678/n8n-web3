import { useEffect, useRef, useState } from "react";
import { WrapperWithTrigger } from "./wrapper";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  generateKeyPairSigner,
  lamports,
} from "@solana/kit";
import config from "../../../../config.json";

export function DeployContract({ id }: { id: string }) {
  const [contractCode, setContractCode] = useState("");

  const rpc = createSolanaRpc(
    config.Web3.Solana.provider || "https://api.devnet.solana.com"
  );
  const rpcSubscription = createSolanaRpcSubscriptions(
    config.Web3.Solana.rpcSubscription || "wss://api.devnet.solana.com"
  );

  // initialisation
  useEffect(() => {
    (async function () {
      const senderKeypair = await generateKeyPairSigner();
      const reciepeint = await generateKeyPairSigner();

      const LAMPORTS_PER_SOL = BigInt(1000000000);
      const transferAmount = lamports(LAMPORTS_PER_SOL / BigInt(10));
    })();
  }, []);

  const ref = useRef<HTMLButtonElement>(null);
  if (ref.current) {
    ref.current.onclick = () => {
      console.log(contractCode);
    };
  }
  return (
    <>
      {/* @ts-ignore */}
      <WrapperWithTrigger ref={ref} id={id}>
        <div>
          <h1>Deploy Contract</h1>

          <textarea
            className="w-full h-full"
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
          />
        </div>
      </WrapperWithTrigger>
    </>
  );
}
