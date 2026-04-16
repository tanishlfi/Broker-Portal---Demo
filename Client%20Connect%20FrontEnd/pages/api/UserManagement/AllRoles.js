import { getSession } from "@auth0/nextjs-auth0";
import { management } from "../../../src/Auth0Management";

// return access token
export default async function GET(req, res) {
  try {
    const session = await getSession(req, res);

    let userRoles = session?.user?.rmaAppRoles;

    if (!userRoles.includes("CDA-RMA-User Admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const roles = await management.roles.getAll();

    return res.status(200).json({
      success: true,
      message: "All roles",
      data: roles,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
