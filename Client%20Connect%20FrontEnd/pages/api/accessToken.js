import { getAccessToken } from "@auth0/nextjs-auth0";

// return access token
export default async function handler(req, res) {
  try {
    // Set no-cache headers
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const { accessToken } = await getAccessToken(req, res);

    res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
