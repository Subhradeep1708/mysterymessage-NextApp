import { z } from 'zod'


//this is email otp(code) verification

export const verifySchema = z.object({
    code: z.string().length(6, "Verfication code must be 6 digits")
})