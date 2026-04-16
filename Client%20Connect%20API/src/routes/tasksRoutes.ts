import { Router } from "express";
import {
  DeleteTask,
  GetAllTasks,
  GetTask,
  GetTasksByCreated,
  UpdateTask,
  createTask,
  getTaskByAssignee,
  uploadTaskDocument,
} from "../controllers/TaskManager";

const router = Router();

// set routes
router
  .route("/tasks/:taskId")
  .get(GetTask)
  .patch(UpdateTask)
  .delete(DeleteTask)
  .post(uploadTaskDocument);

router.route("/tasks").post(createTask).get(GetAllTasks);

router.route("/tasks/assignee/:assignee").get(getTaskByAssignee);

router.route("/tasks/createdBy/:createdBy").get(GetTasksByCreated);

export default router;
