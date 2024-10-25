import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Elsie } from "next/font/google";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    //sometimes data coming from url asani se milti nehi so we decode
    const decodedUsername = decodeURIComponent(username); //Gets the unencoded version of an encoded(%20 wala) component of a url

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 500 }
      );
    }

    //checking the verifeCode came with user with the code given by user from email
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date(); //code expiry time should be more than the time it is now to verify

    //if code valid and not expired the user is verified
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 500 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired, please signup again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code!",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error Verifying user", error);
    return Response.json(
      {
        success: false,
        message: "Error Verifying user",
      },
      { status: 500 }
    );
  }
}
