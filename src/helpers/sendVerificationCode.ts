import { ApiResponse } from "../types/ApiResponse";
import { resend } from "../lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";

export async function sendVerificationEmail(email:string,username:string,verifyCode:string):Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Mstry Verification Code',
      react: VerificationEmail({username,otp:verifyCode}),
    });
    return {sucess:true,message:'Verification email send sucessfully'}
  } catch (emailError) {
    console.error("Error sending email",emailError)
    return {sucess:false,message:'Failed to send verification email'}
  }
}