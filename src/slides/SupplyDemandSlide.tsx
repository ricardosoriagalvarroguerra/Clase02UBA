import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import './SupplyDemandSlide.css'

interface Props { isActive: boolean }

interface Scenario {
  id: string
  label: string
  description: string
  demandShift: number
  supplyShift: number
}

const BASELINE: Scenario = {
  id: 'base',
  label: 'Equilibrio inicial',
  description:
    'Punto donde las curvas de oferta y demanda se cruzan. La cantidad ofrecida iguala a la cantidad demandada, y eso fija el precio de mercado.',
  demandShift: 0,
  supplyShift: 0,
}

const SCENARIOS: Scenario[] = [
  {
    id: 'demand-up',
    label: 'Más demanda',
    description:
      'Aumenta el ingreso de los consumidores → quieren comprar más al mismo precio. La curva de demanda se desplaza a la derecha. Resultado: sube el precio y la cantidad transada.',
    demandShift: 1.6,
    supplyShift: 0,
  },
  {
    id: 'demand-down',
    label: 'Menos demanda',
    description:
      'Cae el ingreso o aparece un sustituto. La curva de demanda se desplaza a la izquierda. Resultado: baja el precio y la cantidad.',
    demandShift: -1.6,
    supplyShift: 0,
  },
  {
    id: 'supply-up',
    label: 'Más oferta',
    description:
      'Mejor cosecha o cae el costo de producción. La curva de oferta se desplaza a la derecha. Resultado: baja el precio, sube la cantidad.',
    demandShift: 0,
    supplyShift: -1.6,
  },
  {
    id: 'supply-down',
    label: 'Menos oferta',
    description:
      'Sequía, sube el dólar (insumos importados), o aumenta un impuesto. La curva de oferta se desplaza a la izquierda. Resultado: sube el precio, cae la cantidad.',
    demandShift: 0,
    supplyShift: 1.6,
  },
]

// Parametrización de las curvas: P = (10 + dShift) - Q   (demanda)
//                              P = (2 + sShift) + Q     (oferta)
// Equilibrio: Q* = (8 + dShift - sShift) / 2 ; P* = (12 + dShift + sShift) / 2

