import secrets
from datetime import datetime,timedelta,timezone
from fastapi import APIRouter,HTTPException,status,Depends
from app.core.database import users_collection,otp_collection
from app.core.security import hash_password,verify_password,create_access_token
from app.schemas.auth import UserLogin,UserRegister,TokenResponse
from fastapi.security import OAuth2PasswordRequestForm
from app.core.dependencies import get_current_user
from app.services.email_service import send_otp_email

router=APIRouter(prefix='/auth',tags=['Authentication'])

@router.get('/me')
def get_me(current_user=Depends(get_current_user)):
    return {
        'id': str(current_user['_id']),
        'name': current_user.get('name', ''),
        'email': current_user.get('email', ''),
        'is_verified': current_user.get('is_verified', False)
    }


@router.post('/register')
def register_user(user:UserRegister):
    existing_user=users_collection.find_one({'email':user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email is already registered.'
        )    
    hashed_password=hash_password(user.password)
    user_document={
        'name':user.name,
        'email':user.email,
        'password':hashed_password,
        'is_verified':False,
        'created_at':datetime.now(timezone.utc)
    }
    result=users_collection.insert_one(user_document)
    
    otp = str(secrets.randbelow(900000) + 100000)

    otp_document = {
    "email": user.email,
    "otp": otp,
    "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10)
}

    otp_result = otp_collection.insert_one(otp_document)

    try:
        send_otp_email(user.email, otp)
    except Exception:
        otp_collection.delete_one({"_id": otp_result.inserted_id})
        users_collection.delete_one({"_id": result.inserted_id})
        raise HTTPException(
        status_code=503,
        detail="Unable to send verification email. Please try again."
    )
    
    return {
        "message": "User registered successfully.Please verify your email using OTP.",
        "user_id": str(result.inserted_id)
    }
    

@router.post('/verify-email')
def verify_email(email: str, otp: str):
    otp_record = otp_collection.find_one({'email': email})
    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail='OTP not found.'
        )
    expires_at = otp_record['expires_at']
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        otp_collection.delete_one({'_id': otp_record['_id']})
        raise HTTPException(
            status_code=400,
            detail='OTP has expired.'
        )
    if otp_record['otp'] != otp:
        raise HTTPException(
            status_code=400,
            detail='Invalid OTP.'
        )
    user = users_collection.find_one({'email': email})
    if not user:
        otp_collection.delete_one({'_id': otp_record['_id']})
        raise HTTPException(
            status_code=404,
            detail='User not found.'
        )
    users_collection.update_one(
        {'email': email},
        {
            '$set': {
                'is_verified': True
            }
        }
    )
    otp_collection.delete_one({'_id': otp_record['_id']})
    return {
        'message': 'Email verified successfully.'
    }



@router.post('/login',response_model=TokenResponse)
def login_user(form_data: OAuth2PasswordRequestForm=Depends()):
    email=form_data.username
    password=form_data.password
    
    existing_user=users_collection.find_one({'email':email})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not existing_user.get('is_verified',False):
        raise HTTPException(
            status_code=403,
            detail='Please verify your email before logging in.'
        )
    
    if not verify_password(password,existing_user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password.'
        )
    
    access_token=create_access_token(str(existing_user['_id']))
    return {
        'access_token':access_token,
        'token_type':'bearer'
    }
    

@router.post('/resend-otp')
def resend_otp(email:str):
    user=users_collection.find_one({'email':email})
    if not user:
        raise HTTPException(
            status_code=404,
            detail='User not found.'
        )
    
    if user.get('is_verified',False):
        raise HTTPException(
            status_code=400,
            detail='Email is already verified.'
        )
    
    otp_collection.delete_many({'email':email})
    
    otp = str(secrets.randbelow(900000) + 100000)

    otp_document = {
    "email": email,
    "otp": otp,
    "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10)
}

    otp_result = otp_collection.insert_one(otp_document)

    try:
        send_otp_email(email, otp)
    except Exception:
        otp_collection.delete_one({"_id": otp_result.inserted_id})
        raise HTTPException(
        status_code=503,
        detail="Unable to send verification email. Please try again."
    )
    return {
        'message':'A new OTP has been generated.'
    }
