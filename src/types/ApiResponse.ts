import { Message } from "@/model/User";

export interface ApiResponse { //success & message always present rest optional
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean; //?--> means it is optional
    messages?: Array<Message>; //saare messages ko array se user ko show karna 

}