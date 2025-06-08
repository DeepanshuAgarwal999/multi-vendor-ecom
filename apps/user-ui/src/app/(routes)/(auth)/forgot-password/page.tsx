'use client'

import { useMutation } from '@tanstack/react-query'
import { UserService } from 'apps/user-ui/src/services/user.services'
import OtpInput from 'apps/user-ui/src/shared/components/OtpInput'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormData = {
    email: string,
    password: string
}
const ForgotPassword = () => {
    const [step, setStep] = useState<"email" | "otp" | "reset">('email')
    const [otp, setOtp] = useState(['', '', '', ''])
    const [userEmail, setUserEmail] = useState('')
    const [canResend, setCanResend] = useState(true)
    const [timer, setTimer] = useState(60)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [showOtp, setShowOtp] = useState(false)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const OtpInputRef = useRef<OtpInputRef>(null)

    const router = useRouter()
    const { handleSubmit, register, formState: { errors } } = useForm<FormData>()

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
    const resendOtp = () => { }

    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            await UserService.requestOtp({ email })
        },
        onSuccess: (_, { email }) => {
            setStep('otp')
            setUserEmail(email)
            setCanResend(false)
            setTimer(60)
            startResendTimer()
            toast.success('OTP sent successfully')
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message)
        }
    })
    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            await UserService.verifyForgotPasswordOtp({
                email: userEmail,
                otp: OtpInputRef.current?.getOtp()
            })
        },
        onSuccess: () => {
            setStep('reset')
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message)
        }
    })
    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            if (!password) return
            await UserService.resetPassword({ email: userEmail, newPassword: password })
        },
        onSuccess: () => {
            toast.success('Password reset successfully')
            router.replace('/login')
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message)
        }
    })
    const onSubmitEmail = ({ email }: { email: string }) => {
        requestOtpMutation.mutate({ email })
    }
    const onSubmitPassword = ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password })
    }

    return (
        <div className='w-full py-10 min-h-[104vh] bg-[#f1f1f1]'>
            <h1 className='text-4xl font-poppins font-semibold text-black text-center'>Forgot Password</h1>
            <p className='text-center text-lg  font-medium py-3 text-[#00000099]'>
                Home . Forgot-password
            </p>
            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8  bg-white shadow rounded-lg '>
                    {
                        step === 'email' && (
                            <form action="" onSubmit={handleSubmit(onSubmitEmail)}>
                                <label htmlFor="email" className="block text-gray-700 mb-1 ">Email</label>
                                <input type="email" placeholder='support@aquality.io' {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />

                                {errors.email && <p className='text-red-500 text-xs italic'>{String(errors.email.message)}</p>}

                                <button
                                    type='submit' className='w-full px-4 py-2 mt-4 text-white bg-black rounded-md hover:bg-black/80 '>
                                   {requestOtpMutation.isPending ? "Submitting ..." : "Submit"}
                                </button>

                            </form>
                        )
                    }
                    {step === 'otp' && (
                        <>
                            <h3 className='text-3xl font-semibold text-center mb-4'>
                                Enter OTP
                            </h3>
                            <OtpInput ref={OtpInputRef} />
                            <button className='w-full py-2 rounded-lg mt-4 text-lg cursor-pointer bg-blue-500 text-white '
                                onClick={() => verifyOtpMutation.mutate()}
                                disabled={verifyOtpMutation.isPending}
                            >
                                {verifyOtpMutation.isPending ? "Verifying..." : "verify OTP"}
                            </button>
                        </>
                    )
                    }

                    {
                        step === 'reset' && (
                            <form action="" onSubmit={handleSubmit(onSubmitPassword)}>
                                <h3 className='text-3xl font-semibold text-center mb-4'>
                                    Reset Password
                                </h3>
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
                                    disabled={resetPasswordMutation.isPending}
                                    className='w-full px-4 py-2 mt-4 text-white bg-black rounded-md hover:bg-black/80 '>
                                    {resetPasswordMutation.isPending ? "Submitting ..." : "Submit"}
                                </button>

                            </form>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword