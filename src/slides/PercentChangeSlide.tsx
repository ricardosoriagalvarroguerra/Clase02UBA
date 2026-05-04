import { useEffect, useState } from 'react'
import './PercentChangeSlide.css'

interface Props { isActive: boolean }

const STEPS = [
  {
    title: 'Plantear la fórmula',
    body: 'Una variación porcentual responde a la pregunta “¿en qué proporción cambió algo respecto de su valor anterior?”. Se calcula como la diferencia entre dos valores, dividida por el valor inicial, multiplicada por 100.',
  },
  {
    title: 'Calcular la diferencia',
    body: 'Restá el valor nuevo menos el viejo. Si el resultado es positivo, hubo aumento; si es negativo, hubo caída.',
  },
  {
    title: 'Dividir por el valor inicial',
    body: 'Dividir por el valor anterior — y no por el nuevo — es la clave: estamos midiendo el cambio “relativo a lo que había antes”.',
  },
  {
    title: 'Multiplicar por 100',
    body: 'Para expresar el resultado como porcentaje. Una variación de 0,30 es un 30 %.',
  },
]

export function PercentChangeSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1))
  const reset = () => setStep(0)

  return (
    <div className="pct">
      <header className="pct__header">
        <p className="pct__eyebrow">Herramienta matemática</p>
        <h2 className="pct__title">Variación porcentual</h2>
        <p className="pct__lead">
          Para hablar de inflación, salario real o tasas de interés vamos a comparar números en
          dos momentos del tiempo. La <strong>variación porcentual</strong> es la herramienta básica
          para esa comparación.
        </p>
      </header>

      <div className="pct__grid">
        <div className="pct__eq" role="math" aria-label="variación porcentual igual a valor nuevo menos valor viejo sobre valor viejo por cien">
          <span className="pct-eq__lhs" data-visible={step >= 1}>Δ %</span>
          <span className="pct-eq__op" data-visible={step >= 1}>=</span>
          <span className="pct-eq__frac">
            <span className="pct-eq__num">
              <span className="pct-eq__token pct-eq__token--accent" data-visible={step >= 2}>V<sub>nuevo</sub></span>
              <span className="pct-eq__token" data-visible={step >= 2}> − </span>
              <span className="pct-eq__token pct-eq__token--accent" data-visible={step >= 2}>V<sub>viejo</sub></span>
            </span>
            <span className="pct-eq__bar" data-visible={step >= 3} />
            <span className="pct-eq__den">
              <span className="pct-eq__token" data-visible={step >= 3}>V<sub>viejo</sub></span>
            </span>
          </span>
          <span className="pct-eq__op" data-visible={step >= 4}>×</span>
          <span className="pct-eq__token" data-visible={step >= 4}>100</span>
        </div>

        <div className="pct__steps">
          {STEPS.map((s, i) => (
            <article key={s.title} className="pct__step" data-visible={step >= i + 1}>
              <span className="pct__step-num">0{i + 1}</span>
              <div>
                <h4 className="pct__step-title">{s.title}</h4>
                <p className="pct__step-body">{s.body}</p>
              </div>
            </article>
          ))}
        </div>

        <aside className="pct__example" data-visible={step >= STEPS.length}>
          <h4>Ejemplo</h4>
          <table className="pct__table">
            <tbody>
              <tr>
                <td>Precio del kilo de pan en enero</td>
                <td className="num">$ 1.000</td>
              </tr>
              <tr>
                <td>Precio del kilo de pan en febrero</td>
                <td className="num">$ 1.300</td>
              </tr>
              <tr>
                <td>Diferencia ($1.300 − $1.000)</td>
                <td className="num">$ 300</td>
              </tr>
              <tr>
                <td>Sobre el precio inicial ($300 / $1.000)</td>
                <td className="num">0,30</td>
              </tr>
              <tr className="pct__row-result">
                <td>Variación porcentual</td>
                <td className="num">+30 %</td>
              </tr>
            </tbody>
          </table>
        </aside>
      </div>

      <div className="pct__warnings" data-visible={step >= STEPS.length}>
        <article className="pct__warn">
          <span className="pct__warn-tag">Cuidado · 1</span>
          <h4 className="pct__warn-title">Subir y bajar lo mismo no vuelve al original</h4>
          <p className="pct__warn-body">
            Si un precio sube 30 % y después baja 30 %, <strong>no</strong> termina igual: 1 × 1,30
            × 0,70 = <strong>0,91</strong>. El precio queda 9 % por debajo del original. Las
            variaciones porcentuales no se suman ni se restan, se <strong>multiplican</strong>.
          </p>
        </article>
        <article className="pct__warn">
          <span className="pct__warn-tag">Cuidado · 2</span>
          <h4 className="pct__warn-title">Punto porcentual ≠ porcentaje</h4>
          <p className="pct__warn-body">
            Si la inflación pasa del 10 % al 12 %, subió <strong>2 puntos porcentuales</strong> (pp).
            Pero en términos relativos subió un <strong>+20 %</strong> (de 10 a 12). Esta es la
            confusión más común al leer titulares económicos.
          </p>
        </article>
      </div>

      <div className="pct__actions">
        {step < STEPS.length ? (
          <button className="pct__btn" onClick={next}>
            {step === 0 && 'Plantear la fórmula →'}
            {step === 1 && 'Calcular diferencia →'}
            {step === 2 && 'Dividir por inicial →'}
            {step === 3 && 'Pasar a porcentaje →'}
          </button>
        ) : (
          <button className="pct__btn pct__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}
