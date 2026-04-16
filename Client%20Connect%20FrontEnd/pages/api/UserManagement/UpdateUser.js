import { getSession } from "@auth0/nextjs-auth0";
import { management } from "../../../src/Auth0Management";

// return access token
export default async function POST(req, res) {
  try {
    const session = await getSession(req, res);

    const { user_id } = req.body;

    let userRoles = session?.user?.rmaAppRoles;

    if (!userRoles.includes("CDA-RMA-User Admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // update user roles

    const user = await management.users.update({ id: user_id }, req.body);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
