import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

// Username validation

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

// GET method to verify the username

export async function GET(request: Request) {
  await dbConnect();

  try {
    //username would available on the url we're extracting it(it is syntax of zod)
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    //validation with zod
    const result = UsernameQuerySchema.safeParse(queryParam); //safeparse - if safely parsed the we'll get data otherwise not

    console.log(result); //TODO: remove
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    //console.log(result.data); // the data inside result will hold the username
    const { username } = result.data;

    //finding in db if same username and verified user present or not
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }
    // in else part if username is not taken
    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
