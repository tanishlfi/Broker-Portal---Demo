import { getSession } from "@auth0/nextjs-auth0";
import { management } from "../../../../src/Auth0Management";

// return access token
export default async function GET(req, res) {
  try {
    const session = await getSession(req, res);

    let userRoles = session?.user?.rmaAppRoles;

    const { id } = req.query;

    if (!userRoles.includes("CDA-RMA-User Admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let user = await management.users.get({ id });

    const roles = await management.users.getRoles({ id });

    user.data["roles"] = roles.data;

    // console.log(user.data);

    return res.status(200).json({
      success: true,
      message: "All users",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
