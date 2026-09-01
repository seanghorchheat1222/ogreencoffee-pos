import Header from './Header'
import { Outlet } from 'react-router-dom'

function MasterLayout() {
  return (
    <>
      <Header></Header>
      <main className='pl-2  pt-4 pb-4'>
        <Outlet></Outlet>
      </main>
    </>
  )
}

export default MasterLayout