import React from 'react'

const WORLD_LINES_URL = `${process.env.PUBLIC_URL}/images/world-lines.svg`

const ENERGY_LINES = [
    { d: 'M-40 470 C 220 380, 420 520, 700 420 S 1100 300, 1260 360', duration: 9, delay: 0 },
    { d: 'M-40 300 C 180 240, 380 360, 620 280 S 1000 140, 1260 200', duration: 11, delay: -4 },
    { d: 'M-40 140 C 260 200, 460 60, 760 130 S 1080 250, 1260 120', duration: 13, delay: -7 },
    { d: 'M-40 560 C 300 500, 560 600, 840 520 S 1140 460, 1260 500', duration: 10, delay: -2 },
    { d: 'M-40 380 C 240 440, 520 300, 780 350 S 1120 420, 1260 280', duration: 12, delay: -9 },
]

const HeroBackdrop = () => (
    <div className="pt-backdrop" aria-hidden="true">
        <div className="pt-backdrop__world" style={{ backgroundImage: `url(${WORLD_LINES_URL})` }} />
        <svg className="pt-backdrop__energy" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="pt-energy-stroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#16325a" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#24497d" />
                    <stop offset="1" stopColor="#c49a3c" />
                </linearGradient>
            </defs>
            {ENERGY_LINES.map((line) => (
                <g key={line.d}>
                    <path className="pt-backdrop__track" d={line.d} />
                    <path
                        className="pt-backdrop__pulse"
                        d={line.d}
                        pathLength="1000"
                        style={{ animationDuration: `${line.duration}s`, animationDelay: `${line.delay}s` }}
                    />
                </g>
            ))}
        </svg>
    </div>
)

export default HeroBackdrop
