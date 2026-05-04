import { useEffect, useState } from 'react'
import './InflationConceptSlide.css'

interface Highlight {
  word: string
  description: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    word: 'aumento generalizado',
    description:
      'No es la suba de un solo precio. Para hablar de inflación, deben subir muchos precios a la vez.',
  },
  {
    word: 'sostenido',
    description:
      'No alcanza con un salto puntual. Se requiere que la suba persista en el tiempo, no que se revierta al mes siguiente.',
  },
  {
    word: 'precios de la economía',
    description:
      'Se mide sobre una canasta representativa de bienes y servicios — un conjunto fijo de productos típicos del consumo de los hogares — y no sobre productos aislados.',
  },
  {
    word: 'pierde poder de compra',
    description:
      'Con la misma cantidad de pesos compramos menos. La inflación es, en última instancia, una caída del valor real del dinero.',
  },
]

interface Props {
  isActive: boolean
}

export function InflationConceptSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  return (
    <div className="infl-concept">
      <div className="infl-concept__left">
        <p className="infl-concept__eyebrow">Definición</p>
        <h2 className="infl-concept__title">¿Qué es la inflación?</h2>
        <p className="infl-concept__definition">
          La inflación es el{' '}
          <mark className="kw" data-visible={step > 0} data-idx="0">aumento generalizado</mark>{' '}
          y{' '}
          <mark className="kw" data-visible={step > 1} data-idx="1">sostenido</mark>{' '}
          de los{' '}
          <mark className="kw" data-visible={step > 2} data-idx="2">precios de la economía</mark>.
          Como consecuencia, el dinero{' '}
          <mark className="kw" data-visible={step > 3} data-idx="3">pierde poder de compra</mark>.
        </p>
        <button
          className="infl-concept__btn"
          onClick={() => setStep((s) => Math.min(HIGHLIGHTS.length, s + 1))}
          disabled={step >= HIGHLIGHTS.length}
        >
          {step >= HIGHLIGHTS.length ? 'Definición completa' : 'Destacar siguiente concepto'}
        </button>
      </div>

      <ul className="infl-concept__list">
        {HIGHLIGHTS.map((h, i) => (
          <li key={h.word} className="infl-concept__item" data-visible={step > i}>
            <span className="infl-concept__index">0{i + 1}</span>
            <div>
              <h3 className="infl-concept__word">{h.word}</h3>
              <p className="infl-concept__text">{h.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
