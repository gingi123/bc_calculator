import React from 'react'
import Footer from './Footer'

const Dashboard = () => {
    return (

 

        <div className="container text-center">
            <h2 className="mb-4">Lövészeti adatok</h2>

            <div className="d-flex flex-column align-items-center gap-4">

                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ballisztikai együttható "
                    />
                    <select style={{maxWidth:90}} className='form-select'>
                        <option selected  value={1}>G1</option>
                        <option value={7}>G7</option>
                    </select>
                </div>

                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Lövedék tömege"
                    />
                    <select style={{maxWidth:90}} className='form-select'>
                        <option selected  value={"gramm"}>Gramm</option>
                        <option value={"grain"}>Grain</option>
                    </select>

                </div>


                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Lövedék sebessége"
                    />
                    <select style={{maxWidth:90}} className='form-select'>
                        <option selected  value={"ms"}>m/s</option>
                        <option value={"fps"}>fps</option>
                    </select>

                </div>


                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Belövési távolság Zero"
                    />
                    <select style={{maxWidth:90}} className='form-select'>
                        <option selected  value={"m"}>méter</option>
                        <option value={"y"}>yard</option>
                    </select>

                </div>

            

            </div>
        </div>
    )
}

export default Dashboard