import Link from 'next/link'
import { HeartIcon, Search, ShoppingBag, User2 } from 'lucide-react'
import HeaderBottom from './header-bottom'

const Header = () => {
    return (
        <div className='w-full bg-white z-50'>
            <div className='w-[80%] py-5 mx-auto flex items-center justify-between'>
                <div>
                    <Link href={'/'}>
                        <span className='text-2xl font-semibold text-black'>AQuality</span>
                    </Link>
                </div>
                <div className='w-1/2 relative'>
                    <input type="text" placeholder='Search for products...' className='w-full px-4 font-poppins font-medium border-[2.5px] border-[#3489ff] outline-none h-[55px]' />
                    <div className='w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489ff] absolute top-0 right-0'>
                        <Search color='#fff' />
                    </div>
                </div>
                <div className='flex items-center gap-8'>
                    <div className='flex items-center gap-2'>
                        <Link href={'/login'} className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'>
                            <User2 />
                        </Link>
                        <Link href={'/login'}>
                            <span className='block font-medium'>
                                Hello,
                            </span>
                            <span className='font-semibold'>
                                Sign In
                            </span>
                        </Link>
                    </div>
                </div>
                <div className='flex items-center gap-5'>
                    <Link href={'/wishlist'} className='relative'>
                        <HeartIcon />
                        <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] '>
                            <span className='text-white font-medium text-sm'>0</span>
                        </div>
                    </Link>
                    <Link href={'/cart'} className='relative'>
                        <ShoppingBag />
                        <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] '>
                            <span className='text-white font-medium text-sm'>0</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className='border-b border-b-slate-200 ' />
            <HeaderBottom />
        </div>
    )
}

export default Header