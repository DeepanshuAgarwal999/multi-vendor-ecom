'use client'

import GoogleButton from 'apps/user-ui/src/shared/components/google-button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
    email: string,
    password: string
}
const Login = () => {
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [serverError, setServerError] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const router = useRouter()
    const { handleSubmit, register, formState: { errors } } = useForm<FormData>()
    const onSubmit = (data: FormData) => {
        console.log(data)
        setServerError('')
        router.push('/home')
    }
    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <h1 className='text-4xl font-poppins font-semibold text-black text-center'>Login</h1>
            <p className='text-center text-lg  font-medium py-3 text-[#00000099]'>
                Home . Login
            </p>
            <div className='w-full flex justify-center'>
                <div className='mf:w-[480px] p-8  bg-white shadow rounded-lg '>
                    <h3 className='text-3xl font-semibold text-center mb-2'>
                        Login to Aquality
                    </h3>
                    <p className='text-center text-gray-500 mb-4'>
                        Don't have an account?{" "}
                        <Link href={'/signup'} className='text-blue-500'>
                            Sign Up
                        </Link>
                    </p>
                    <GoogleButton />
                    <div className='flex items-center my-5 text-gray-400 text-sm'>
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className='px-3'>Or Sign in with Email</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    <form action="" onSubmit={handleSubmit(onSubmit)}>
        
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login