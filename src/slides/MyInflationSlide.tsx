import { useEffect, useMemo, useState } from 'react'
import './MyInflationSlide.css'

interface Props { isActive: boolean }

interface Household {
  key: string
  label: string
  emoji: string
  weights: { alimentos: number; transporte: number; alquiler: number; servicios: number; ocio: number }
}

const HOUSEHOLDS: Household[] = [
  {
    key: 'estudiante',
    label: 'Estudiante UBA',
    emoji: '🎒',
    weights: { alimentos: 25, transporte: 15, alquiler: 35, servicios: 15, ocio: 10 },
  },
  {
    key: 'familia',
    label: 'Familia tipo',
    emoji: '👨‍👩‍👧',
    weights: { alimentos: 35, transporte: 12, alquiler: 22, servicios: 22, ocio: 9 },
  },
  {
    key: 'jubilado',
    label: 'Jubilado/a',
    emoji: '👵',
    weights: { alimentos: 45, transporte: 5, alquiler: 10, servicios: 30, ocio: 10 },
  },
]

// Variación interanual ilustrativa por rubro (consistente con IPC INDEC, redondeada).
const RUBRO_INFLATION = {
  alimentos: 95,
  transporte: 80,
  alquiler: 60,
  servicios: 130,
  ocio: 70,
}

const RUBRO_LABEL: Record<keyof Household['weights'], string> = {
  alimentos: 'Alimentos',
  transporte: 'Transporte',
  alquiler: 'Vivienda / alquiler',
  servicios: 'Servicios (luz, gas, agua, prepaga)',
  ocio: 'Esparcimiento',
}

const RUBRO_COLOR: Record<keyof Household['weights'], string> = {
  alimentos: 'var(--color-series-1)',
  transporte: 'var(--color-series-4)',
  alquiler: 'var(--color-series-3)',
  servicios: 'var(--color-danger)',
  ocio: 'var(--color-series-2)',
}

export function MyInflationSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const personalCpi = useMemo(() => {
    return HOUSEHOLDS.map((h) => {
      const total = (Object.keys(h.weights) as Array<keyof Household['weights']>).reduce(
        (acc, k) => acc + (h.weights[k] / 100) * RUBRO_INFLATION[k],
        0,
      )
      return { key: h.key, value: total }
    })
  }, [])

  const advance = () => setStep((s) => Math.min(2, s + 1))
  const reset = () => setStep(0)

  return (
    <div className="myi">
      <header className="myi__header">
        <p className="myi__eyebrow">El IPC visto de cerca</p>
        <h2 className="myi__title">Tu inflación no es la del INDEC</h2>
        <p className="myi__lead">
          El IPC mide la inflación de un “hogar promedio”. Pero{' '}
          <strong>nadie consume el promedio</strong>: cada familia gasta su plata en
          cosas distintas. Si los rubros que más usás aumentaron por encima del
          promedio, tu inflación personal fue mayor a la que sale en los diarios — y
          al revés.
        </p>
      </header>

      <div className="myi__top">
        <div className="myi__rubros" data-visible={step >= 1}>
          <h3 className="myi__sub">Inflación interanual por rubro · ilustrativa</h3>
          <ul className="myi__rubros-list">
            {(Object.keys(RUBRO_INFLATION) as Array<keyof Household['weights']>).map((k) => (
              <li key={k} className="myi__rubro">
                <span
                  className="myi__rubro-sw"
                  style={{ background: RUBRO_COLOR[k] }}
                  aria-hidden
                />
                <span className="myi__rubro-name">{RUBRO_LABEL[k]}</span>
                <span className="myi__rubro-val">+{RUBRO_INFLATION[k]} %</span>
              </li>
            ))}
          </ul>
          <p className="myi__rubros-note">
            En este escenario, los <strong>servicios</strong> subieron mucho más que
            el promedio y el <strong>alquiler</strong> bastante menos. La pregunta
            es: ¿qué rubros pesan más en tu canasta?
          </p>
        </div>

        <div className="myi__households" data-visible={step >= 2}>
          <h3 className="myi__sub">Tres canastas distintas, tres inflaciones distintas</h3>
          <div className="myi__cards">
            {HOUSEHOLDS.map((h) => {
              const cpi = personalCpi.find((c) => c.key === h.key)?.value ?? 0
              return (
                <article key={h.key} className="myi__card">
                  <div className="myi__card-head">
                    <span className="myi__card-emoji" aria-hidden>{h.emoji}</span>
                    <h4 className="myi__card-name">{h.label}</h4>
                  </div>
                  <div className="myi__bar" aria-hidden>
                    {(Object.keys(h.weights) as Array<keyof Household['weights']>).map((k) => (
                      <span
                        key={k}
                        className="myi__bar-seg"
                        style={{
                          width: `${h.weights[k]}%`,
                          background: RUBRO_COLOR[k],
                        }}
                        title={`${RUBRO_LABEL[k]}: ${h.weights[k]} %`}
                      />
                    ))}
                  </div>
                  <ul className="myi__weights">
                    {(Object.keys(h.weights) as Array<keyof Household['weights']>).map((k) => (
                      <li key={k} className="myi__weight">
                        <span
                          className="myi__weight-sw"
                          style={{ background: RUBRO_COLOR[k] }}
                          aria-hidden
                        />
                        <span className="myi__weight-name">{RUBRO_LABEL[k]}</span>
                        <span className="myi__weight-val">{h.weights[k]} %</span>
                      </li>
                    ))}
                  </ul>
                  <div className="myi__personal">
                    <span className="myi__personal-label">Su inflación personal</span>
                    <span className="myi__personal-val">+{cpi.toFixed(0)} %</span>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>

      <p className="myi__insight" data-visible={step >= 2}>
        <strong>Por qué importa.</strong> Cuando un cliente dice “a mí me subió mucho
        más que la inflación oficial”, no está mintiendo necesariamente: su canasta
        es distinta. Esto es central en juicios donde se discute si un índice es
        “representativo” para un caso concreto (alquileres, alimentos, jubilaciones,
        actualización de deudas).
      </p>

      <div className="myi__actions">
        {step < 2 ? (
          <button className="myi__btn" onClick={advance}>
            {step === 0 ? 'Mostrar variación por rubro →' : 'Comparar canastas →'}
          </button>
        ) : (
          <button className="myi__btn myi__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}
