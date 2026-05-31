import { useState } from 'react'
import { DotHalftone, type DotHalftoneProps } from './DotHalftone'
import './App.css'

type Sample = {
  label: string
  src: string
  gradient?: DotHalftoneProps['gradient']
}

const SAMPLES: Sample[] = [
  { label: 'Rocket', src: '/samples/startups.png', gradient: ['#ff6ea6', '#7b2ff7'] },
  { label: 'City', src: '/samples/enterprise.png' },
  { label: 'Servers', src: '/samples/platform.png' },
  { label: 'Robot', src: '/samples/ai-native.png', gradient: ['#ffc98a', '#f97316'] },
]

export default function App() {
  const [active, setActive] = useState(0)
  const sample = SAMPLES[active]

  return (
    <main className="page">
      <header className="intro">
        <h1>Halftone Dots</h1>
        <p>
          Any image, recreated as an animated dot halftone on a single canvas.
          Pick one and watch the dots implode and explode into the next.
        </p>
      </header>

      <DotHalftone
        className="stage"
        src={sample.src}
        gradient={sample.gradient}
      />

      <div className="switcher" role="tablist" aria-label="Sample images">
        {SAMPLES.map((s, i) => (
          <button
            key={s.label}
            role="tab"
            aria-selected={i === active}
            className={i === active ? 'is-active' : ''}
            onClick={() => setActive(i)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </main>
  )
}
