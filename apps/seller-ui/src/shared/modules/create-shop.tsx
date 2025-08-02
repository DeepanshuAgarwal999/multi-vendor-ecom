"use client"

import { useForm } from 'react-hook-form'
import { SellerService } from '../../services/seller.service'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import shopCategories from '../../utils/categories'

type Props = {
    sellerId: string | null
    setActiveStep: (step: number) => void
}

function CreateShop({ sellerId, setActiveStep }: Props) {
    const { handleSubmit, register, formState: { errors } } = useForm()

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
    const onSubmit = (data: any) => {
        const shopData = { ...data, sellerId }
        shopCreateMutation.mutate(data)
    }
    const countWords = (text: string) => text.trim().split(/\s+/).length
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h3 className='text-2xl font-semibold text-center mb-4 '>Setup New Shop</h3>
            <input type="text" placeholder='Shop Name' {...register('name', {
                required: 'Shop name is required',
                minLength: {
                    value: 4,
                    message: 'Shop name must be at least 4 characters'
                }
            })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />
            {errors.name && <p className='text-red-500 text-xs italic'>{String(errors.name.message)}</p>
            }
            <label htmlFor="bio" className="block text-gray-700 mb-1 mt-4">Bio (Max 100 words) *</label>
            <textarea placeholder='Your bio' {...register('bio', {
                required: 'Bio is required',
                validate: {
                    maxWords: (value) => countWords(value) <= 100 || "Bio can't be more than 100 words"
                }
            })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />
            {errors.bio && <p className='text-red-500 text-xs italic'>{String(errors.bio.message)}</p>}

            <label htmlFor="address" className="block text-gray-700 mb-1 mt-4">Address *</label>
            <input type="text" placeholder='Your address' {...register('address', {
                required: 'Address is required',
                minLength: {
                    value: 4,
                    message: 'Address must be at least 4 characters'
                }
            })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />
            {errors.address && <p className='text-red-500 text-xs italic'>{String(errors.address.message)}</p>}

            <label htmlFor="opening_hours" className="block text-gray-700 mb-1 mt-4">Opening Hours *</label>
            <input type="text" placeholder='e.g , Mon-Fri 10am-6pm' {...register('opening_hours', {
                required: 'Opening hours is required',
                minLength: {
                    value: 4,
                    message: 'Opening hours must be at least 4 characters'
                }

            })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />
            {errors.opening_hours && <p className='text-red-500 text-xs italic'>{String(errors.opening_hours.message)}</p>}

            <label htmlFor="website" className="block text-gray-700 mb-1 mt-4">Website</label>
            <input type="text" placeholder='Your website' {...register('website', {
                minLength: {
                    value: 4,
                    message: 'Website must be at least 4 characters'
                },
                pattern: {
                    value: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
                    message: 'Invalid website'
                }
            })} className='w-full px-3 py-2 border border-gray-300 rounded-md outline-none' />
            {errors.website && <p className='text-red-500 text-xs italic'>{String(errors.website.message)}</p>}

            <label htmlFor="categories" className="block text-gray-700 mb-1 mt-4">Categories *</label>
            <select {...register('categories', {
                required: 'Categories is required',
            })} className='w-full px-3 py-2 max-h-64  border border-gray-300 rounded-md outline-none'>
                {
                    shopCategories.map((category) => (
                        <option key={category.code} value={category.code}>{category.name}</option>
                    ))
                }
            </select>
            {errors.categories && <p className='text-red-500 text-xs italic'>{String(errors.categories.message)}</p>}

            <button className='w-full py-2 rounded-lg mt-4 text-lg cursor-pointer bg-blue-600 text-white '>
                {
                    shopCreateMutation.isPending ? "Creating Shop..." : "Create"
                }
            </button>

        </form>
    )
}

export default CreateShop