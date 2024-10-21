import { z } from 'zod'

//this is message accepting schema

export const acceptMessageSchema = z.object({
    acceptMessages: z.boolean()
})