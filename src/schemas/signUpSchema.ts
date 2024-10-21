import { z } from "zod";


// only the username is verified here(Only one object so z.)
export const usernameValidation =
    z
        .string()
        .min(2, "Username must be atleast 2 characters")
        .max(20, "Username must not be more than 20 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special characters")


// whole signUp datas are verified here(z.object is made)
export const signUpValidation = z.object({
    username: usernameValidation,
    email: z.string().email({ message: 'Invalid email address' }),
    password:z.string().min(6,{message: 'password must be atleast 6 characters'})
})      