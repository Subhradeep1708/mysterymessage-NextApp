'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpValidation } from "@/schemas/signUpSchema"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const page = () => {

    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')//if any msg for username comes from backend
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false) // loader


    // Debouncing-> after some interval checking the inputted username by comparing it to the saved username by db call

    //checking with backend with debounced so every key press won't check the username w db
    // **BUG** we have to use useDebounceCallback
    // const debouncedUsername = useDebounceValue(username, 300)//usrname thoda delay se save
    const debounced = useDebounceCallback(setUsername, 300)

    const { toast } = useToast()
    const router = useRouter() // route to other pages(from next/navigation)


    //zod implementation 
    const form = useForm<z.infer<typeof signUpValidation>>({
        resolver: zodResolver(signUpValidation),
        defaultValues: { //default values
            username: '',
            email: '',
            password: ''
        }
    })

    // whenever user types a username debounced username is changed then req goes to server
    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true)
                setUsernameMessage('')//if in last call there was any error msg that is emptied
                try {
                    // only /api used as next prepends domain or port in url

                    const response = await axios.get(`/api/check-username-unique?username=${username}`)  //username is added in the url which is checked in check-username-unique route

                    console.log("Axios response:", response.data.message);
                    let message = response.data.message
                    setUsernameMessage(message)

                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;//optional
                    setUsernameMessage(
                        axiosError.response?.data.message ?? "Error checking username"
                    )

                } finally {
                    setIsCheckingUsername(false)
                    //if it's not written in finally then i've to write it on both try and catch
                }
            }
        }
        // method is runned
        checkUsernameUnique()

    }, [username])


    const onSubmit = async (data: z.infer<typeof signUpValidation>) => {

        // console.log("data", data);

        setIsSubmitting(true) //submiting or loading state activated
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data)
            toast({
                title: 'Success',
                description: response.data.message
            })
            //user is redirected to the route 
            router.replace(`/verify/${username}`)
            setIsSubmitting(false)

        } catch (error) {
            console.error("Error in sign-up of user", error);
            const axiosError = error as AxiosError<ApiResponse>;//optional
            let errorMessage = axiosError.response?.data.message
            toast({
                title: 'Error in sign-up of user',
                description: errorMessage,
                variant: "destructive"
            })
            setIsSubmitting(false)

        }
    }


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join Mystery Message
                    </h1>
                    <p className="mb-4 ">Sign up to start your anonymus adventure</p>
                </div>
                <Form  {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Username"
                                            {...field}
                                            //not in shadcn setting values in input required
                                            onChange={(e) => {
                                                field.onChange(e)
                                                debounced(e.target.value)
                                            }}
                                        />
                                    </FormControl>
                                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                                    <p className={`text-sm ${usernameMessage === "Username is unique" ? "text-green-500" : "text-red-500"}`}>
                                        {usernameMessage}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                                    </>
                                ) : ('Signup')
                            }
                        </Button>
                    </form>
                </Form>

                {/* If Already user redirect to signin page */}
                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href='/sign-in' className="text-blue-600 hover:text-blue-800">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default page
