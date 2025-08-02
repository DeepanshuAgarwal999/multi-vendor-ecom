'use client'

import { useMutation } from '@tanstack/react-query'
import { SellerService } from 'apps/seller-ui/src/services/seller.service'
import CreateShop from 'apps/seller-ui/src/shared/modules/create-shop'
import { Countries } from 'apps/seller-ui/src/utils/countries'
import { UserService } from 'apps/user-ui/src/services/user.services'
import GoogleButton from 'apps/user-ui/src/shared/components/google-button'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import StripeLogo from '../../../assets/svgs/stripe-logo'
import { gql } from '@apollo/client'
import { apolloClient } from 'apps/seller-ui/src/config/apollo-client'

type FormData = {
    email: string,
    password: string,
    name: string,
    phone_number: string
    country: string
}
const SignUp = () => {
    const [activeStep, setActiveStep] = useState(1)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [serverError, setServerError] = useState('')
    const [canResend, setCanResend] = useState(false)
    const [timer, setTimer] = useState(60)
    const [otp, setOtp] = useState(['', '', '', ''])
    const [sellerData, setSellerData] = useState<FormData | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [showOtp, setShowOtp] = useState(false)
    const [sellerId, setSellerId] = useState<string | null>(null)

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
            const response = await SellerService.signUp(data)
            return response
        },
        onSuccess: (res, data) => {
            setSellerData(data)
            setShowOtp(true)
            setCanResend(true)
            setTimer(60)
            startResendTimer()
        },
        onError: (error: any) => {
            const gqlError = error.graphQLErrors[0];
            let statusCode = gqlError.extensions?.status
            if (statusCode === 409) {
                setActiveStep(2); // Navigate to next step
                return;
            }
            setServerError(error.message);
            toast.error(error.message);
        }
    })
    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!sellerData ||
                !sellerData.email ||
                !sellerData.password ||
                !sellerData.name ||
                !sellerData.phone_number ||
                !sellerData.country
            ) {
                throw new Error('Missing required registration data')
            }
            const response = await SellerService.verifyRegistrationOtp({
                email: sellerData.email,
                password: sellerData.password,
                name: sellerData.name,
                phone_number: sellerData.phone_number,
                country: sellerData.country,
                otp: otp.join('')
            })
            return response
        },
        onSuccess: (res, data) => {
            setShowOtp(false)
            setCanResend(false)
            console.log({ res });
            setSellerId(res?.data.seller.id)
            setActiveStep(2)
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message)
        }
    })
    const connectStripe = () => {
        try {
            const mutation = gql`mutation CreateStripeLink($sellerId: ID!) {
                                     createStripeLink(sellerId: $sellerId) {
                                      message
                                    }}`
            const response = apolloClient.mutate({
                mutation: mutation,
                variables: {
                    sellerId: sellerId
                }
            })
            if (response.data.createStripeLink.url) {
                window.location.href = response.data.createStripeLink.url
            }
        } catch (error) {
            console.log("Error connecting stripe", error)
        }
    }
    return (
        <div className='w-full flex flex-col items-center pt-10 min-h-screen ' >
            <div className="relative flex items-center justify-between md:w-[50%] mb-8">
                <div className="absolute top-[25%] flex justify-between  left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />
                {
                    [1, 2, 3,].map((step, index) => (
                        <div key={index}>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${step <= activeStep ? "bg-blue-600" : "bg-gray-300"}`} >
                                {step}
                            </div>
                            <span className='ml-[-15px] text-black'>
                                {
                                    step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : "Connect Bank"
                                }
                            </span>
                        </div>
                    ))
                }
            </div>
            <div className="md:w-[480px] p-8 bg-white shadow rounded-lg ">
                {
                    activeStep === 1 && (
                        <>
                            {
                                !showOtp ? <form action="" onSubmit={handleSubmit(onSubmit)}>
                                    <h3 className='text-2xl font-semibold text-center mb-4  '>
                                        Create Account
                                    </h3>
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
                                    <label htmlFor="Phone" className='block text-gray-700 mb-1 mt-4'>Phone Number</label>
                                    <input type='tel' placeholder='Your phone number' {...register('phone_number', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Invalid phone number'
                                        }
                                    })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />
                                    {errors.phone_number && <p className='text-red-500 text-xs italic'>{errors.phone_number.message}</p>}


                                    <label htmlFor='country' className="block text-gray-700 mb-1 mt-4 ">Country</label>
                                    <select {...register('country', {
                                        required: 'Country is required',
                                    })} className='w-full px-3 py-2 max-h-64  border border-gray-300 rounded-md outline-none'>
                                        <option value=''>Select your Country</option>
                                        {
                                            Countries.map((country) => (
                                                <option key={country.code} value={country.code}>{country.name}</option>
                                            ))
                                        }
                                    </select>

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
                                    <p className='pt-3 text-center'>
                                        Already have an account?{" "}
                                        <Link href={'/login'} className='text-blue-500'>
                                            Login
                                        </Link>
                                    </p>
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
                        </>
                    )
                }

                {
                    activeStep === 2 &&
                    <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
                }

                {
                    activeStep === 3 && (
                        <div className='text-center'>
                            <h3 className='text-2xl font-semibold '>Withdraw Method</h3>
                            <br />
                            <button className='w-full py-2 rounded-lg mt-4 text-lg flex items-center justify-center cursor-pointer  text-white' onClick={connectStripe}>
                                Connect stripe <StripeLogo />
                            </button>

                        </div>
                    )
                }
            </div>

        </div >
    )
}

export default SignUp