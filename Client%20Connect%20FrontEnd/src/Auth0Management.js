import { ManagementClient } from "auth0";

const AUTH0_BACKEND_CLIENT_ID = process.env.AUTH0_CLIENT_ID_BACKEND || "";
const AUTH0_BACKEND_CLIENT_SECRET =
  process.env.AUTH0_CLIENT_SECRET_BACKEND || "";

export const management = new ManagementClient({
  domain: "cdasol.eu.auth0.com",
  clientId: AUTH0_BACKEND_CLIENT_ID,
  clientSecret: AUTH0_BACKEND_CLIENT_SECRET,
});
