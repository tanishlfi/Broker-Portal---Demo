import { Router } from "express";
import {
  BrokerCreateUser,
  allocateRoleToUser,
  createUser,
  deleteUserById,
  getAllBrokerUsers,
  getAllRoles,
  getAllUsers,
  getUserById,
  getUserByRole,
  getUserRoles,
  updateUserById,
} from "../controllers/auth0";

const router = Router();

// users routes
router.route("/auth0/allUsers").get(getAllUsers);
router.route("/auth0/user").post(createUser);
router
  .route("/auth0/user/:id")
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

// Roles routes

router.route("/auth0/roles/user/:id").get(getUserRoles).put(allocateRoleToUser);
router.route("/auth0/roles").get(getAllRoles);

router
  .route("/auth0/brokerUser/:brokerId")
  .get(getAllBrokerUsers)
  .post(BrokerCreateUser);
// router.route("/auth0/brokerUser/:id").get(getUserById).patch(updateUserById).delete(deleteUserById);

router.route("/auth0/getUsersByRole/:role").get(getUserByRole);

export default router;
