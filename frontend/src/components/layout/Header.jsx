import logo from '../../assets/images/Logo.png'
import profile from '../../assets/images/profile.png'
import NotificationIcon from '../ui/NotificationIcon'
import ReportIcon from '../ui/ReportIcon'


function Header() {
  return (
    <>
      <div className='px-2 flex justify-between h-18'>
        <div className='flex items-center gap-10'>
          <div className='w-18 h-18 shrink-0 flex items-center'>
            <img className='w-max h-max object-conntain' src={logo} alt="" />
          </div>
          <div className='text-[#025726] font-semibold hidden md:block'>
            {  new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month:"long"
            }).replace(",", ", ")}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <div className='text-[#555555] hidden md:block'>
            Total:20 Orders
          </div>
          <button className='cursor-pointer'>
            <div className='flex bg-[#FFFFFF] px-2 md:px-3 py-2 items-center rounded-full gap-2 h-11'>
              <div className='hidden md:block'>Report</div>
              <div className='w-7 h-7 shirnk-0'>
                <ReportIcon></ReportIcon>
              </div>
            </div>
          </button>
          <button className='cursor-pointer'>
            <div className='flex bg-[#FFFFFF] px-2 py-2 rounded-full relative h-11 w-11'>
              <div className='w-7 h-7 shirnk-0'>
                <NotificationIcon></NotificationIcon>
              </div>
              <div className='absolute bg-[#FF090C] w-4 h-4 rounded-full -top-1 -right-0.5'>
                <div className='text-[12px] text-[#FFFFFF]'>
                  1
                </div>
              </div>
            </div>
          </button>
          <button className='cursor-pointer relative h-20 '>
            <div className='flex bg-[#FFFFFF] px-2 pl-1 pr-1 md:pr-5 items-center rounded-full gap-1 shrink-0 h-11'>
              <div className='border-2 border-[#025726] rounded-full shrink-0'>
                <img className='w-9 h-9 rounded-full object-contain' src={profile} alt="" />
              </div>
              <div className='flex-col items-start mt-1 hidden md:flex'>
                <div className='font-semibold text-nowrap'>Seanghor C</div>
                <div className='text-[12px] text-nowrap'>Cashier</div>
              </div>
            </div>
          </button>
        </div>

      </div>

    </>

  )
}

export default Header