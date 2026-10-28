from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password, hash_password, create_access_token, get_current_user_required
from app.schemas.auth import UserLogin, UserRegister, TokenResponse, UserOut
from app.schemas.common import APIResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=APIResponse[TokenResponse])
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password to receive a JWT access token."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact site administrator."
        )

    token = create_access_token(
        subject=user.email,
        extra_claims={"user_id": user.id, "role": user.role, "full_name": user.full_name}
    )

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active
    )

    return APIResponse(
        success=True,
        data=TokenResponse(access_token=token, token_type="bearer", user=user_out),
        message="Login successful"
    )

@router.post("/demo-login", response_model=APIResponse[TokenResponse])
def demo_login(db: Session = Depends(get_db)):
    """One-click demo login as Principal Project Manager (ideal for demonstrations and tests)."""
    user = db.query(User).filter(User.email == "admin@constructai.io").first()
    if not user:
        user = User(
            email="admin@constructai.io",
            hashed_password=hash_password("constructai123"),
            full_name="Chief Site Engineer",
            role="Principal Project Manager",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(
        subject=user.email,
        extra_claims={"user_id": user.id, "role": user.role, "full_name": user.full_name}
    )

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active
    )

    return APIResponse(
        success=True,
        data=TokenResponse(access_token=token, token_type="bearer", user=user_out),
        message="Authenticated in Demo Mode"
    )

@router.post("/register", response_model=APIResponse[TokenResponse])
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    new_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role or "Site Engineer",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        subject=new_user.email,
        extra_claims={"user_id": new_user.id, "role": new_user.role, "full_name": new_user.full_name}
    )

    user_out = UserOut(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        is_active=new_user.is_active
    )

    return APIResponse(
        success=True,
        data=TokenResponse(access_token=token, token_type="bearer", user=user_out),
        message="Account registered successfully"
    )

@router.get("/me", response_model=APIResponse[dict])
def get_profile(current_user: dict = Depends(get_current_user_required)):
    """Retrieve authenticated user token profile."""
    return APIResponse(
        success=True,
        data=current_user,
        message="User profile retrieved"
    )
