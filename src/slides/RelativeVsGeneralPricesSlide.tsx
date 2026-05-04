import { useEffect, useState } from 'react'
import './RelativeVsGeneralPricesSlide.css'

interface Props { isActive: boolean }

interface Item {
  name: string
  weight: number
  changeA: number
  changeB: number
}

const ITEMS: Item[] = [
  { name: 'Pan',  weight: 0.30, changeA: 15,  changeB: 25 },
  { name: 'Leche', weight: 0.40, changeA: -10, changeB: 20 },
  { name: 'Ropa', weight: 0.30, changeA: 0,   changeB: 28 },
]

const avg = (key: 'changeA' | 'changeB') =>
  ITEMS.reduce((acc, it) => acc + it.weight * it[key], 0)

export function RelativeVsGeneralPricesSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const advance = () => setStep((s) => Math.min(2, s + 1))
  const reset = () => setStep(0)

  const avgA = avg('changeA')
  const avgB = avg('changeB')

  return (
    <div className="rgp">
      <header className="rgp__header">
        <p className="rgp__eyebrow">De un precio a muchos</p>
        <h2 className="rgp__title">Precios relativos vs. nivel general</h2>
        <p className="rgp__lead">
          Que un precio suba <em>no</em> es lo mismo que haya inflación. Cuando un bien sube y
          otro baja, lo que cambia es el <strong>precio relativo</strong> entre ellos. La inflación
          aparece sólo cuando casi todos los precios suben a la vez — es decir, cuando se mueve el
          <strong> nivel general</strong>.
        </p>
      </header>

      <div className="rgp__grid">
        <ScenarioCard
          variant="relative"
          visible={step >= 1}
          eyebrow="Escenario A"
          title="Sólo cambian precios relativos"
          items={ITEMS.map((it) => ({ ...it, change: it.changeA }))}
          average={avgA}
          conclusion={
            <>
              Algunos precios suben, otros bajan, otros quedan igual. El <strong>promedio ponderado</strong>
              {' '}casi no se mueve: el nivel general queda estable. Lo que cambió fue la
              {' '}<em>relación</em> entre los bienes — el pan se volvió relativamente más caro
              {' '}que la leche, no “todo más caro”.
            </>
          }
        />

        <ScenarioCard
          variant="general"
          visible={step >= 2}
          eyebrow="Escenario B"
          title="Inflación: sube el nivel general"
          items={ITEMS.map((it) => ({ ...it, change: it.changeB }))}
          average={avgB}
          conclusion={
            <>
              Todos los precios suben (más o menos). El <strong>promedio ponderado</strong>
              {' '}también sube: el nivel general aumentó ~{avgB.toFixed(0)} %. Esto es lo que
              {' '}medimos como <strong>tasa de inflación</strong>: la variación porcentual
              {' '}del nivel general de precios.
            </>
          }
        />
      </div>

      <div className="rgp__keypoints" data-visible={step >= 2}>
        <article className="rgp__keypoint">
          <span className="rgp__keypoint-tag">Idea clave</span>
          <p>
            Un precio individual contiene <strong>dos</strong> tipos de información: cuánto vale
            ese bien <em>en sí</em> y cuánto vale <em>respecto del resto</em>. La inflación hace
            ruido sobre el segundo: con todos los precios moviéndose rápido, se vuelve difícil
            distinguir qué está realmente caro y qué barato.
          </p>
        </article>
      </div>

      <div className="rgp__actions">
        {step < 2 ? (
          <button className="rgp__btn" onClick={advance}>
            {step === 0 ? 'Mostrar Escenario A →' : 'Mostrar Escenario B →'}
          </button>
        ) : (
          <button className="rgp__btn rgp__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}

interface CardProps {
  variant: 'relative' | 'general'
  visible: boolean
  eyebrow: string
  title: string
  items: Array<{ name: string; weight: number; change: number }>
  average: number
  conclusion: React.ReactNode
}

function ScenarioCard({ variant, visible, eyebrow, title, items, average, conclusion }: CardProps) {
  const maxAbs = Math.max(...items.map((i) => Math.abs(i.change)), Math.abs(average), 1)
  return (
    <article className={`rgp__card rgp__card--${variant}`} data-visible={visible}>
      <header className="rgp__card-head">
        <span className="rgp__card-eyebrow">{eyebrow}</span>
        <h3 className="rgp__card-title">{title}</h3>
      </header>

      <div className="rgp__bars">
        {items.map((it) => (
          <div key={it.name} className="rgp__bar-row">
            <span className="rgp__bar-name">{it.name}</span>
            <span className="rgp__bar-weight">peso {Math.round(it.weight * 100)}%</span>
            <div className="rgp__bar-track">
              <div className="rgp__bar-axis" />
              <div
                className={`rgp__bar-fill ${it.change >= 0 ? 'rgp__bar-fill--up' : 'rgp__bar-fill--down'}`}
                style={{
                  width: `${(Math.abs(it.change) / maxAbs) * 50}%`,
                  marginLeft: it.change >= 0 ? '50%' : `${50 - (Math.abs(it.change) / maxAbs) * 50}%`,
                }}
              />
            </div>
            <span
              className={`rgp__bar-val ${it.change >= 0 ? 'rgp__bar-val--up' : 'rgp__bar-val--down'}`}
            >
              {it.change >= 0 ? '+' : ''}{it.change} %
            </span>
          </div>
        ))}

        <div className="rgp__bar-row rgp__bar-row--avg">
          <span className="rgp__bar-name">Promedio ponderado</span>
          <span className="rgp__bar-weight">100 %</span>
          <div className="rgp__bar-track">
            <div className="rgp__bar-axis" />
            <div
              className={`rgp__bar-fill rgp__bar-fill--avg ${average >= 0 ? 'rgp__bar-fill--up' : 'rgp__bar-fill--down'}`}
              style={{
                width: `${(Math.abs(average) / maxAbs) * 50}%`,
                marginLeft: average >= 0 ? '50%' : `${50 - (Math.abs(average) / maxAbs) * 50}%`,
              }}
            />
          </div>
          <span
            className={`rgp__bar-val rgp__bar-val--avg ${average >= 0 ? 'rgp__bar-val--up' : 'rgp__bar-val--down'}`}
          >
            {average >= 0 ? '+' : ''}{average.toFixed(1)} %
          </span>
        </div>
      </div>

      <p className="rgp__card-conclusion">{conclusion}</p>
    </article>
  )
}
