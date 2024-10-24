import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    // Checking if user is present in db or not
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    // generating otp
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      // if user with email found that means its only updating the password
      if (existingUserByEmail.isVerified) {
        //user with the email exists and verified means someone else is logged in with this email
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      } else {
        //User with this email exists in DB but updating with a new password
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
        //here aftersaving user verification email will be sent that's why sendVerificationEmail() is written outside the else
      }
    } else {
      // New user created
      // password hashing and setting a expiry time for verifyCode
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); //otp expiry 1hr

      // creating User in the db
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    // Sending verification email written outside if-else as it could run on both the cases of if(password update) and else(new user create) part
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    // sending email gives a response back with many things like- success,message
    if (!emailResponse.success) {
      // if email not sent successfully
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    // if email sent successfully
    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please veiry your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error registering user", error); // this will be on terminal
    return Response.json(
      {
        // returned will be sent to frontend
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
