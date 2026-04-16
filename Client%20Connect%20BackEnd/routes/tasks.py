from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID, uuid4


router = APIRouter()


class Task(BaseModel):
    id: UUID = uuid4()
    title: str
    description: Optional[str] = None
    completed: bool = False


tasks: List[Task] = []


@router.post("/tasks", response_model=Task)
async def create_task(task: Task):
    tasks.append(task)
    return task


@router.get("/tasks", response_model=List[Task])
async def read_tasks():
    return tasks


@router.get("/tasks/{task_id}", response_model=List[Task])
async def read_task(task_id: UUID):
    for task in tasks:
        if task.id == task_id:
            return task

    raise HTTPException(status_code=404, detail="Task not found")


@router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: UUID, task_update: Task):
    for index, task in enumerate(tasks):
        if task.id == task_id:
            update_task = task.model_copy(
                update=task_update.model_dump(exclude_unset=True)
            )
            tasks[index] = update_task
            return update_task

    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/tasks/{task_id}", response_model=Task)
async def delete_task(task_id: UUID):
    for index, task in enumerate(tasks):
        if task.id == task_id:
            return tasks.pop(index)

    raise HTTPException(status_code=404, detail="Task not found")
