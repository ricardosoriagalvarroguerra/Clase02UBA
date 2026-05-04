import { useEffect, useState } from 'react'
import './ExpectationsSlide.css'

interface Props { isActive: boolean }

interface Node {
  id: 'observed' | 'expectations' | 'decisions' | 'realized'
  label: string
  description: string
  cx: number
  cy: number
}

const NODES: Node[] = [
  {
    id: 'observed',
    label: 'Inflación observada',
    description:
      'La inflación de los últimos meses es lo primero que mira la gente para anticipar la del próximo período.',
    cx: 50,
    cy: 12,
  },
  {
    id: 'expectations',
    label: 'Expectativas de inflación',
    description:
      'A partir de lo observado (más expectativas sobre dólar, política, etc.), hogares y empresas forman una creencia sobre la inflación futura.',
    cx: 88,
    cy: 50,
  },
  {
    id: 'decisions',
    label: 'Decisiones',
    description:
      'Con esa creencia se toman decisiones: paritarias, precios de lista, contratos de alquiler, plazos fijos. Todas estas decisiones “embolsan” la inflación esperada.',
    cx: 50,
    cy: 88,
  },
  {
    id: 'realized',
    label: 'Inflación realizada',
    description:
      'Si todos firman paritarias y suben precios pensando en X % de inflación, esa inflación ocurre. La expectativa se autorrealiza — y vuelve al punto de partida.',
    cx: 12,
    cy: 50,
  },
]

const STEPS = NODES.length

export function ExpectationsSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const advance = () => setStep((s) => Math.min(STEPS, s + 1))
  const reset = () => setStep(0)

  const activeNode = NODES[Math.min(step - 1, NODES.length - 1)]

  return (
    <div className="exp">
      <header className="exp__header">
        <p className="exp__eyebrow">Bisagra al estudio de la inflación</p>
        <h2 className="exp__title">Expectativas: cuando la inflación se profecía a sí misma</h2>
        <p className="exp__lead">
          Las decisiones económicas no se toman mirando solo el presente: dependen de lo que la
          gente <strong>espera</strong> que pase. En inflación, esto importa muchísimo: la
          expectativa de inflación tiende a producir inflación. Es el mecanismo central detrás
          de la <strong>inercia</strong> inflacionaria argentina.
        </p>
      </header>

      <div className="exp__main">
        <div className="exp__viz" aria-hidden>
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="exp__svg">
            {/* Curved arrows between nodes */}
            <defs>
              <marker
                id="exp-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" />
              </marker>
            </defs>

            <Arrow from={NODES[0]} to={NODES[1]} active={step >= 2} />
            <Arrow from={NODES[1]} to={NODES[2]} active={step >= 3} />
            <Arrow from={NODES[2]} to={NODES[3]} active={step >= 4} />
            <Arrow from={NODES[3]} to={NODES[0]} active={step >= 4} closing />

            {NODES.map((n, i) => (
              <g
                key={n.id}
                className="exp-node"
                data-visible={step >= i + 1}
                data-active={activeNode?.id === n.id}
                transform={`translate(${n.cx}, ${n.cy})`}
              >
                <circle r={9.5} className="exp-node__halo" />
                <circle r={6.8} className="exp-node__circle" />
                <text className="exp-node__num" textAnchor="middle" dy="0.35em">
                  {i + 1}
                </text>
              </g>
            ))}

            <text x={50} y={50} textAnchor="middle" dy="-2" className="exp-svg__center-1">
              Inflación
            </text>
            <text x={50} y={50} textAnchor="middle" dy="6" className="exp-svg__center-2">
              persistente
            </text>
          </svg>
        </div>

        <div className="exp__readout">
          {NODES.map((n, i) => (
            <article
              key={n.id}
              className="exp__step"
              data-visible={step >= i + 1}
              data-active={activeNode?.id === n.id}
            >
              <span className="exp__step-num">0{i + 1}</span>
              <div>
                <h4 className="exp__step-title">{n.label}</h4>
                <p className="exp__step-body">{n.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="exp__example" data-visible={step >= STEPS}>
        <h4 className="exp__example-title">Ejemplo · paritaria 2024</h4>
        <ol className="exp__example-list">
          <li>
            <strong>Observamos:</strong> la inflación de 2023 fue de 211 % anual.
          </li>
          <li>
            <strong>Esperamos:</strong> el sindicato y las empresas, mirando ese número, esperan
            inflación alta para 2024.
          </li>
          <li>
            <strong>Decidimos:</strong> el sindicato pide un aumento que cubra esa expectativa
            (digamos, 150 %); las empresas, anticipando que sus costos van a subir, ya marcan
            sus precios al alza.
          </li>
          <li>
            <strong>Se realiza:</strong> con paritarias y precios moviéndose juntos al alza, la
            inflación efectivamente vuelve a ser alta. La expectativa se cumplió — y servirá de
            base para la siguiente ronda.
          </li>
        </ol>
        <p className="exp__example-note">
          <strong>Romper este ciclo</strong> requiere un cambio creíble que “ancle” las expectativas:
          un compromiso fiscal y monetario que la gente realmente crea. Si nadie le cree al
          gobierno, las expectativas no se mueven y la inflación se vuelve muy difícil de bajar.
        </p>
      </div>

      <div className="exp__actions">
        {step < STEPS ? (
          <button className="exp__btn" onClick={advance}>
            {step === 0 && 'Empezar el ciclo →'}
            {step === 1 && 'Formar expectativas →'}
            {step === 2 && 'Tomar decisiones →'}
            {step === 3 && 'Cerrar el ciclo →'}
          </button>
        ) : (
          <button className="exp__btn exp__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}

function Arrow({
  from,
  to,
  active,
  closing,
}: {
  from: Node
  to: Node
  active: boolean
  closing?: boolean
}) {
  // Curva cuadrática que pasa "alrededor" del centro (50,50)
  const cx = (from.cx + to.cx) / 2
  const cy = (from.cy + to.cy) / 2
  // Empujar el control point hacia afuera del centro (50,50)
  const dx = cx - 50
  const dy = cy - 50
  const norm = Math.sqrt(dx * dx + dy * dy) || 1
  const offset = 18
  const px = cx + (dx / norm) * offset
  const py = cy + (dy / norm) * offset

  // Acortar los extremos para que la flecha no entre en el círculo del nodo
  const r = 8
  const ang1 = Math.atan2(py - from.cy, px - from.cx)
  const x1 = from.cx + Math.cos(ang1) * r
  const y1 = from.cy + Math.sin(ang1) * r
  const ang2 = Math.atan2(py - to.cy, px - to.cx)
  const x2 = to.cx + Math.cos(ang2) * r
  const y2 = to.cy + Math.sin(ang2) * r

  return (
    <path
      className={`exp-arrow ${closing ? 'exp-arrow--closing' : ''}`}
      data-visible={active}
      d={`M ${x1} ${y1} Q ${px} ${py} ${x2} ${y2}`}
      fill="none"
      markerEnd="url(#exp-arrow)"
    />
  )
}