export function SupplyDemandSlide({ isActive }: Props) {
  const [scenario, setScenario] = useState<Scenario>(BASELINE)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 540, h: 360 })

  useEffect(() => {
    if (!isActive) setScenario(BASELINE)
  }, [isActive])

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width } = e.contentRect
        const vh = window.innerHeight
        const h = Math.max(240, Math.min(Math.round(width * 0.95), vh * 0.42))
        setSize({ w: Math.max(320, Math.floor(width)), h })
      }
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  const equilibrium = useMemo(() => {
    const q = (8 + scenario.demandShift - scenario.supplyShift) / 2
    const p = (12 + scenario.demandShift + scenario.supplyShift) / 2
    return { q, p }
  }, [scenario])

  const baselineEq = useMemo(() => ({ q: 4, p: 6 }), [])

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 40, bottom: 40, left: 48 }
    const width = size.w - margin.left - margin.right
    const height = size.h - margin.top - margin.bottom

    const g = svg
      .attr('viewBox', `0 0 ${size.w} ${size.h}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, 12]).range([0, width])
    const y = d3.scaleLinear().domain([0, 12]).range([height, 0])

    g.append('g')
      .attr('class', 'sd-chart__grid')
      .selectAll('line')
      .data(d3.range(2, 13, 2))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))

    g.append('g')
      .attr('class', 'sd-chart__axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x).ticks(6).tickFormat(() => '').tickSize(0),
      )
      .call((sel) => sel.select('.domain').remove())

    g.append('g')
      .attr('class', 'sd-chart__axis')
      .call(
        d3.axisLeft(y).ticks(6).tickFormat(() => '').tickSize(0),
      )
      .call((sel) => sel.select('.domain').remove())

    // ejes con etiquetas
    g.append('text')
      .attr('class', 'sd-chart__axis-label')
      .attr('x', width)
      .attr('y', height + 28)
      .attr('text-anchor', 'end')
      .text('Cantidad →')

    g.append('text')
      .attr('class', 'sd-chart__axis-label')
      .attr('transform', `translate(-12,0) rotate(-90)`)
      .attr('text-anchor', 'end')
      .attr('dy', '0.35em')
      .text('Precio →')

    // Helper para curva lineal segura dentro del cuadrante
    const drawLine = (
      cls: string,
      slope: number,
      intercept: number,
    ) => {
      const x1 = Math.max(0, Math.min(12, slope === 0 ? 0 : -intercept / slope))
      // queremos clip a [0,12] x [0,12]
      const points: Array<[number, number]> = []
      for (let q = 0; q <= 12; q += 0.5) {
        const p = intercept + slope * q
        if (p >= 0 && p <= 12) points.push([q, p])
      }
      if (points.length < 2) return
      const line = d3
        .line<[number, number]>()
        .x((d) => x(d[0]))
        .y((d) => y(d[1]))
      g.append('path').datum(points).attr('class', cls).attr('d', line)
      void x1
    }

    // Curvas baseline (claras)
    drawLine('sd-chart__curve sd-chart__curve--demand-base', -1, 10)
    drawLine('sd-chart__curve sd-chart__curve--supply-base', 1, 2)

    // Curvas actuales
    drawLine('sd-chart__curve sd-chart__curve--demand', -1, 10 + scenario.demandShift)
    drawLine('sd-chart__curve sd-chart__curve--supply', 1, 2 + scenario.supplyShift)

    // Etiquetas de las curvas
    g.append('text')
      .attr('class', 'sd-chart__curve-label sd-chart__curve-label--demand')
      .attr('x', x(11))
      .attr('y', y(0 + scenario.demandShift) + 14)
      .text('D')

    g.append('text')
      .attr('class', 'sd-chart__curve-label sd-chart__curve-label--supply')
      .attr('x', x(11))
      .attr('y', y(13 + scenario.supplyShift) - 4)
      .text('S')

    // Equilibrio baseline (gris)
    g.append('circle')
      .attr('class', 'sd-chart__eq-base')
      .attr('cx', x(baselineEq.q))
      .attr('cy', y(baselineEq.p))
      .attr('r', 4)

    // Equilibrio actual
    g.append('line')
      .attr('class', 'sd-chart__eq-line')
      .attr('x1', x(equilibrium.q))
      .attr('x2', x(equilibrium.q))
      .attr('y1', y(equilibrium.p))
      .attr('y2', height)

    g.append('line')
      .attr('class', 'sd-chart__eq-line')
      .attr('x1', 0)
      .attr('x2', x(equilibrium.q))
      .attr('y1', y(equilibrium.p))
      .attr('y2', y(equilibrium.p))

    g.append('circle')
      .attr('class', 'sd-chart__eq')
      .attr('cx', x(equilibrium.q))
      .attr('cy', y(equilibrium.p))
      .attr('r', 6)

    // Labels P*, Q*
    g.append('text')
      .attr('class', 'sd-chart__eq-label')
      .attr('x', -8)
      .attr('y', y(equilibrium.p))
      .attr('text-anchor', 'end')
      .attr('dy', '0.35em')
      .text(`P* = ${equilibrium.p.toFixed(1)}`)

    g.append('text')
      .attr('class', 'sd-chart__eq-label')
      .attr('x', x(equilibrium.q))
      .attr('y', height + 14)
      .attr('text-anchor', 'middle')
      .text(`Q* = ${equilibrium.q.toFixed(1)}`)
  }, [size, scenario, equilibrium, baselineEq])

  const priceDelta = ((equilibrium.p - baselineEq.p) / baselineEq.p) * 100
  const qtyDelta = ((equilibrium.q - baselineEq.q) / baselineEq.q) * 100

  return (
    <div className="sd">
      <header className="sd__header">
        <p className="sd__eyebrow">Mecanismo básico de los precios</p>
        <h2 className="sd__title">Oferta, demanda y equilibrio</h2>
        <p className="sd__lead">
          En cada mercado individual, el precio se determina donde la <strong>oferta</strong>
          {' '}(lo que las empresas quieren vender) se cruza con la <strong>demanda</strong>{' '}
          (lo que los hogares quieren comprar). Probá los escenarios para ver cómo un cambio en
          uno de los lados desplaza el equilibrio.
        </p>
      </header>

      <div className="sd__layout">
        <div className="sd__chart-wrap" ref={wrapRef}>
          <svg ref={svgRef} width="100%" height={size.h} />
        </div>

        <div className="sd__panel">
          <div className="sd__scenarios" role="group" aria-label="Escenarios">
            <button
              type="button"
              className="sd__scenario sd__scenario--base"
              data-active={scenario.id === 'base'}
              onClick={() => setScenario(BASELINE)}
            >
              {BASELINE.label}
            </button>
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="sd__scenario"
                data-active={scenario.id === s.id}
                onClick={() => setScenario(s)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <article className="sd__readout">
            <header className="sd__readout-head">
              <span className="sd__readout-label">Escenario</span>
              <h3 className="sd__readout-title">{scenario.label}</h3>
            </header>
            <p className="sd__readout-desc">{scenario.description}</p>

            <div className="sd__metrics">
              <div className="sd__metric">
                <span className="sd__metric-label">Precio P*</span>
                <span className="sd__metric-val">{equilibrium.p.toFixed(1)}</span>
                <span
                  className={`sd__metric-delta ${priceDelta >= 0 ? 'sd__metric-delta--up' : 'sd__metric-delta--down'}`}
                >
                  {scenario.id === 'base'
                    ? '·'
                    : `${priceDelta >= 0 ? '+' : ''}${priceDelta.toFixed(1)} % vs. base`}
                </span>
              </div>
              <div className="sd__metric">
                <span className="sd__metric-label">Cantidad Q*</span>
                <span className="sd__metric-val">{equilibrium.q.toFixed(1)}</span>
                <span
                  className={`sd__metric-delta ${qtyDelta >= 0 ? 'sd__metric-delta--up' : 'sd__metric-delta--down'}`}
                >
                  {scenario.id === 'base'
                    ? '·'
                    : `${qtyDelta >= 0 ? '+' : ''}${qtyDelta.toFixed(1)} % vs. base`}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <p className="sd__bridge">
        <strong>Puente con inflación.</strong> Acabamos de ver cómo se mueve el precio de
        <em> un</em> bien. La inflación es lo que pasa cuando los shocks ocurren en
        <em> muchos</em> mercados a la vez (suben costos generales, se devalúa la moneda, hay
        más demanda agregada): el nivel general de precios sube — y eso es lo que vamos a medir
        en la próxima sección.
      </p>
    </div>
  )
}
