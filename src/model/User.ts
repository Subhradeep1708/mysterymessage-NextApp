import mongoose, { Schema, Document } from 'mongoose'


// INTERFACE FOR MESSAGE

export interface Message extends Document {

    content: string; // In Ts string is small 's'
    createdAt: Date;
}   

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})


// INTERFACE FOR USER
export interface User extends Document {

    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[];
}



const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true, //spaces removed
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, 'please use a valid email address']
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    verifyCode: {
        type: String,
        required: [true, "VerifyCode is required"]
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "VerifyCode Expiry is required"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema]
})

// MORMAL BACKEND ME EKBAR SAB SCHEMA WAGERA CREATE HO JATA HAI BUT NEXT RUNS EDGE CASE IT DOES'NT KNOW IF THE MODEL IS CREATED OR NOT ==> BOTH CASES CHECKED ==> (Pehle se bana hua hai) || (New model create hua hai)

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel;