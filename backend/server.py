from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import random

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============= MODELS =============

# User Profile Models
class WorkDetails(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    jobTitle: Optional[str] = None

class StudyDetails(BaseModel):
    school: Optional[str] = None
    course: Optional[str] = None
    degree: Optional[str] = None

class LifestyleAnswers(BaseModel):
    drink: Optional[str] = None  # "Regularly", "Occasionally", "Never"
    smoke: Optional[str] = None
    exercise: Optional[str] = None

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phoneNumber: str
    countryCode: str = "+91"
    otp: Optional[str] = None
    otpVerified: bool = False
    
    # Basic Info
    gender: Optional[str] = None  # "male" or "female"
    name: Optional[str] = None
    birthday: Optional[str] = None  # ISO date string
    height: Optional[int] = None  # in cm
    
    # Location
    location: Optional[str] = None  # "Bangalore" or "Hyderabad"
    nativeState: Optional[str] = None
    
    # Story & Personality
    story: Optional[str] = None  # 100 words
    nonNegotiables: Optional[List[str]] = []
    offerings: Optional[List[str]] = []
    
    # Work/Education
    timeUsage: Optional[str] = None  # "Working", "Studying", "Figuring It Out"
    workDetails: Optional[WorkDetails] = None
    studyDetails: Optional[StudyDetails] = None
    education: Optional[str] = None  # "High School", "Undergraduate", "Doctorate", "Postgraduate"
    
    # Beliefs & Lifestyle
    religionImportance: Optional[str] = None  # "What's It", "Very Important", etc.
    religionFollow: Optional[str] = None  # "Hinduism", "Christianity", "Islam", etc.
    foodHabits: Optional[List[str]] = []  # ["Non vegetarian", "vegetable", "Vegan"]
    interests: Optional[List[str]] = []  # Free time activities
    lifestyle: Optional[LifestyleAnswers] = None
    
    # System
    onboardingCompleted: bool = False
    notificationsEnabled: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class SendOTPRequest(BaseModel):
    phoneNumber: str
    countryCode: str = "+91"

class VerifyOTPRequest(BaseModel):
    phoneNumber: str
    countryCode: str = "+91"
    otp: str

class UpdateProfileRequest(BaseModel):
    phoneNumber: str
    data: Dict[str, Any]


# ============= API ENDPOINTS =============

@api_router.get("/")
async def root():
    return {"message": "WingMann API v1.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}


# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/send-otp")
async def send_otp(request: SendOTPRequest):
    """
    Send OTP to phone number (mocked for now)
    In production: integrate with SMS service like Twilio
    """
    try:
        phone_key = f"{request.countryCode}{request.phoneNumber}"
        
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Check if user exists
        existing_user = await db.users.find_one({"phoneNumber": request.phoneNumber})
        
        if existing_user:
            # Update OTP for existing user
            await db.users.update_one(
                {"phoneNumber": request.phoneNumber},
                {
                    "$set": {
                        "otp": otp,
                        "otpVerified": False,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
        else:
            # Create new user
            new_user = UserProfile(
                phoneNumber=request.phoneNumber,
                countryCode=request.countryCode,
                otp=otp,
                otpVerified=False
            )
            await db.users.insert_one(new_user.dict())
        
        logger.info(f"OTP sent to {phone_key}: {otp}")
        
        # In production, send SMS here
        # For development, return OTP in response (REMOVE IN PRODUCTION!)
        return {
            "success": True,
            "message": "OTP sent successfully",
            "otp": otp,  # ONLY FOR DEVELOPMENT
            "expiresIn": 600  # 10 minutes
        }
        
    except Exception as e:
        logger.error(f"Error sending OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")


@api_router.post("/auth/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    """
    Verify OTP and mark user as verified
    """
    try:
        user = await db.users.find_one({
            "phoneNumber": request.phoneNumber,
            "countryCode": request.countryCode
        })
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # For development: accept any 6-digit OTP
        # In production: check against stored OTP and expiry
        if len(request.otp) != 6:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        # Verify OTP (simplified for now)
        if user.get("otp") == request.otp or request.otp == "123456":  # Accept test OTP
            await db.users.update_one(
                {"phoneNumber": request.phoneNumber},
                {
                    "$set": {
                        "otpVerified": True,
                        "otp": None,  # Clear OTP after verification
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            return {
                "success": True,
                "message": "OTP verified successfully",
                "userId": user.get("id"),
                "isNewUser": not user.get("onboardingCompleted", False)
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid OTP")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")


# ============= USER PROFILE ENDPOINTS =============

@api_router.get("/users/{phone_number}")
async def get_user_profile(phone_number: str):
    """
    Get user profile by phone number
    """
    try:
        user = await db.users.find_one({"phoneNumber": phone_number})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove sensitive data
        user.pop("otp", None)
        user.pop("_id", None)
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user profile")


@api_router.patch("/users/profile")
async def update_user_profile(request: UpdateProfileRequest):
    """
    Update user profile data
    """
    try:
        user = await db.users.find_one({"phoneNumber": request.phoneNumber})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user data
        update_data = request.data.copy()
        update_data["updatedAt"] = datetime.utcnow()
        
        await db.users.update_one(
            {"phoneNumber": request.phoneNumber},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Profile updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


@api_router.post("/users/complete-onboarding")
async def complete_onboarding(request: Dict[str, str]):
    """
    Mark onboarding as completed
    """
    try:
        phone_number = request.get("phoneNumber")
        
        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number required")
        
        await db.users.update_one(
            {"phoneNumber": phone_number},
            {
                "$set": {
                    "onboardingCompleted": True,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "message": "Onboarding completed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error completing onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete onboarding")


# ============= UTILITY ENDPOINTS =============

@api_router.get("/users")
async def get_all_users():
    """
    Get all users (for admin/testing purposes)
    """
    try:
        # Optimized query with projection to exclude sensitive fields
        users = await db.users.find({}, {"otp": 0, "_id": 0}).to_list(1000)
        
        return {
            "success": True,
            "count": len(users),
            "users": users
        }
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
