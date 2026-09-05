from pydantic import BaseModel,EmailStr,Field

#user registration
class UserRegister(BaseModel):
    name:str=Field(min_length=2,max_length=100)
    email:EmailStr
    password:str=Field(min_length=6,max_length=100)
 
#user login 
class UserLogin(BaseModel):
    email:EmailStr
    password:str
   
class TokenResponse(BaseModel):
    access_token:str
    token_type:str="bearer"