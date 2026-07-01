import React, { useState } from 'react';

// ============================================================
// G1 / G7 Drag táblák (ICAO standard alapján)
// ============================================================
const G1 = [
    [0.0,0.2629],[0.3,0.2214],[0.5,0.2000],[0.7,0.1842],[0.8,0.1783],
    [0.825,0.1771],[0.85,0.1759],[0.875,0.1750],[0.9,0.1788],
    [0.925,0.1920],[0.95,0.2313],[0.975,0.2965],[1.0,0.3062],
    [1.025,0.3845],[1.05,0.4048],[1.1,0.4268],[1.15,0.4377],
    [1.2,0.4445],[1.3,0.4489],[1.4,0.4483],[1.5,0.4450],
    [1.7,0.4375],[2.0,0.4252],[2.5,0.4028],[3.0,0.3772],[5.0,0.2377]
];
const G7 = [
    [0.0,0.1198],[0.5,0.1194],[0.7,0.1202],[0.8,0.1215],
    [0.85,0.1226],[0.9,0.1240],[0.95,0.1280],[0.975,0.1424],
    [1.0,0.1618],[1.025,0.1730],[1.05,0.1778],[1.1,0.1830],
    [1.2,0.1848],[1.3,0.1848],[1.4,0.1839],[1.5,0.1827],
    [2.0,0.1745],[3.0,0.1565],[5.0,0.1205]
];

function getCd(mach, tbl) {
    if (mach <= tbl[0][0]) return tbl[0][1];
    if (mach >= tbl[tbl.length - 1][0]) return tbl[tbl.length - 1][1];
    for (let i = 0; i < tbl.length - 1; i++) {
        if (mach >= tbl[i][0] && mach < tbl[i + 1][0]) {
            const r = (mach - tbl[i][0]) / (tbl[i + 1][0] - tbl[i][0]);
            return tbl[i][1] + r * (tbl[i + 1][1] - tbl[i][1]);
        }
    }
    return tbl[tbl.length - 1][1];
}

// BC átváltás: lb/in² (angolszász ballisztikai BC) -> kg/m²
const BC_CONV = 703.07;

function simulate(angle_rad, v0, BC_imp, massKg, bcType, scopeH, temp_C, pressure_hPa, targets) {
    const g = 9.81;
    const T_K = temp_C + 273.15;
    const sos = 331.3 * Math.sqrt(T_K / 273.15);
    const rho = (pressure_hPa * 100) / (287.05 * T_K);
    const rho0 = 1.2250;
    const tbl = bcType === "G7" ? G7 : G1;
    const BC_si = BC_imp * BC_CONV;

    const dx = 0.25;
    let x = 0, y = -scopeH;
    let vx = v0 * Math.cos(angle_rad);
    let vy = v0 * Math.sin(angle_rad);
    const results = {};
    const tset = new Set(targets);

    for (let step = 0; step < 5000; step++) {
        const v = Math.sqrt(vx * vx + vy * vy);
        if (v < 50) break;

        const mach = v / sos;
        const Cd = getCd(mach, tbl);
        const retard = (rho / rho0) * Cd * v * v / (2 * BC_si);

        const ax = -retard * vx / v;
        const ay = -retard * vy / v - g;
        const dt = dx / Math.max(vx, 1);

        const newVx = vx + ax * dt;
        const newVy = vy + ay * dt;
        const newX = x + dx;
        const newY = y + ((vy + newVy) / 2) * dt;

        for (const t of tset) {
            if (!results[t] && newX >= t) {
                const frac = (t - x) / (newX - x);
                results[t] = {
                    y: y + frac * (newY - y),
                    v: Math.sqrt(
                        Math.pow(vx + frac * (newVx - vx), 2) +
                        Math.pow(vy + frac * (newVy - vy), 2)
                    )
                };
            }
        }

        x = newX; y = newY; vx = newVx; vy = newVy;
        if (x > 1050) break;
    }
    return results;
}

