import { getSession } from "@auth0/nextjs-auth0";
import { management } from "../../../src/Auth0Management";

// return access token
export default async function GET(req, res) {
  try {
    const session = await getSession(req, res);
    // console.log("Session:", session);

    let userRoles = session?.user?.rmaAppRoles;

    if (!userRoles.includes("CDA-RMA-User Admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const allUsers = [];
    let page = 0;
    while (true) {
      const {
        data: { users, total },
      } = await management.users.getAll({
        include_totals: true,
        page: page++,
      });
      allUsers.push(...users);
      if (allUsers.length === total) {
        break;
      }
    }
    return res.status(200).json({
      success: true,
      message: "All users",
      data: allUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
