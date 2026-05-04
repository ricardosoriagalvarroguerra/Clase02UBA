import { useEffect, useState } from 'react'
import './InflationFormulaSlide.css'

interface Props { isActive: boolean }

const STEPS = [
  {
    title: 'Tasa entre dos períodos',
    body: 'Una variación porcentual responde a la pregunta “¿en qué proporción cambió algo respecto de su valor anterior?”. Aquí ese “algo” es el IPC. Usaremos la letra griega π (pi) para denotar la tasa de inflación — es la convención universal en macroeconomía.',
  },
  {
    title: 'Numerador: cambio absoluto',
    body: 'En el numerador va la diferencia de precios IPCₜ − IPCₜ₋₁.',
  },
  {
    title: 'Denominador: precio inicial',
    body: 'Dividimos por IPCₜ₋₁ para obtener una variación porcentual: cuánto subió relativo a su nivel previo.',
  },
  {
    title: 'Multiplicar por 100',
    body: 'Para expresar el resultado como porcentaje. Si π = 0,12 la inflación es 12 %.',
  },
]

export function InflationFormulaSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1))
  const reset = () => setStep(0)

  return (
    <div className="infl-form">
      <header className="infl-form__header">
        <p className="infl-form__eyebrow">Definición operativa</p>
        <h2 className="infl-form__title">Fórmula de la tasa de inflación</h2>
        <p className="infl-form__lead">
          Una vez construido el índice de precios, la inflación entre dos períodos se define como
          la variación porcentual del IPC.
        </p>
      </header>

      <div className="infl-form__grid">
        <div className="infl-form__eq" role="math" aria-label="pi sub t igual a IPC sub t menos IPC sub t menos uno todo dividido IPC sub t menos uno por cien">
          <span className="ife__lhs" data-visible={step >= 1}>π<sub>t</sub></span>
          <span className="ife__op" data-visible={step >= 1}>=</span>

          <span className="ife__frac">
            <span className="ife__num">
              <span className="ife__token ife__token--accent" data-visible={step >= 2}>IPC<sub>t</sub></span>
              <span className="ife__token" data-visible={step >= 2}> − </span>
              <span className="ife__token ife__token--accent" data-visible={step >= 2}>IPC<sub>t−1</sub></span>
            </span>
            <span className="ife__bar" data-visible={step >= 3} />
            <span className="ife__den">
              <span className="ife__token" data-visible={step >= 3}>IPC<sub>t−1</sub></span>
            </span>
          </span>

          <span className="ife__op" data-visible={step >= 4}>×</span>
          <span className="ife__token" data-visible={step >= 4}>100</span>
        </div>

        <div className="infl-form__steps">
          {STEPS.map((s, i) => (
            <article key={s.title} className="infl-form__step" data-visible={step >= i + 1}>
              <span className="infl-form__step-num">0{i + 1}</span>
              <div>
                <h4 className="infl-form__step-title">{s.title}</h4>
                <p className="infl-form__step-body">{s.body}</p>
              </div>
            </article>
          ))}
        </div>

        <aside className="infl-form__example" data-visible={step >= STEPS.length}>
          <h4>Ejemplo</h4>
          <p>
            Si IPC<sub>t−1</sub> = 100 e IPC<sub>t</sub> = 112, entonces
            π<sub>t</sub> = (112 − 100) / 100 × 100 = <strong>12 %</strong>. Si t y t−1
            distan un mes, es inflación mensual; si distan un año, es inflación anual.
          </p>
        </aside>
      </div>

      <div className="infl-form__actions">
        {step < STEPS.length ? (
          <button className="infl-form__btn" onClick={next}>
            {step === 0 && 'Plantear la tasa →'}
            {step === 1 && 'Mostrar numerador →'}
            {step === 2 && 'Dividir por precio inicial →'}
            {step === 3 && 'Pasar a porcentaje →'}
          </button>
        ) : (
          <button className="infl-form__btn infl-form__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}
