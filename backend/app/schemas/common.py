import uuid
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: str = "Operation completed successfully"
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ErrorResponse(BaseModel):
    success: bool = False
    detail: str
    error_code: Optional[str] = None
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
