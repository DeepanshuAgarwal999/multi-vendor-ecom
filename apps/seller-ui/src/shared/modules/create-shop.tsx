"use client"

import { useForm } from 'react-hook-form'
import { SellerService } from '../../services/seller.service'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type Props = {
    sellerId: string
    setActiveStep: (step: number) => void
}

function CreateShop({ sellerId, setActiveStep }: Props) {
    const { handleSubmit, register, formState: { errors } } = useForm<FormData>()
    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            return await SellerService.createShop(data)
        },
        onSuccess: (res, data) => {
            setActiveStep(3)
        },
        onError: (error) => {
            console.log(error);
            toast.error(error.message)
        }
    })
    return (
        <div>CreateShop</div>
    )
}

export default CreateShop