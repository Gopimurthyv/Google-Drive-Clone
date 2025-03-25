import Image from 'next/image'
import React from 'react'
import { Input } from '../ui/input'

const Search = () => {
  return (
    <div>
        <div className="relative w-full md:max-w-[480px]  bg-white shadow rounded !important">
            <div className="flex h-[52px] flex-1 items-center gap-3 rounded-full px-4 shadow-drop-3 !important">
                <Image
                src="/assets/icons/search.svg"
                alt="Search"
                width={24}
                height={24}
                />
                <Input
                placeholder="Search..."
                className="body-2 shad-no-focus  placeholder:body-1 w-full border-none p-0 shadow-none placeholder:text-light-200 !important"
                />
            </div>
        </div>
    </div>
  )
}

export default Search