import React, { useState } from 'react'
import Footer from './Footer'


const Dashboard = () => {


    const generateTable = () => {
        const g = 9.81;

        const massKg =
            ballistic.weightType === "gramm"
                ? ballistic.weight / 1000
                : ballistic.weight * 0.00006479891;

        const v0 =
            ballistic.speedType === "fps"
                ? ballistic.speed * 0.3048
                : ballistic.speed;

        const BC = ballistic.BC ?? 1;

        const rows = [];

        for (let distance = 100; distance <= 1000; distance += 100) {
            // 🧠 very simplified drag model
            const k = ballistic.BCtype === "G1" ? 0.0004 : 0.00035;

            const velocity = v0 * Math.exp((-k * distance) / BC);

            const avgV = (v0 + velocity) / 2;

            const time = distance / avgV;

            const dropMeters = 0.5 * g * time * time;
            const dropCm = dropMeters * 100;

            const energy = 0.5 * massKg * velocity * velocity;

            // MOA calculation
            const moa = (dropCm / (distance * 2.908)) * 100;
            /// MIL calculation 
            const mil = dropCm / (distance * 0.1);

            rows.push({
                distance,
                velocity: velocity.toFixed(1),
                energy: energy.toFixed(1),
                dropCm: dropCm.toFixed(1),
                moa: moa.toFixed(2),
                mil : mil.toFixed(2)
            });
        }

        setResult(rows);
    };





    const [result, setResult] = useState(null);
    const [ballistic, setBallistic] = useState({
        BC: 0,
        BCtype: "G1",
        weight: 0,
        weightType: "gramm",
        speed: 0,
        speedType: "ms",
        zero: 0,
        zeroType: "m",
        temp: 0,
        tempType: "c",
        pressure: 0

    });


    //console.log(ballistic);

    return (



        <div className="container text-center">
            <h2 className="mb-4">Lövészeti adatok</h2>

            <div className="d-flex flex-column align-items-center gap-4">

                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        onChange={(e) => setBallistic({ ...ballistic, BC: (Number)(e.target.value) })}
                        type="number"
                        className="form-control"
                        placeholder="Ballisztikai együttható"

                    />
                    <select onChange={(e) => setBallistic({ ...ballistic, BCtype: e.target.value })} style={{ maxWidth: 90 }} className='form-select'>
                        <option value={"G1"}>G1</option>
                        <option value={"G7"}>G7</option>
                    </select>
                </div>

                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        onChange={(e) => setBallistic({ ...ballistic, weight: (Number)(e.target.value) })}
                        type="number"
                        className="form-control"
                        placeholder="Lövedék tömege"
                    />
                    <select onChange={(e) => setBallistic({ ...ballistic, weightType: e.target.value })} style={{ maxWidth: 90 }} className='form-select'>
                        <option value={"gramm"}>Gramm</option>
                        <option value={"grain"}>Grain</option>
                    </select>

                </div>


                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        onChange={(e) => setBallistic({ ...ballistic, speed: (Number)(e.target.value) })}
                        type="number"
                        className="form-control"
                        placeholder="Lövedék sebessége"
                    />
                    <select onChange={(e) => setBallistic({ ...ballistic, speedType: e.target.value })} style={{ maxWidth: 90 }} className='form-select'>
                        <option value={"ms"}>m/s</option>
                        <option value={"fps"}>fps</option>
                    </select>

                </div>


                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        onChange={(e) => setBallistic({ ...ballistic, zero: (Number)(e.target.value) })}
                        type="number"
                        className="form-control"
                        placeholder="Belövési távolság Zero"
                    />
                    <select onChange={(e) => setBallistic({ ...ballistic, zeroType: e.target.value })} style={{ maxWidth: 90 }} className='form-select'>
                        <option value={"m"}>méter</option>
                        <option value={"y"}>yard</option>
                    </select>

                </div>

                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        onChange={(e) => setBallistic({ ...ballistic, temp: (Number)(e.target.value) })}
                        type="number"
                        className="form-control"
                        placeholder="Hőmérséklet"
                    />
                    <select onChange={(e) => setBallistic({ ...ballistic, tempType: e.target.value })} style={{ maxWidth: 90 }} className='form-select'>
                        <option value={"c"}>celsius</option>
                        <option value={"f"}>fahrenheit</option>
                    </select>

                </div>


                <div style={{ width: 300 }} className='d-flex align-items-center gap-2 mt-2'>
                    <input
                        onChange={(e) => setBallistic({ ...ballistic, pressure: (Number)(e.target.value) })}
                        type="number"
                        className="form-control"
                        placeholder="Légnyomás (hpa)"
                    />
                    {/* <select style={{maxWidth:90}} className='form-select'>
                        <option selected  value={"c"}>celsius</option>
                        <option value={"f"}>fahrenheit</option>
                    </select> */}

                </div>


                <button onClick={generateTable} className='btn btn-secondary'>Számol</button>


                {result && (
                    <div className="mt-4">
                        <table className="table table-dark table-striped">
                            <thead>
                                <tr>
                                    <th>m</th>
                                    <th>m/s</th>
                                    <th>J</th>
                                    <th>drop (cm)</th>
                                    <th>MOA</th>
                                    <th>MRAD</th>
                                </tr>
                            </thead>

                            <tbody>
                                {result.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.distance}</td>
                                        <td>{r.velocity}</td>
                                        <td>{r.energy}</td>
                                        <td>{r.dropCm}</td>
                                        <td>{r.moa}</td>
                                        <td>{r.mil}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}



            </div>
        </div>
    )
}

export default Dashboard