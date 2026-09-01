import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MasterLayout from './components/layout/MasterLayout'
import Home from './pages/Home'
import Cart from './pages/Cart'


function App() {

  return (
  <>
    <BrowserRouter>
     <Routes>
       <Route element={<MasterLayout></MasterLayout>}>
          <Route path='/' element={<Home></Home>}></Route>
          <Route path='/cart' element={<Cart></Cart>}></Route>
       </Route>
     </Routes>
    </BrowserRouter>
  </>
  )
}

export default App
