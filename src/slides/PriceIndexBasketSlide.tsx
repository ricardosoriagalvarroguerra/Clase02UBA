import { useEffect, useMemo, useState } from 'react'
import './PriceIndexBasketSlide.css'

type IconKey = 'bread' | 'milk' | 'meat' | 'bus' | 'home'

interface Item {
  name: string
  unit: string
  qty: number
  p0: number
  p1: number
  icon: IconKey
}

const BASKET: Item[] = [
  { name: 'Pan',      unit: 'kg',     qty: 4,   p0: 1200, p1: 1500, icon: 'bread' },
  { name: 'Leche',    unit: 'L',      qty: 8,   p0: 900,  p1: 1100, icon: 'milk' },
  { name: 'Carne',    unit: 'kg',     qty: 3,   p0: 6000, p1: 7800, icon: 'meat' },
  { name: 'Transporte', unit: 'viaje', qty: 40,  p0: 500,  p1: 700,  icon: 'bus' },
  { name: 'Alquiler', unit: 'mes',    qty: 1,   p0: 250000, p1: 320000, icon: 'home' },
]

function BasketIcon({ name }: { name: IconKey }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'bread':
      return (
        <svg {...common}>
          <path d="M5 13c0-3 2-5 7-5s7 2 7 5v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4z" />
          <path d="M9 11v6M12 10v7M15 11v6" />
        </svg>
      )
    case 'milk':
      return (
        <svg {...common}>
          <path d="M9 3h6v3l1 3v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l1-3V3z" />
          <path d="M9 12h6" />
        </svg>
      )
    case 'meat':
      return (
        <svg {...common}>
          <path d="M7 14a5 5 0 0 1 5-5l4 1a3 3 0 0 1 2 4l-1 4a3 3 0 0 1-3 2H10a3 3 0 0 1-3-3v-3z" />
          <circle cx="11" cy="13" r="1.4" />
        </svg>
      )
    case 'bus':
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="11" rx="2" />
          <path d="M4 12h16" />
          <circle cx="8" cy="19" r="1.5" />
          <circle cx="16" cy="19" r="1.5" />
          <path d="M7 9h3M14 9h3" />
        </svg>
      )
    case 'home':
      return (
        <svg {...common}>
          <path d="M4 11l8-7 8 7" />
          <path d="M6 10v9h12v-9" />
          <path d="M10 19v-5h4v5" />
        </svg>
      )
  }
}

interface Props { isActive: boolean }

export function PriceIndexBasketSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const totals = useMemo(() => {
    const t0 = BASKET.reduce((acc, it) => acc + it.qty * it.p0, 0)
    const t1 = BASKET.reduce((acc, it) => acc + it.qty * it.p1, 0)
    return { t0, t1, ratio: t1 / t0 }
  }, [])

  const fmt = (n: number) => '$' + n.toLocaleString('es-AR')

  const steps = BASKET.length + 2 // reveal items + total + index
  const advance = () => setStep((s) => Math.min(steps, s + 1))
  const reset = () => setStep(0)

  return (
    <div className="ipc-bk">
      <header className="ipc-bk__header">
        <p className="ipc-bk__eyebrow">Construcción del IPC</p>
        <h2 className="ipc-bk__title">El índice como precio de una canasta fija</h2>
        <p className="ipc-bk__lead">
          Definimos una canasta representativa de bienes y servicios, fijamos las cantidades
          y observamos cómo cambia su costo total entre dos momentos del tiempo.
        </p>
      </header>

      <div className="ipc-bk__table">
        <div className="ipc-bk__row ipc-bk__row--head">
          <span>Bien</span>
          <span>Cantidad</span>
          <span>Precio en t₀</span>
          <span>Precio en t₁</span>
          <span>Gasto t₀</span>
          <span>Gasto t₁</span>
        </div>
        {BASKET.map((it, i) => (
          <div key={it.name} className="ipc-bk__row" data-visible={step > i}>
            <span className="ipc-bk__name">
              <span className="ipc-bk__icon" aria-hidden><BasketIcon name={it.icon} /></span>
              {it.name}
            </span>
            <span className="ipc-bk__num">{it.qty} {it.unit}</span>
            <span className="ipc-bk__num">{fmt(it.p0)}</span>
            <span className="ipc-bk__num ipc-bk__num--up">{fmt(it.p1)}</span>
            <span className="ipc-bk__num">{fmt(it.qty * it.p0)}</span>
            <span className="ipc-bk__num ipc-bk__num--up">{fmt(it.qty * it.p1)}</span>
          </div>
        ))}

        <div className="ipc-bk__row ipc-bk__row--total" data-visible={step > BASKET.length}>
          <span>Costo de la canasta</span>
          <span />
          <span />
          <span />
          <span className="ipc-bk__num">{fmt(totals.t0)}</span>
          <span className="ipc-bk__num ipc-bk__num--up">{fmt(totals.t1)}</span>
        </div>
      </div>

      <aside className="ipc-bk__index" data-visible={step >= steps}>
        <div className="ipc-bk__index-row">
          <span className="ipc-bk__index-label">IPC en t₀ (base)</span>
          <span className="ipc-bk__index-val">100</span>
        </div>
        <div className="ipc-bk__index-row">
          <span className="ipc-bk__index-label">IPC en t₁</span>
          <span className="ipc-bk__index-val ipc-bk__index-val--accent">
            {(totals.ratio * 100).toFixed(1)}
          </span>
        </div>
        <div className="ipc-bk__index-row ipc-bk__index-row--inflation">
          <span className="ipc-bk__index-label">Inflación π = (IPC<sub>t₁</sub> / IPC<sub>t₀</sub>) − 1</span>
          <span className="ipc-bk__index-inflation">
            {((totals.ratio - 1) * 100).toFixed(1)} %
          </span>
        </div>
        <p className="ipc-bk__index-note">
          Por convención, al costo de la canasta en el período base se le asigna el valor 100
          (es decir, multiplicamos el cociente costo<sub>t</sub>/costo<sub>t₀</sub> por 100). Así un IPC de 125
          significa que la canasta cuesta un 25 % más que en la base. La variación porcentual del
          índice entre dos momentos es la <strong>tasa de inflación</strong>.
        </p>
      </aside>

      <div className="ipc-bk__actions">
        {step < steps ? (
          <>
            <div className="ipc-bk__progress" aria-hidden>
              {Array.from({ length: steps }, (_, i) => (
                <span
                  key={i}
                  className="ipc-bk__progress-dot"
                  data-active={i < step}
                />
              ))}
            </div>
            <button className="ipc-bk__btn" onClick={advance}>
              {step < BASKET.length && 'Agregar siguiente bien →'}
              {step === BASKET.length && 'Calcular costo total →'}
              {step === BASKET.length + 1 && 'Construir el índice →'}
            </button>
          </>
        ) : (
          <button className="ipc-bk__btn ipc-bk__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}
