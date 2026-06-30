import React from 'react'
import Topbar from '../components/Topbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import 'bootstrap/dist/css/bootstrap.min.css';

const MainLayout = () => {
  return (

    
        <div className='d-flex flex-column min-vh-100'>

            <header>
                <Topbar/>
            </header>

                <main className='flex-grow-1'>
                    <Outlet/>
                </main>

            <footer className='mt-auto'>
                <Footer/>
            </footer>

        </div>
   
  )
}

export default MainLayout