function calculateBallistics({ BC, bcType, weightGrain, v0_ms, scopeHeightMm, zeroDistance_m, temp_C, pressure_hPa }) {
    const massKg = weightGrain * 0.00006479891;
    const scopeH = scopeHeightMm / 1000;
    const allT = [...new Set([zeroDistance_m, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000])].sort((a, b) => a - b);

    let lo = -0.003, hi = 0.015;
    for (let i = 0; i < 70; i++) {
        const mid = (lo + hi) / 2;
        const s = simulate(mid, v0_ms, BC, massKg, bcType, scopeH, temp_C, pressure_hPa, [zeroDistance_m]);
        if (s[zeroDistance_m] && s[zeroDistance_m].y > 0) hi = mid; else lo = mid;
    }
    const zeroAngle = (lo + hi) / 2;
    const pts = simulate(zeroAngle, v0_ms, BC, massKg, bcType, scopeH, temp_C, pressure_hPa, allT);

    const rows = [];
    for (const d of [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]) {
        const p = pts[d];
        if (!p) continue;
        const dcm = p.y * 100;
        const mrad = -(dcm / (d * 0.1));
        const moa = -(dcm / (d * 2.908)) * 100;
        const ej = 0.5 * massKg * p.v * p.v;
        rows.push({
            distance: d,
            velocity: p.v.toFixed(1),
            energy: ej.toFixed(0),
            dropCm: dcm.toFixed(1),
            mrad: mrad.toFixed(2),
            moa: moa.toFixed(2)
        });
    }
    return rows;
}

// ============================================================
// Dashboard komponens
// ============================================================
const defaultState = {
    BC: '',
    BCtype: 'G1',
    weight: '',
    weightType: 'grain',
    speed: '',
    speedType: 'ms',
    zero: '100',
    zeroType: 'm',
    scopeHeight: '38',
    temp: '15',
    tempType: 'c',
    pressure: '1013',
};

