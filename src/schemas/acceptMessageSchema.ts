import { z } from 'zod'

//this is message accepting schema(true or false checking just)

export const acceptMessageSchema = z.object({
    acceptMessages: z.boolean()
})