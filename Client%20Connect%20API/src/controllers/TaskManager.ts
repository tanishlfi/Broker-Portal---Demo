import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { UUIDV4 } from "sequelize";
import { uploadFileAZ } from "../utils/azure_storage";

const { tasks, tasksDocuments } = require("../models");

import * as yup from "yup";
import { CreateNotification } from "../utils/CreateNotification";

const taskBodySchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  body: yup.array().of(yup.object()).required("Body is required"),
  status: yup.string().required("Status is required"),
  priority: yup.string().required("Priority is required"),
  createdBy: yup.string().required("Created by is required"),
});

interface TaskBody {
  title: string;
  description: string;
  body: any[];
  assignee: string;
  dueDate: string; // or Date if you prefer to work with Date objects
  status: string;
  priority: "info" | "success" | "warning" | "error";
  createdBy: string;
  brokerId: number;
  schemeId: number;
}

export const createTask = async (req: Request, res: Response) => {
  try {
    // Manually structure the data to match TaskBody
    const taskBody: TaskBody = {
      title: req.body.title,
      description: req.body.description,
      body: JSON.parse(req.body.body), // Assuming body is a JSON string
      assignee: req.body.assignee,
      dueDate: req.body.dueDate,
      status: req.body.status,
      priority: req.body.priority,
      createdBy: req.body.createdBy,
      brokerId: parseInt(req.body.brokerId),
      schemeId: parseInt(req.body.schemeId),
    };

    // Validate the structured data
    await taskBodySchema.validate(taskBody);
    // Create the task
    const task = await tasks.create(taskBody, { returning: true });
    // Upload the files

    let createdFile: any;

    if (req.files) {
      const { file } = req?.files;
      const { name: orgFile, data } = file as UploadedFile;
      const { documentType } = req.body;

      const fileName = `${UUIDV4()}.${orgFile.split(".").pop()}`;
      const upload: boolean = await uploadFileAZ(
        String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
        String(process.env.RMA_SUPPORTDOCS_AZ_BLOB),
        fileName,
        data,
      );

      if (!upload) {
        throw new Error("Unable to upload file");
      }

      createdFile = await tasksDocuments.create(
        {
          fileName: fileName,
          documentType: "Task Document",
          orgFileName: orgFile,
          taskId: task.id,
        },
        { returning: true },
      );
    }

    await CreateNotification({
      from_user_email: taskBody.createdBy,
      to_user_email: taskBody.assignee,
      variant: "app",
      title: "New Task",
      message: `You have been assigned a new task: ${taskBody.title}`,
      type: taskBody.priority,
      read: false,
      link: `/Tasks/${task.id}`,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: {
        ...task.dataValues,
        file: createdFile,
      },
    });
  } catch (error: any) {
    console.error("Error creating brokerage:", error);
    const errorMessage =
      error instanceof yup.ValidationError
        ? error.message
        : "Internal Server Error";
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const GetAllTasks = async (req: Request, res: Response) => {
  try {
    const tasksList = await tasks.findAll({
      include: [
        {
          model: tasksDocuments,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasksList,
    });
  } catch (error: any) {
    console.error("Error retrieving tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const GetTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = await tasks.findOne({
      where: {
        id: taskId,
      },
      include: [
        {
          model: tasksDocuments,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task,
    });
  } catch (error: any) {
    console.error("Error retrieving task:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getTaskByAssignee = async (req: Request, res: Response) => {
  try {
    const { assignee } = req.params;
    const task = await tasks.findAll({
      where: {
        assignee: assignee,
      },
      include: [
        {
          model: tasksDocuments,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task,
    });
  } catch (error: any) {
    console.error("Error retrieving task:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const GetTasksByCreated = async (req: Request, res: Response) => {
  try {
    const { createdBy } = req.params;

    const task = await tasks.findAll({
      where: {
        createdBy: createdBy,
      },
      include: [
        {
          model: tasksDocuments,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task,
    });
  } catch (error: any) {
    console.error("Error retrieving task:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const UpdateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = await tasks.findOne({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const updatedTask = await task.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error: any) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const DeleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = await tasks.findOne({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.destroy();

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const uploadTaskDocument = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = await tasks.findOne({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { file } = req?.files;
    const { name: orgFile, data } = file as UploadedFile;
    const { documentType } = req.body;

    const fileName = `${UUIDV4()}.${orgFile.split(".").pop()}`;
    const upload: boolean = await uploadFileAZ(
      String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
      String(process.env.RMA_SUPPORTDOCS_AZ_BLOB),
      fileName,
      data,
    );

    if (!upload) {
      throw new Error("Unable to upload file");
    }

    const createdFile = await tasksDocuments.create(
      {
        fileName: fileName,
        documentType: "Task Document",
        orgFileName: orgFile,
        taskId: task.id,
      },
      { returning: true },
    );

    return res.status(201).json({
      success: true,
      message: "Task document uploaded successfully",
      data: createdFile,
    });
  } catch (error: any) {
    console.error("Error uploading task document:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
