import { getSession } from "@auth0/nextjs-auth0";
import { management } from "../../../src/Auth0Management";

// return access token
export default async function POST(req, res) {
  try {
    const session = await getSession(req, res);

    const { id, roles } = req.body;

    let userRoles = session?.user?.rmaAppRoles;

    if (!userRoles.includes("CDA-RMA-User Admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch current roles of the user
    const currentRoles = await management.users.getRoles({ id });

    console.log("currentRoles", currentRoles.data);

    if (currentRoles.data.length > 0) {
      // Extract role IDs
      const roleIds = currentRoles.data.map((role) => role.id);

      // Remove all current roles
      await management.users.deleteRoles({ id }, { roles: roleIds });
    }

    // Assign new roles
    await management.users.assignRoles({ id }, { roles });

    return res.status(200).json({
      success: true,
      message: "Roles updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
