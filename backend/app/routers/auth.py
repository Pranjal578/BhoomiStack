"""
Auth and Users router — login, session profile, and user management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, AuditLog
from ..schemas import LoginRequest, TokenResponse, UserSchema, UserStatusUpdate
from ..auth.jwt import verify_password, create_access_token, get_current_user, require_auth

router = APIRouter(tags=["Auth & Users"])


def success(data):
    import datetime
    return {"success": True, "data": data, "timestamp": datetime.datetime.utcnow().isoformat(), "version": "1.0"}


@router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    token = create_access_token({"sub": user.email, "role": user.role, "name": user.name})
    return TokenResponse(access_token=token, role=user.role, name=user.name)


@router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    """Get profile of currently logged-in user."""
    return success(UserSchema.model_validate(user))


@router.get("/users")
async def list_users(db: Session = Depends(get_db)):
    """List all system users (officers, citizens, admins)."""
    users = db.query(User).order_by(User.id.asc()).all()
    return success([UserSchema.model_validate(u) for u in users])


@router.patch("/users/{user_id}/status")
async def toggle_user_status(user_id: int, req: UserStatusUpdate, db: Session = Depends(get_db)):
    """Update active status of a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = req.is_active if req.is_active is not None else (0 if user.is_active else 1)
    user.is_active = new_status
    
    # Audit log
    audit = AuditLog(
        actor_id=user.email,
        actor_role="admin",
        action="USER_STATUS_CHANGE",
        table_name="users",
        new_value=f"is_active={new_status}"
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return success(UserSchema.model_validate(user))

