import { getSession } from "@auth0/nextjs-auth0";
import { management } from "../../../src/Auth0Management";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const session = await getSession(req, res);
    const { user_id, module, updates } = req.body;

    if (!user_id || !module || !updates) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userRoles = session?.user?.rmaAppRoles || [];

    if (!userRoles.includes("CDA-RMA-User Admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch current user
    const { data: existingUser } = await management.users.get({ id: user_id });

    const existingModules = existingUser.user_metadata?.Modules || [];

    // Update logic for Modules array
    const updatedModules = [...existingModules];
    const moduleIndex = updatedModules.findIndex((m) => m[module]);

    if (moduleIndex > -1) {
      // Module exists
      updatedModules[moduleIndex] = {
        [module]: {
          ...updatedModules[moduleIndex][module],
          ...updates,
        },
      };
    } else {
      // Module doesn't exist, push a new one
      updatedModules.push({
        [module]: {
          ...updates,
        },
      });
    }

    // Send update to Auth0
    const updatedUser = await management.users.update(
      { id: user_id },
      {
        user_metadata: {
          Modules: updatedModules,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "User metadata updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Metadata update error:", error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}
