import React from 'react'
import { Route,BrowserRouter,Routes } from 'react-router-dom'
import MainLayout from '../pages/MainLayout'
import Dashboard from '../pages/Dashboard'
import Welcome from '../pages/Welcome'
import Start from '../pages/Start'

const Approute = () => {
  return (
    <BrowserRouter>
    <Routes>   

        <Route path='/' element={<Start/>}/>

        <Route  element={<MainLayout/>}>
            <Route path='/mainlayout' element={<Dashboard/>} />
        </Route>

    </Routes>
    </BrowserRouter>
  )
}

export default Approute