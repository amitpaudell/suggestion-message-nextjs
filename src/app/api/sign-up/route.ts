import bcrypt from 'bcrypt'
import dbConnect from '@/src/lib/dbConnect'
import UserModel from '@/src/model/User'

import { sendVerificationEmail } from '@/src/helpers/sendVerificationCode'
import { success } from 'zod'


export async function POST(request:Request) {
  await dbConnect()

  try {
    const {username,email,password}=await request.json();

    const existingVerifiedUserByUsername=await UserModel.findOne({
      username,isVerified:true
    })

    if(existingVerifiedUserByUsername){
      return Response.json(
        {
          sucess:false,
          message:"Username is already taken"
        },
        {status:400}
      )
    }
    const existingUserByEmail=await UserModel.findOne({email});
    let verifyCode=Math.floor(100000+Math.random()*900000).toString();

    if(existingUserByEmail){
      if(existingUserByEmail.isVerified){
        return Response.json({
          sucess:false,
          message:'User already exists with this email'
        },
        {status:400}
      )
      }
      else{
        const hashPassword=await bcrypt.hash(password,10);
        existingUserByEmail.password=hashPassword;
        existingUserByEmail.verifyCode=verifyCode;
        //Set the verification code expiry time to 1 hour from now.
        existingUserByEmail.verifyCodeExpiry=new Date(Date.now()+3600000)
        await existingUserByEmail.save()
      }
    }
    else{
      const hashPassword=await bcrypt.hash(password,10)
      const expiryDate=new Date()
      expiryDate.setHours(expiryDate.getHours()+1)

      const newUser=new UserModel({
        username,
        email,
        password:hashPassword,
        verifyCode,
        verifyCodeExpiry:expiryDate,
        isVerified:false,
        isAcceptingMessage:true,
        messages:[]
      })
      await newUser.save();
    }

    const emailResponse=await sendVerificationEmail(
      email,
      username,
      verifyCode
    )
    if(!emailResponse.sucess){
      return Response.json({
        sucess:false,
        message:emailResponse.message,

      },
    {status:500}
    )
    }

    return Response.json({
      success:true,
      message:'User registed sucessfully. Please verify your account'
    },
  
  {
    status:201
  })



  } catch (error) {
    console.error('Error registering the user',error)
    return Response.json({message:'Error resistering the user',success:false},{status:500})
  }
}