export default function Dashboard() {
    const [form, setForm] = useState(defaultState);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleCalculate = () => {
        setError('');
        const BC = parseFloat(form.BC);
        const weight = parseFloat(form.weight);
        const speed = parseFloat(form.speed);
        const zero = parseFloat(form.zero);
        const scopeHeight = parseFloat(form.scopeHeight);
        const temp = parseFloat(form.temp);
        const pressure = parseFloat(form.pressure);

        if (!BC || !weight || !speed || !zero || !scopeHeight) {
            setError('Kérlek töltsd ki az összes kötelező mezőt!');
            return;
        }
        if (BC <= 0 || BC > 2) { setError('BC értéke 0 és 2 között legyen!'); return; }
        if (speed <= 0 || speed > 2000) { setError('Sebesség értéke érvénytelen!'); return; }

        const v0_ms = form.speedType === 'fps' ? speed * 0.3048 : speed;
        const weightGrain = form.weightType === 'gramm' ? weight / 0.00006479891 : weight;
        const zeroDistance_m = form.zeroType === 'y' ? zero * 0.9144 : zero;
        const temp_C = form.tempType === 'f' ? (temp - 32) * 5 / 9 : temp;

        try {
            const rows = calculateBallistics({
                BC, bcType: form.BCtype,
                weightGrain, v0_ms,
                scopeHeightMm: scopeHeight,
                zeroDistance_m,
                temp_C,
                pressure_hPa: pressure || 1013.25
            });
            setResult(rows);
        } catch (e) {
            setError('Számítási hiba. Ellenőrizd a megadott értékeket!');
        }
    };

    const Field = ({ label, inputKey, placeholder, unitKey, units }) => (
        <div className="mb-3">
            <label className="form-label fw-semibold small text-secondary">{label}</label>
            <div className="input-group">
                <input
                    type="number"
                    className="form-control"
                    placeholder={placeholder}
                    value={form[inputKey]}
                    onChange={e => set(inputKey, e.target.value)}
                />
                {units && (
                    <select
                        className="form-select"
                        style={{ maxWidth: 100 }}
                        value={form[unitKey]}
                        onChange={e => set(unitKey, e.target.value)}
                    >
                        {units.map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );

    return (
        <div className="container py-4" style={{ maxWidth: 720 }}>
            <h4 className="mb-1 fw-bold">Lövészeti adatok</h4>
            <p className="text-secondary small mb-4">Töltsd ki az adatokat, majd kattints a Számol gombra</p>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="row g-3">
                        {/* BC */}
                        <div className="col-12">
                            <label className="form-label fw-semibold small text-secondary">Ballisztikai együttható (BC)</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="pl. 0.646"
                                    value={form.BC}
                                    onChange={e => set('BC', e.target.value)}
                                />
                                <select
                                    className="form-select"
                                    style={{ maxWidth: 90 }}
                                    value={form.BCtype}
                                    onChange={e => set('BCtype', e.target.value)}
                                >
                                    <option value="G1">G1</option>
                                    <option value="G7">G7</option>
                                </select>
                            </div>
                        </div>

                        {/* Tömeg */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-secondary">Lövedék tömege</label>
                            <div className="input-group">
                                <input type="number" className="form-control" placeholder="pl. 140"
                                    value={form.weight} onChange={e => set('weight', e.target.value)} />
                                <select className="form-select" style={{ maxWidth: 100 }}
                                    value={form.weightType} onChange={e => set('weightType', e.target.value)}>
                                    <option value="grain">grain</option>
                                    <option value="gramm">gramm</option>
                                </select>
                            </div>
                        </div>

                        {/* Sebesség */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-secondary">Torkolati sebesség (v₀)</label>
                            <div className="input-group">
                                <input type="number" className="form-control" placeholder="pl. 840"
                                    value={form.speed} onChange={e => set('speed', e.target.value)} />
                                <select className="form-select" style={{ maxWidth: 90 }}
                                    value={form.speedType} onChange={e => set('speedType', e.target.value)}>
                                    <option value="ms">m/s</option>
                                    <option value="fps">fps</option>
                                </select>
                            </div>
                        </div>

                        {/* Zero */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-secondary">Zero távolság</label>
                            <div className="input-group">
                                <input type="number" className="form-control" placeholder="100"
                                    value={form.zero} onChange={e => set('zero', e.target.value)} />
                                <select className="form-select" style={{ maxWidth: 100 }}
                                    value={form.zeroType} onChange={e => set('zeroType', e.target.value)}>
                                    <option value="m">méter</option>
                                    <option value="y">yard</option>
                                </select>
                            </div>
                        </div>

                        {/* Scope height */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-secondary">Cső–távcső tengelytáv (mm)</label>
                            <input type="number" className="form-control" placeholder="pl. 38"
                                value={form.scopeHeight} onChange={e => set('scopeHeight', e.target.value)} />
                        </div>

                        {/* Hőmérséklet */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-secondary">Hőmérséklet</label>
                            <div className="input-group">
                                <input type="number" className="form-control" placeholder="15"
                                    value={form.temp} onChange={e => set('temp', e.target.value)} />
                                <select className="form-select" style={{ maxWidth: 100 }}
                                    value={form.tempType} onChange={e => set('tempType', e.target.value)}>
                                    <option value="c">°C</option>
                                    <option value="f">°F</option>
                                </select>
                            </div>
                        </div>

                        {/* Légnyomás */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-secondary">Légnyomás (hPa)</label>
                            <input type="number" className="form-control" placeholder="1013"
                                value={form.pressure} onChange={e => set('pressure', e.target.value)} />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger mt-3 py-2 small">{error}</div>
                    )}

                    <div className="mt-4">
                        <button className="btn btn-primary px-5" onClick={handleCalculate}>
                            Számol
                        </button>
                    </div>
                </div>
            </div>

            {result && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            <thead className="table-dark">
                                <tr>
                                    <th className="ps-3">Táv</th>
                                    <th>m/s</th>
                                    <th>Joul</th>
                                    <th>Drop (cm)</th>
                                    <th className="text-warning">MRAD ↑</th>
                                    <th className='text-primary'>MOA ↑</th>
                                    <th className="text-warning">MRAD 1/10</th>
                                    <th className='text-primary'>MOA 1/4</th>
                                    <th className='text-primary'>MOA 1/8</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.map((r, i) => {
                                    const drop = parseFloat(r.dropCm);
                                    const mrad = parseFloat(r.mrad);
                                    
                                    return (
                                        <tr key={i}>
                                            <td className="ps-3 fw-semibold">{r.distance}m</td>
                                            <td>{r.velocity}</td>
                                            <td>{r.energy}</td>
                                            <td className={drop < -5 ? 'text-danger' : ''}>
                                                {drop > 0 ? '+' : ''}{r.dropCm}
                                            </td>
                                            <td className="fw-bold text-warning">
                                                {mrad > 0 ? '+' : ''}{r.mrad}
                                            </td>
                                            <td className='fw-bold text-primary'>
                                                {r.moa}
                                            </td>
                                            <td>{Math.round(r.mrad *10)} click</td>
                                            <td >{Math.round(r.moa  * 4)} click</td>
                                            <td>{Math.round(r.moa  * 8)} click</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="px-3 py-2 text-secondary" style={{ fontSize: '0.75rem' }}>
                            ↑ = felfelé kell tekerni a távcsövön a zero távolságon túl
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}