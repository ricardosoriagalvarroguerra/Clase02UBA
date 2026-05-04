import { useEffect, useState } from 'react'
import './LawyerHookSlide.css'

interface Props { isActive: boolean }

interface Case {
  key: string
  area: string
  title: string
  scenario: string
  question: string
}

const CASES: Case[] = [
  {
    key: 'alquiler',
    area: 'Derecho civil · locaciones',
    title: 'Alquileres y actualización',
    scenario:
      'Un cliente firma un alquiler en enero por $300.000. ¿Cómo se actualiza ese precio durante los 36 meses del contrato? ¿Por IPC, por ICL, por dólar, por acuerdo libre?',
    question:
      'Saber leer el IPC y entender cómo se construye un índice no es opcional: es el corazón de cualquier contrato de tracto sucesivo en una economía con inflación.',
  },
  {
    key: 'alimentos',
    area: 'Derecho de familia',
    title: 'Cuota alimentaria',
    scenario:
      'Un juez fija cuota alimentaria por $200.000. Tres meses después la madre pide actualización porque "ya no alcanza". El padre dice que "lo pactado es lo pactado".',
    question:
      'Sin el concepto de salario real y nivel de precios es imposible discutir actualización de cuota — se vuelve discusión de buena fe en lugar de discusión técnica.',
  },
  {
    key: 'mora',
    area: 'Derecho de daños · obligaciones',
    title: 'Indemnizaciones y mora',
    scenario:
      'Un accidente en 2022 se repara en sentencia de 2026. ¿La indemnización se fija en pesos de 2022 con intereses, en pesos de hoy, en UMA, en CER? Cada criterio puede dar resultados que se diferencian en 10× entre sí.',
    question:
      'Las tasas de interés "puras" y "moratorias" sólo tienen sentido cuando uno entiende qué parte cubre la pérdida real y qué parte sólo la inflación.',
  },
  {
    key: 'tributario',
    area: 'Derecho tributario · laboral',
    title: 'Mínimos no imponibles, escalas, multas',
    scenario:
      'Ganancias, monotributo, asignaciones familiares, multas administrativas, topes indemnizatorios: casi todo el sistema usa montos en pesos que se actualizan (o no) por algún índice de precios.',
    question:
      'Discutir si un tope quedó "desactualizado" o un tributo se volvió confiscatorio requiere saber qué mide cada índice y cuánto se movió respecto del nivel general.',
  },
]

export function LawyerHookSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const advance = () => setStep((s) => Math.min(CASES.length, s + 1))
  const reset = () => setStep(0)

  return (
    <div className="lhk">
      <header className="lhk__header">
        <p className="lhk__eyebrow">Antes de empezar · ¿por qué nos importa?</p>
        <h2 className="lhk__title">La inflación no es un tema de economistas</h2>
        <p className="lhk__lead">
          Para un abogado en Argentina, los precios y la inflación atraviesan
          casi todas las áreas del derecho patrimonial. No vamos a aprender
          economía “por cultura general” — vamos a aprender las{' '}
          <strong>herramientas mínimas</strong> que necesitás para leer un contrato,
          fundar una demanda o discutir una sentencia que involucren plata
          a lo largo del tiempo.
        </p>
      </header>

      <div className="lhk__grid">
        {CASES.map((c, i) => (
          <article key={c.key} className="lhk__card" data-visible={step >= i + 1}>
            <span className="lhk__num">0{i + 1}</span>
            <p className="lhk__area">{c.area}</p>
            <h3 className="lhk__name">{c.title}</h3>
            <p className="lhk__scenario">{c.scenario}</p>
            <div className="lhk__why">
              <span className="lhk__why-label">¿Qué necesita saber el abogado?</span>
              <p className="lhk__why-text">{c.question}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="lhk__actions">
        {step < CASES.length ? (
          <button className="lhk__btn" onClick={advance}>
            {step === 0 && 'Caso 01 · alquileres →'}
            {step === 1 && 'Caso 02 · familia →'}
            {step === 2 && 'Caso 03 · daños →'}
            {step === 3 && 'Caso 04 · tributario →'}
          </button>
        ) : (
          <button className="lhk__btn lhk__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}
