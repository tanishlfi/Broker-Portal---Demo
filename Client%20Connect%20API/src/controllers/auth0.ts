import { logger } from "@azure/storage-blob";
import { AuthenticationClient, ManagementClient } from "auth0";
import axios from "axios";
import { Request, Response } from "express";

const AUTH0_BACKEND_DOMAIN = process.env.AUTH0_URL || "";
const AUTH0_BACKEND_CLIENT_ID = process.env.AUTH0_CLIENT_ID || "";
const AUTH0_BACKEND_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || "";

var management = new ManagementClient({
  domain: "cdasol.eu.auth0.com",
  clientId: AUTH0_BACKEND_CLIENT_ID,
  clientSecret: AUTH0_BACKEND_CLIENT_SECRET,
});

const auth = new AuthenticationClient({
  domain: "cdasol.eu.auth0.com",
  clientId: AUTH0_BACKEND_CLIENT_ID,
  clientSecret: AUTH0_BACKEND_CLIENT_SECRET,
});

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // let token = req.app.get("auth0Token");

    // let config = {
    //   method: "get",
    //   maxBodyLength: Infinity,
    //   url: "https://login.auth0.com/api/v2/users",
    //   headers: {
    //     Accept: "application/json",
    //     Authorization: `Bearer ${req.app.get("auth0Token")}`,
    //   },
    // };

    // const allUsers = await axios.request(config);

    // console.log(
    //   "////////////////////////////////////////////////////////",
    //   allUsers,
    // );

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
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let user: any = await management.users.get({ id });

    const roles = await management.users.getRoles({ id });

    // get user meta_data

    user.data["roles"] = roles.data;

    console.log(user.data);

    return res.status(200).json({
      success: true,
      message: "User",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await management.users.delete({ id });

    return res.status(200).json({
      success: true,
      message: "User deleted",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await management.users.update({ id }, req.body);

    return res.status(200).json({
      success: true,
      message: "User updated",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await management.users.create(req.body);

    console.log(user);

    // const sendEmail = await management.jobs.verifyEmail({
    //   user_id: user?.user_id,
    //   client_id: AUTH0_BACKEND_CLIENT_ID,
    // });

    return res.status(200).json({
      success: true,
      message: "User created",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await management.roles.getAll();

    return res.status(200).json({
      success: true,
      message: "All roles",
      data: roles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = await management.roles.get({ id });

    return res.status(200).json({
      success: true,
      message: "Role",
      data: role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const deleteRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = await management.roles.delete({ id });

    return res.status(200).json({
      success: true,
      message: "Role deleted",
      data: role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const updateRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = await management.roles.update({ id }, req.body);

    return res.status(200).json({
      success: true,
      message: "Role updated",
      data: role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await management.roles.create(req.body);

    return res.status(200).json({
      success: true,
      message: "Role created",
      data: role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const roles = await management.users.getRoles({ id });

    return res.status(200).json({
      success: true,
      message: "User roles",
      data: roles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const allocateRoleToUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const roles = await management.users.assignRoles({ id }, req.body);

    return res.status(200).json({
      success: true,
      message: "Role allocated to user",
      data: roles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

export const getAllBrokerUsers = async (req: Request, res: Response) => {
  try {
    const { brokerId } = req.params;

    const { data } = await management.users.getAll({
      q: `user_metadata.BrokerageIds:${brokerId}`,
    });

    return res.status(200).json({
      success: true,
      message: "All broker users",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

export const BrokerCreateUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      name,
      verify_email,
      email_verified,
      connection,
      user_metadata,
      app_metadata,
      roles,
    } = req.body;

    const user = await management.users.create({
      email,
      name,
      verify_email,
      email_verified,
      connection,
      user_metadata,
      app_metadata,
    });

    const assignRoles = await management.users.assignRoles(
      { id: user.data.user_id },
      { roles: roles },
    );

    return res.status(200).json({
      success: true,
      message: "User created",
      data: { ...user, roles: assignRoles },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

export const getUserByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;

    const { data } = await management.roles.getUsers({
      id: role,
    });

    return res.status(200).json({
      success: true,
      message: "All users in role",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
