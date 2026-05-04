import { useEffect, useState } from 'react'
import './StudentBasketSlide.css'

interface Item {
  key: string
  label: string
  emoji: string
  prices: [number, number, number, number]
}

const PERIODS = ['Nov 2023', 'Jul 2024', 'Dic 2024', 'May 2026'] as const
const PERIOD_NOTES = [
  'antes de la devaluación',
  'shock inflacionario',
  'desaceleración',
  'hoy',
] as const

// Valores ilustrativos en pesos corrientes, redondeados, basados en
// trayectoria del IPC INDEC y precios típicos de CABA (estudiante UBA).
const ITEMS: Item[] = [
  { key: 'sube',     label: 'Viaje en subte (SUBE)',         emoji: '🚇', prices: [80, 574, 757, 1100] },
  { key: 'cafe',     label: 'Café con medialunas',           emoji: '☕', prices: [1800, 4500, 5800, 7500] },
  { key: 'combo',    label: 'Combo en local de comida',      emoji: '🍔', prices: [4500, 9500, 12000, 15000] },
  { key: 'apunte',   label: 'Apunte / fotocopias materia',   emoji: '📚', prices: [1200, 3000, 4200, 5500] },
  { key: 'spotify',  label: 'Spotify Premium',               emoji: '🎧', prices: [1500, 4200, 5500, 6500] },
  { key: 'pieza',    label: 'Habitación en depto compartido (mes)', emoji: '🏠', prices: [90000, 230000, 320000, 430000] },
]

// Sueldo neto típico de pasantía UBA / media jornada, redondeado.
const SALARIES: [number, number, number, number] = [200000, 400000, 550000, 900000]

const formatARS = (n: number) =>
  '$ ' + n.toLocaleString('es-AR', { maximumFractionDigits: 0 })

export function StudentBasketSlide() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        setStep((s) => (s + 1) % 4)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const totals = PERIODS.map((_, i) =>
    ITEMS.reduce((acc, it) => acc + it.prices[i], 0),
  ) as [number, number, number, number]

  const ratio = (i: number) => totals[i] / SALARIES[i]

  const baseSalary = SALARIES[0]
  const realSalary = SALARIES.map((s, i) => (s * (totals[0] / totals[i])))

  return (
    <div className="sbs">
      <header className="sbs__header">
        <p className="sbs__eyebrow">Aterrizando los conceptos · escenario UBA</p>
        <h2 className="sbs__title">La quincena de Lucía</h2>
        <p className="sbs__lead">
          Lucía cursa Economía en la UBA y trabaja media jornada en una pasantía.
          Mismos consumos todos los meses: el subte para ir a la facu, un café
          en Plaza Italia, el alquiler de la pieza en Caballito. <strong>Cambian los
          precios y cambia su sueldo</strong> — pero no al mismo ritmo.
        </p>
      </header>

      <div className="sbs__table-wrap">
        <table className="sbs__table">
          <thead>
            <tr>
              <th className="sbs__th sbs__th--item">Consumo típico</th>
              {PERIODS.map((p, i) => (
                <th
                  key={p}
                  className="sbs__th sbs__th--period"
                  data-active={step === i}
                  onClick={() => setStep(i)}
                >
                  <span className="sbs__th-period">{p}</span>
                  <span className="sbs__th-note">{PERIOD_NOTES[i]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((it) => (
              <tr key={it.key}>
                <td className="sbs__td sbs__td--item">
                  <span className="sbs__emoji" aria-hidden>{it.emoji}</span>
                  {it.label}
                </td>
                {it.prices.map((p, i) => (
                  <td key={i} className="sbs__td sbs__td--price" data-active={step === i}>
                    {formatARS(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="sbs__row-total">
              <td className="sbs__td sbs__td--item"><strong>Total mensual</strong></td>
              {totals.map((t, i) => (
                <td key={i} className="sbs__td sbs__td--total" data-active={step === i}>
                  {formatARS(t)}
                </td>
              ))}
            </tr>
            <tr className="sbs__row-salary">
              <td className="sbs__td sbs__td--item">Sueldo neto (pasantía media jornada)</td>
              {SALARIES.map((s, i) => (
                <td key={i} className="sbs__td sbs__td--salary" data-active={step === i}>
                  {formatARS(s)}
                </td>
              ))}
            </tr>
            <tr className="sbs__row-ratio">
              <td className="sbs__td sbs__td--item">
                ¿Qué % del sueldo se va en estos consumos?
              </td>
              {PERIODS.map((_, i) => (
                <td key={i} className="sbs__td sbs__td--ratio" data-active={step === i}>
                  <div className="sbs__bar">
                    <div
                      className="sbs__bar-fill"
                      style={{ width: `${Math.min(100, ratio(i) * 100)}%` }}
                    />
                  </div>
                  <span className="sbs__ratio-num">
                    {(ratio(i) * 100).toFixed(0)}%
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="sbs__footer">
        <div className="sbs__metric">
          <span className="sbs__metric-label">Sueldo nominal · Nov 2023 → May 2026</span>
          <span className="sbs__metric-value">
            {formatARS(SALARIES[0])} → {formatARS(SALARIES[3])}
            <em className="sbs__metric-delta sbs__metric-delta--up">
              ×{(SALARIES[3] / SALARIES[0]).toFixed(1)}
            </em>
          </span>
        </div>
        <div className="sbs__metric">
          <span className="sbs__metric-label">Canasta de Lucía · Nov 2023 → May 2026</span>
          <span className="sbs__metric-value">
            {formatARS(totals[0])} → {formatARS(totals[3])}
            <em className="sbs__metric-delta sbs__metric-delta--up">
              ×{(totals[3] / totals[0]).toFixed(1)}
            </em>
          </span>
        </div>
        <div className="sbs__metric sbs__metric--highlight">
          <span className="sbs__metric-label">Sueldo real (en consumos de Lucía)</span>
          <span className="sbs__metric-value">
            {formatARS(baseSalary)} → {formatARS(Math.round(realSalary[3]))}
            <em className={`sbs__metric-delta ${realSalary[3] < baseSalary ? 'sbs__metric-delta--down' : 'sbs__metric-delta--up'}`}>
              {realSalary[3] < baseSalary ? '−' : '+'}
              {Math.abs(((realSalary[3] / baseSalary) - 1) * 100).toFixed(0)}%
            </em>
          </span>
        </div>
      </div>

      <p className="sbs__caption">
        Valores ilustrativos en pesos corrientes (CABA, redondeados) consistentes con la
        trayectoria del IPC INDEC y del salario registrado RIPTE. La idea no es la cifra
        exacta sino la <strong>velocidad relativa</strong>: precios y sueldos no se mueven
        a la par, y eso es exactamente lo que mide el salario real.
      </p>
    </div>
  )
}
