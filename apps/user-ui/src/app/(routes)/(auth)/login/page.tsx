'use client'

import { useMutation } from '@tanstack/react-query'
import { UserService } from 'apps/user-ui/src/services/user.services'
import GoogleButton from 'apps/user-ui/src/shared/components/google-button'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormData = {
    email: string,
    password: string,
}
const Login = () => {
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const router = useRouter()
    const { handleSubmit, register, formState: { errors } } = useForm<FormData>()

    const onSubmit = (data: FormData) => {
        loginMutation.mutate(data)
    }
    const loginMutation = useMutation({
        mutationFn: async (data: FormData) => {
            return await UserService.login(data)
        },
        onSuccess: (res, data) => {
            console.log({ res });
            console.log({ data });
            router.replace('/')
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message)
        }
    })
    return (
        <div className='w-full py-10 min-h-[104vh] bg-[#f1f1f1]'>
            <h1 className='text-4xl font-poppins font-semibold text-black text-center'>Login</h1>
            <p className='text-center text-lg  font-medium py-3 text-[#00000099]'>
                Home . Login
            </p>
            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8  bg-white shadow rounded-lg '>
                    <h3 className='text-3xl font-semibold text-center mb-2'>
                        Login to AQuality
                    </h3>
                    <p className='text-center text-gray-500 mb-4 font-medium'>
                        Don't have an account?{" "}
                        <Link href={'/signup'} className='text-blue-500'>
                            Sign Up
                        </Link>
                    </p>
                    <GoogleButton />
                    <div className='flex items-center my-5 text-gray-400 text-sm'>
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className='px-3 text-gray-500 '>Or Sign in with Email</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    <form action="" onSubmit={handleSubmit(onSubmit)}>


                        <label htmlFor="email" className="block text-gray-700 mb-1 ">Email</label>
                        <input type="email" placeholder='support@aquality.io' {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />

                        {errors.email && <p className='text-red-500 text-xs italic'>{errors.email.message}</p>}

                        <label htmlFor='password' className="block text-gray-700 mb-1 mt-4 ">Password</label>
                        <div className='relative'>
                            <input type={passwordVisible ? 'text' : 'password'} placeholder='Your password' {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />

                            <button type='button' onClick={() => setPasswordVisible(!passwordVisible)} className='absolute inset-y-0 right-3  flex items-center text-gray-400'>
                                {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className='text-red-500 text-xs italic'>{errors.password.message}</p>}


                        <div className='flex items-center justify-between mt-4'>
                            <div className='flex items-center'>
                                <input type="checkbox" id="remember" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                                <label htmlFor="remember" className='ml-2 text-sm text-gray-600'>Remember me</label>
                            </div>
                            <Link href={'/forgot-password'} className='text-blue-500 text-sm'>
                                Forgot password?
                            </Link>
                        </div>
                        <button
                            disabled={loginMutation.isPending}
                            type='submit' className='w-full px-4 py-2 mt-4 text-white bg-black rounded-md hover:bg-black/80 '>
                            {loginMutation.isPending ? "Logging in..." : "Login"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login