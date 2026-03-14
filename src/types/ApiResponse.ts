import { Message } from "../model/User";


export interface ApiResponse{
  sucess:boolean;
  message:string;
  isAcceptingMessage?:boolean;
  messages?:Array<Message>
}