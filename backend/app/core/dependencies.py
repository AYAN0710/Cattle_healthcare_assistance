from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer
import jwt
from bson import ObjectId
from app.core.security import SECRET_KEY,ALGORITHM
from app.core.database import users_collection

oauth2_scheme=OAuth2PasswordBearer(tokenUrl='/auth/login')

def get_current_user(token:str=Depends(oauth2_scheme)):
    try:
        payload=jwt.decode(
            token,SECRET_KEY,algorithms=[ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token has expired.'
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Inavlid authentication token.'
        )
    
    user_id=payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid authentication token.'
        )
        
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid user ID.'
        )
    
    user=users_collection.find_one({'_id':ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found.'
        )
        
    if not user.get('is_verified',False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Email is not verified.'
        )
    
    return user

#authorization (bearer) -> decode and verify JWT -> get userid from JWT -> userid valid or not in mongodb id
#-> find user in mongodb -> email verified or not -> return authenticated user