'use client'

import { useMutation } from '@tanstack/react-query'
import { UserService } from 'apps/user-ui/src/services/user.services'
import GoogleButton from 'apps/user-ui/src/shared/components/google-button'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormData = {
    email: string,
    password: string,
    name: string
}
const SignUp = () => {
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [serverError, setServerError] = useState('')
    const [canResend, setCanResend] = useState(false)
    const [timer, setTimer] = useState(60)
    const [otp, setOtp] = useState(['', '', '', ''])
    const [userData, setUserData] = useState<FormData | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [showOtp, setShowOtp] = useState(false)

    const router = useRouter()
    const { handleSubmit, register, formState: { errors } } = useForm<FormData>()
    const onSubmit = (data: FormData) => {
        signupMutation.mutate(data)
    }
    const handleOtpChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }
    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }
    const handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText.length > 1) {
            setOtp(pastedText.split('').map((digit) => digit.toString()))
        }
    }
    const resendOtp = () => {

    }
    const startResendTimer = () => {
        const timerId = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId)
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }
    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await UserService.signUp(data)
            console.log(response);
            return response
        },
        onSuccess: (res, data) => {
            setUserData(data)
            setShowOtp(true)
            setCanResend(true)
            setTimer(60)
            startResendTimer()
            toast.success(res?.data.message)
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message)
        }
    })
    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await UserService.verifyRegistrationOtp({
                ...userData,
                otp: otp.join('')
            })
            return response
        },
        onSuccess: (res, data) => {
            setShowOtp(false)
            setCanResend(false)
            toast.success(res?.data.message)
            router.push('/login')
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message)
        }
    })


    return (
        <div className='w-full py-10 min-h-[104vh] bg-[#f1f1f1]' >
            <h1 className='text-4xl font-poppins font-semibold text-black text-center'>SignUp</h1>
            <p className='text-center text-lg  font-medium py-3 text-[#00000099]'>
                Home . SignUp
            </p>
            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8  bg-white shadow rounded-lg '>
                    <h3 className='text-3xl font-semibold text-center mb-2'>
                        SignUp to AQuality
                    </h3>
                    <p className='text-center text-gray-500 mb-4 font-medium'>
                        Already have an account?{" "}
                        <Link href={'/login'} className='text-blue-500'>
                            Login
                        </Link>
                    </p>
                    <GoogleButton />
                    <div className='flex items-center my-5 text-gray-400 text-sm'>
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className='px-3 text-gray-500 '>Or Sign in with Email</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    {
                        !showOtp ? <form action="" onSubmit={handleSubmit(onSubmit)}>
                            <label htmlFor="name" className="block text-gray-700 mb-1 ">Name</label>
                            <input type="text" placeholder='Your name' {...register('name', {
                                required: 'Name is required',
                                minLength: {
                                    value: 4,
                                    message: 'Name must be at least 4 characters'
                                }
                            })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />

                            {errors.name && <p className='text-red-500 text-xs italic'>{errors.name.message}</p>}
                            <label htmlFor="email" className="block text-gray-700 mb-1 mt-4">Email</label>
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



                            <button type='submit'
                                disabled={signupMutation.isPending}
                                className='w-full px-4 py-2 mt-4 text-white bg-black rounded-md hover:bg-black/80 '>
                                {
                                    signupMutation.isPending ? "Signing up..." : "SignUp"
                                }
                            </button>
                            {
                                serverError && <p className='text-red-500 text-xs italic mt-2'>{serverError}</p>
                            }
                        </form> : (
                            <div>
                                <h3 className='text-xl font-semibold text-center mb-4'>Enter Otp</h3>
                                <div className='flex items-center justify-center gap-6'>
                                    {
                                        otp?.map((digit, index) => (
                                            <input key={index} type='text' ref={
                                                (el) => {
                                                    if (el) {
                                                        inputRefs.current[index] = el
                                                    }
                                                }}
                                                maxLength={1}
                                                className='w-12 h-12 text-center border border-gray outline-none rounded focus:ring-2 ring-blue-500'
                                                value={digit}
                                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                onPaste={handleOnPaste}
                                            />
                                        ))
                                    }
                                </div>
                                <button className='w-full py-2 rounded-lg mt-4 text-lg cursor-pointer bg-blue-500 text-white '
                                    onClick={() => verifyOtpMutation.mutate()}
                                    disabled={verifyOtpMutation.isPending}
                                >
                                    {verifyOtpMutation.isPending ? "Verifying..." : "verify OTP"}
                                </button>
                                <p className='text-center text-sm mt-4'>
                                    {
                                        canResend ? (
                                            <button onClick={resendOtp} className='font-semibold text-blue-500 cursor-pointer'>
                                                Resend OTP
                                            </button>
                                        ) : (
                                            `Resend OTP in ${timer} seconds`
                                        )
                                    }
                                </p>
                            </div>
                        )
                    }
                </div>
            </div>
        </div >
    )
}

export default SignUp