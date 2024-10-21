import { z } from 'zod'

//this is sign in using email(identifier) and password only

export const signInSchema = z.object({
    identifier: z.string(),
    password:z.string()
})