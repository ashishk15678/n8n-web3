import { generateKeyPairSigner } from "@solana/kit";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

export const sendSol = async () =>
  //   senderKeypair: Keypair,
  //   reciepeint: Keypair,
  //   amount: number
  {
    try {
      const senderKeypair = await new Keypair();
      const reciepeint = "6cBaf093FFE0A3266192858e1FCD63ce3f8c9fa9";
      const amount = 1;

      const signature = await connection.requestAirdrop(
        senderKeypair.publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction({
        signature,
        ...(await connection.getLatestBlockhash()),
      });

      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: new PublicKey(Buffer.from(reciepeint, "hex")),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      const tx = await connection.sendTransaction(transaction, [senderKeypair]);
      return tx;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
