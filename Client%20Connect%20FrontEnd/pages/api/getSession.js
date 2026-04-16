import { getSession } from "@auth0/nextjs-auth0";

// return access token
export default async function handler(req, res) {
  const session = await getSession(req, res);

  console.log(session);

  res.status(200).json({ session });
}
