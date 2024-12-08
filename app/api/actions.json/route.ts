import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

// https://solana.com/docs/advanced/actions#actionsjson
export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/now",
        apiPath: "/api/actions/donate",
      },
    ],
  };
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};
export const OPTIONS = GET;
