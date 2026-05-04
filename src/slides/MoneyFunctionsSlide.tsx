import { useEffect, useState } from 'react'
import './MoneyFunctionsSlide.css'

interface Props { isActive: boolean }

interface Func {
  key: 'unit' | 'exchange' | 'store'
  title: string
  subtitle: string
  description: string
  example: string
  exampleLabel: string
}

const FUNCTIONS: Func[] = [
  {
    key: 'unit',
    title: 'Unidad de cuenta',
    subtitle: 'cómo medimos valor',
    description:
      'El dinero es la regla con la que comparamos el valor de cosas distintas. Sin una unidad común, no podemos preguntar “¿cuánto vale el pan en términos de café?”.',
    example:
      'Cuando vemos “$2.500 el kilo de pan”, estamos midiendo el pan en pesos. Lo mismo hacemos con un alquiler, una hora de trabajo o un viaje en colectivo. Todos los precios usan la misma vara.',
    exampleLabel: 'En la práctica',
  },
  {
    key: 'exchange',
    title: 'Medio de cambio',
    subtitle: 'evita el trueque',
    description:
      'El dinero permite intercambiar bienes y servicios sin que las dos partes tengan que querer exactamente lo mismo en sentido inverso.',
    example:
      'Pagás el pan con plata; la panadería paga la luz con plata; la empresa eléctrica paga sueldos con plata. Sin dinero, deberías cambiar pan por electricidad — y la empresa de luz tendría que querer pan ese día.',
    exampleLabel: 'En la práctica',
  },
  {
    key: 'store',
    title: 'Reserva de valor',
    subtitle: 'transfiere poder de compra al futuro',
    description:
      'El dinero permite guardar hoy poder de compra para usarlo más adelante. Esta función es la más frágil: depende de que el valor del dinero se mantenga en el tiempo.',
    example:
      'Si guardás $100.000 hoy, esperás comprar “cosas” con ellos en un año. La inflación erosiona esta función: en Argentina, los pesos guardados pierden valor rápido — por eso muchos ahorran en dólares o bienes.',
    exampleLabel: 'Y acá entra la inflación',
  },
]

export function MoneyFunctionsSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const advance = () => setStep((s) => Math.min(FUNCTIONS.length, s + 1))
  const reset = () => setStep(0)

  return (
    <div className="mf">
      <header className="mf__header">
        <p className="mf__eyebrow">Antes de hablar de inflación</p>
        <h2 className="mf__title">¿Para qué sirve el dinero?</h2>
        <p className="mf__lead">
          La inflación es un fenómeno del dinero. Antes de medirla, conviene aclarar qué hace el
          dinero en una economía. Los economistas le reconocen <strong>tres funciones</strong>;
          la inflación afecta sobre todo a la última.
        </p>
      </header>

      <div className="mf__grid">
        {FUNCTIONS.map((f, i) => (
          <article
            key={f.key}
            className={`mf__card mf__card--${f.key}`}
            data-visible={step >= i + 1}
          >
            <div className="mf__icon" aria-hidden>
              <FuncIcon name={f.key} />
            </div>
            <span className="mf__num">0{i + 1}</span>
            <h3 className="mf__name">{f.title}</h3>
            <p className="mf__sub">{f.subtitle}</p>
            <p className="mf__desc">{f.description}</p>
            <div className="mf__example">
              <span className="mf__example-label">{f.exampleLabel}</span>
              <p className="mf__example-text">{f.example}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mf__actions">
        {step < FUNCTIONS.length ? (
          <button className="mf__btn" onClick={advance}>
            {step === 0 && 'Mostrar primera función →'}
            {step === 1 && 'Mostrar segunda función →'}
            {step === 2 && 'Mostrar tercera función →'}
          </button>
        ) : (
          <button className="mf__btn mf__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}

function FuncIcon({ name }: { name: 'unit' | 'exchange' | 'store' }) {
  const common = {
    width: 36,
    height: 36,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (name === 'unit') {
    // Regla / unidad
    return (
      <svg {...common}>
        <rect x="4" y="11" width="24" height="10" rx="1.5" />
        <path d="M8 11v3M12 11v4M16 11v3M20 11v4M24 11v3" />
      </svg>
    )
  }
  if (name === 'exchange') {
    return (
      <svg {...common}>
        <path d="M5 12h18l-4-4" />
        <path d="M27 20H9l4 4" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M6 14h20v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V14z" />
      <path d="M11 14V9a5 5 0 0 1 10 0v5" />
      <circle cx="16" cy="20" r="1.4" fill="currentColor" />
    </svg>
  )
}
