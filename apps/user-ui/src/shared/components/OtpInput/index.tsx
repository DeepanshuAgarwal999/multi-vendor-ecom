'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'


const OtpInput = forwardRef<OtpInputRef, { length?: number }>(({ length = 4 }, ref) => {
    const [otp, setOtp] = useState(Array(length).fill(''))

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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
    useImperativeHandle(ref, () => ({
        getOtp: () => otp.join(''),
        clearOtp: () => setOtp(Array(length).fill(''))
    }))
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("Text").replace(/\D/g, ""); // Only digits
        if (pasteData.length === 0) return;

        const otpArray = Array(length)
            .fill("")
            .map((_, i) => pasteData[i] || "");

        setOtp(otpArray);

        // Focus the next empty input
        const firstEmptyIndex = otpArray.findIndex((val) => val === "");
        const focusIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    };

    useImperativeHandle(ref, () => ({
        getOtp: () => otp.join(""),
        clearOtp: () => {
            setOtp(Array(length).fill(""));
            inputRefs.current[0]?.focus();
        },
    }));
    return (
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
                        onPaste={handlePaste}
                    />
                ))
            }
        </div>
    )
})

export default OtpInput