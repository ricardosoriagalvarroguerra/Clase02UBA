import { useEffect, useState } from 'react'
import './RealWageSlide.css'

interface Props { isActive: boolean }

const STEPS = [
  {
    title: 'Salario nominal',
    body: 'Es el monto en pesos que figura en el recibo de sueldo. No dice nada sobre cuánto se puede comprar con él.',
  },
  {
    title: 'Nivel de precios (IPC)',
    body: 'Mide cuánto cuesta la canasta de bienes y servicios en cada momento del tiempo.',
  },
  {
    title: 'Salario real',
    body: 'Resulta de deflactar el salario nominal por el IPC. Muestra el poder adquisitivo: cuántas canastas alcanza a comprar.',
  },
]

export function RealWageSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const next = () => setStep((s) => Math.min(STEPS.length + 1, s + 1))
  const reset = () => setStep(0)

  return (
    <div className="rwage">
      <header className="rwage__header">
        <p className="rwage__eyebrow">Variables nominales y reales</p>
        <h2 className="rwage__title">Salario nominal vs. salario real</h2>
        <p className="rwage__lead">
          La distinción nominal/real recorre toda la macroeconomía: aplica al salario, al PIB,
          al tipo de cambio y a la tasa de interés. Aquí la vemos en el caso del salario.
        </p>
      </header>

      <div className="rwage__grid">
        <div className="rwage__eq" role="math" aria-label="W real igual a W nominal sobre IPC">
          <span className="rwe__lhs" data-visible={step >= 1}>W<sup>real</sup></span>
          <span className="rwe__op" data-visible={step >= 1}>=</span>
          <span className="rwe__frac">
            <span className="rwe__num">
              <span className="rwe__token rwe__token--accent" data-visible={step >= 2}>W<sup>nominal</sup></span>
            </span>
            <span className="rwe__bar" data-visible={step >= 3} />
            <span className="rwe__den">
              <span className="rwe__token" data-visible={step >= 3}>IPC / 100</span>
            </span>
          </span>
        </div>

        <div className="rwage__steps">
          {STEPS.map((s, i) => (
            <article key={s.title} className="rwage__step" data-visible={step >= i + 1}>
              <span className="rwage__step-num">0{i + 1}</span>
              <div>
                <h4 className="rwage__step-title">{s.title}</h4>
                <p className="rwage__step-body">{s.body}</p>
              </div>
            </article>
          ))}
        </div>

        <aside className="rwage__example" data-visible={step >= STEPS.length + 1}>
          <h4>Ejemplo numérico</h4>
          <table className="rwage__table">
            <thead>
              <tr><th></th><th>Año 0</th><th>Año 1</th><th>Var. %</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Salario nominal</td>
                <td className="num">$ 500.000</td>
                <td className="num">$ 700.000</td>
                <td className="num neutral">+40,0 %</td>
              </tr>
              <tr>
                <td>IPC</td>
                <td className="num">100</td>
                <td className="num">160</td>
                <td className="num neutral">+60,0 %</td>
              </tr>
              <tr className="rwage__table-real">
                <td>Salario real</td>
                <td className="num">$ 500.000</td>
                <td className="num">$ 437.500</td>
                <td className="num down">−12,5 %</td>
              </tr>
            </tbody>
          </table>
          <p className="rwage__example-note">
            El salario nominal sube, pero los precios suben más rápido. Resultado: el poder
            de compra cae 12,5 % aunque el recibo muestre un “aumento” del 40 %. Esta misma
            lógica <em>nominal / nivel de precios</em> la aplicaremos en breve a la tasa de
            interés (ecuación de Fisher).
          </p>
        </aside>
      </div>

      <div className="rwage__actions">
        {step < STEPS.length + 1 ? (
          <button className="rwage__btn" onClick={next}>
            {step === 0 && 'Plantear el cociente →'}
            {step === 1 && 'Mostrar numerador →'}
            {step === 2 && 'Dividir por el IPC →'}
            {step === 3 && 'Ver ejemplo numérico →'}
          </button>
        ) : (
          <button className="rwage__btn rwage__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}
