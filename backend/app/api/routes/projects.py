from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.project import Project, ProjectTask
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectOut, TaskCreate, TaskUpdate, TaskOut,
    AIPlanProposalRequest
)
from app.schemas.common import APIResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/projects", tags=["Project Planning & Projects"])

@router.get("", response_model=APIResponse[List[ProjectOut]])
def list_projects(db: Session = Depends(get_db)):
    """Retrieve all active construction projects."""
    projects = db.query(Project).all()
    return APIResponse(
        success=True,
        data=projects,
        message=f"Retrieved {len(projects)} construction projects"
    )

@router.post("", response_model=APIResponse[ProjectOut], status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new construction project."""
    existing = db.query(Project).filter(Project.code == data.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project code '{data.code}' already exists."
        )

    project = Project(
        name=data.name,
        code=data.code,
        location=data.location,
        project_type=data.project_type,
        status=data.status,
        budget=data.budget,
        spent=data.spent,
        completion_pct=data.completion_pct,
        start_date=data.start_date,
        target_end_date=data.target_end_date
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return APIResponse(
        success=True,
        data=project,
        message="Project created successfully"
    )

@router.get("/{project_id}", response_model=APIResponse[ProjectOut])
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed project record and its associated tasks."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return APIResponse(
        success=True,
        data=project,
        message="Project retrieved"
    )

@router.post("/{project_id}/tasks", response_model=APIResponse[TaskOut], status_code=status.HTTP_201_CREATED)
def add_task(project_id: int, task_in: TaskCreate, db: Session = Depends(get_db)):
    """Add a new task or milestone to a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    task = ProjectTask(
        project_id=project_id,
        phase=task_in.phase,
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
        progress_pct=task_in.progress_pct,
        start_date=task_in.start_date,
        end_date=task_in.end_date,
        assigned_role=task_in.assigned_role,
        dependencies=task_in.dependencies or ""
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Recalculate average project progress
    all_tasks = db.query(ProjectTask).filter(ProjectTask.project_id == project_id).all()
    if all_tasks:
        avg_pct = sum(t.progress_pct for t in all_tasks) / len(all_tasks)
        project.completion_pct = round(avg_pct, 1)
        db.commit()

    return APIResponse(
        success=True,
        data=task,
        message="Task added to project"
    )

@router.put("/{project_id}/tasks/{task_id}", response_model=APIResponse[TaskOut])
def update_task(project_id: int, task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    """Update progress, status, or dates of a specific task."""
    task = db.query(ProjectTask).filter(
        ProjectTask.id == task_id,
        ProjectTask.project_id == project_id
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found in project.")

    update_dict = task_in.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(task, field, val)

    db.commit()
    db.refresh(task)

    # Recalculate average project progress
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        all_tasks = db.query(ProjectTask).filter(ProjectTask.project_id == project_id).all()
        if all_tasks:
            avg_pct = sum(t.progress_pct for t in all_tasks) / len(all_tasks)
            project.completion_pct = round(avg_pct, 1)
            db.commit()

    return APIResponse(
        success=True,
        data=task,
        message="Task updated"
    )

@router.delete("/{project_id}/tasks/{task_id}", response_model=APIResponse[dict])
def delete_task(project_id: int, task_id: int, db: Session = Depends(get_db)):
    """Remove a task from project."""
    task = db.query(ProjectTask).filter(
        ProjectTask.id == task_id,
        ProjectTask.project_id == project_id
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    db.delete(task)
    db.commit()
    return APIResponse(
        success=True,
        data={"deleted_task_id": task_id},
        message="Task removed from project"
    )

@router.post("/ai-proposal", response_model=APIResponse[List[dict]])
def generate_ai_schedule(data: AIPlanProposalRequest):
    """Generate an AI-assisted draft construction schedule breakdown."""
    proposals = AIService.generate_ai_schedule_proposal(
        project_type=data.project_type,
        floors=data.total_floors,
        duration_months=data.target_duration_months
    )
    return APIResponse(
        success=True,
        data=proposals,
        message="AI draft schedule proposal generated (editable)"
    )
