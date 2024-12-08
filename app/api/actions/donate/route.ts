import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  ActionPostRequest,
  createPostResponse,
  ActionPostResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

// GET and OPTIONS are the same
export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    icon: new URL("/jingle_blinks.jpg", new URL(req.url).origin).toString(),
    label: "Donate me some SOL",
    description: "It's the season of giving :D",
    title: "Jingle Blinks",
    links: {
      actions: [
        {
          type: "post",
          href: "/api/actions/donate?amount=0.1",
          label: "0.1 SOL",
        },
        {
          type: "post",
          href: "/api/actions/donate?amount=0.5",
          label: "0.5 SOL",
        },
        {
          type: "post",
          href: "/api/actions/donate?amount=1.0",
          label: "1.0 SOL",
        },
        {
          type: "post",
          href: "/api/actions/donate?amount={amount}",
          label: "Send SOL", // button text
          parameters: [
            {
              name: "amount", // name template literal
              label: "Enter a SOL amount", // placeholder for the input
            },
          ],
        },
      ],
    },
  };
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};
export const OPTIONS = GET;

// POST request to donate SOL
export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      throw "Invalid 'account' provided. Its not a real pubkey";
    }

    let amount: number = 0.1;
    if (url.searchParams.has("amount")) {
      try {
        amount = parseFloat(url.searchParams.get("amount") || "0.1") || amount;
      } catch (err) {
        throw "Invalid 'amount' input";
      }
    }

    // we create a connection to the devnet
    const connection = new Connection(clusterApiUrl("devnet"));

    const TO_PUBKEY = new PublicKey(
      "EQb8LApPTtZFk3cY7WcaAmEvuL6s3Q1q8ozxcPcBJ5dc",
    ); // use your own pubkey here

    // we create a transaction to transfer the funds
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account,
        lamports: amount * LAMPORTS_PER_SOL,
        toPubkey: TO_PUBKEY,
      }),
    );

    transaction.feePayer = account;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: "Thanks for the gift! :)",
      },
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return Response.json(
      {
        message,
      },
      {
        headers: ACTIONS_CORS_HEADERS,
      },
    );
  }
};
