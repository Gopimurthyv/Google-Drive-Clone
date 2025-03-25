import Image from 'next/image'

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen'>
      <section className='hidden w-1/2 items-center max-h-full justify-center bg-blue-900 p-10 lg:flex xl:w-2/5 shadow-lg'>
        <div className='flex max-h-[400px] max-w-[430px] flex-col justify-center space-x-12'>
        
        <div className='space-y-5 text-white'>
          <h1 className='font-bold text-4xl text-white'>Manage Your Files the Best Way</h1>
          <p className='italic'>This is a place where you can store all your document.</p>
        </div>
        <Image 
          src="/assets/authLayout.png"
          alt='Files'
          width={321}
          height={321}
          className='transition-all hover:rotate-2 hover:scale-105 mr-2'
        />
        </div>
      </section>

      <section className='flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0'>
        <div className='mb-16 lg:hidden '>
          <Image 
          src="/assets/authLayout.png"
          alt='logo'
          width={321}
          height={321}
        />
        </div>
        {children}
      </section>
    </div>
  );
}
