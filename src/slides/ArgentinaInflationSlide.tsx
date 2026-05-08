import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { argentinaInflation } from '@/data/argentinaInflation'
import './ArgentinaInflationSlide.css'

type Scale = 'linear' | 'log'
type Category = 'deflation' | 'low' | 'high' | 'hyper'

interface Tooltip {
  x: number
  y: number
  year: number
  value: number
}

const ALL_CATS: Category[] = ['deflation', 'low', 'high', 'hyper']

function categoryOf(rate: number): Category {
  if (rate < 0) return 'deflation'
  if (rate < 100) return 'low'
  if (rate < 1000) return 'high'
  return 'hyper'
}

const CAT_COLOR: Record<Category, string> = {
  deflation: 'var(--color-primary-soft)',
  low: 'var(--color-primary)',
  high: 'var(--color-accent)',
  hyper: 'var(--color-danger)',
}

const CAT_LABEL: Record<Category, string> = {
  deflation: 'deflación (< 0 %)',
  low: '< 100 %',
  high: '100 – 1.000 %',
  hyper: '≥ 1.000 % (hiper)',
}

const YEAR_MIN = argentinaInflation[0].year
const YEAR_MAX = argentinaInflation[argentinaInflation.length - 1].year

const PRESETS: { label: string; range: [number, number] }[] = [
  { label: 'Completo', range: [YEAR_MIN, YEAR_MAX] },
  { label: 'Sin hiper (1991+)', range: [1991, YEAR_MAX] },
  { label: 'Convertibilidad (1991–2001)', range: [1991, 2001] },
  { label: 'Post-2002', range: [2002, YEAR_MAX] },
]

export function ArgentinaInflationSlide() {
  const [scale, setScale] = useState<Scale>('linear')
  const [active, setActive] = useState<Set<Category>>(new Set(ALL_CATS))
  const [tip, setTip] = useState<Tooltip | null>(null)
  const [yearRange, setYearRange] = useState<[number, number]>([YEAR_MIN, YEAR_MAX])
  const svgRef = useRef<SVGSVGElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 900, h: 380 })

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width } = e.contentRect
        const vh = window.innerHeight
        const h = Math.max(240, Math.min(Math.round(width * 0.45), vh * 0.42))
        setSize({ w: Math.max(320, Math.floor(width)), h })
      }
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  const data = useMemo(
    () => argentinaInflation.filter((d) => d.year >= yearRange[0] && d.year <= yearRange[1]),
    [yearRange],
  )

  const toggleCat = (c: Category) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      if (next.size === 0) return new Set(ALL_CATS)
      return next
    })
  }

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    if (data.length === 0) return

    const margin = { top: 24, right: 24, bottom: 44, left: 64 }
    const width = size.w - margin.left - margin.right
    const height = size.h - margin.top - margin.bottom

    const g = svg
      .attr('viewBox', `0 0 ${size.w} ${size.h}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand<number>()
      .domain(data.map((d) => d.year))
      .range([0, width])
      .padding(0.18)

    const yMaxLin = (d3.max(data, (d) => d.rate) ?? 100) * 1.05
    const yMinData = d3.min(data, (d) => d.rate) ?? 0
    const yMinLin = Math.min(0, yMinData) * 1.4
    const yScale =
      scale === 'log'
        ? d3.scaleLog().domain([0.1, yMaxLin]).range([height, 0]).clamp(true).nice()
        : d3.scaleLinear().domain([yMinLin, yMaxLin]).range([height, 0]).nice()

    const yTicks =
      scale === 'log'
        ? [0.1, 1, 10, 100, 1000, 10000].filter((v) => v <= yMaxLin)
        : (yScale as d3.ScaleLinear<number, number>).ticks(6)

    g.append('g')
      .attr('class', 'infl-chart__grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d) ?? 0)
      .attr('y2', (d) => yScale(d) ?? 0)

    if (scale === 'linear' && yMinLin < 0) {
      g.append('line')
        .attr('class', 'infl-chart__zero')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(0) ?? 0)
        .attr('y2', yScale(0) ?? 0)
    }

    const xTickEvery = data.length > 30 ? 5 : 2
    const xTickValues = data
      .map((d) => d.year)
      .filter((y) => y % xTickEvery === 0)

    g.append('g')
      .attr('class', 'infl-chart__axis infl-chart__axis--x')
      .attr('transform', `translate(0,${scale === 'linear' && yMinLin < 0 ? (yScale(0) ?? height) : height})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(xTickValues)
          .tickFormat((d) => String(d))
          .tickSize(0),
      )
      .call((gAxis) => gAxis.select('.domain').remove())

    g.append('g')
      .attr('class', 'infl-chart__axis infl-chart__axis--y')
      .call(
        d3
          .axisLeft(yScale as d3.AxisScale<d3.NumberValue>)
          .tickValues(yTicks)
          .tickFormat((d) => `${d3.format(',')(d as number)}%`)
          .tickSize(0),
      )
      .call((gAxis) => gAxis.select('.domain').remove())

    g.append('text')
      .attr('class', 'infl-chart__y-label')
      .attr('transform', `translate(-48,${height / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .text(scale === 'log' ? 'Inflación anual (%) · escala log' : 'Inflación anual (%)')

    const baselineY = scale === 'linear' ? (yScale(0) ?? height) : height

    g.append('g')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.year)!)
      .attr('width', x.bandwidth())
      .attr('y', (d) => {
        if (scale === 'log') {
          if (d.rate <= 0) return height - 4
          return yScale(d.rate) ?? 0
        }
        return d.rate >= 0 ? (yScale(d.rate) ?? 0) : baselineY
      })
      .attr('height', (d) => {
        if (scale === 'log') {
          if (d.rate <= 0) return 4
          return Math.max(0, height - (yScale(d.rate) ?? height))
        }
        const top = d.rate >= 0 ? (yScale(d.rate) ?? 0) : baselineY
        const bottom = d.rate >= 0 ? baselineY : (yScale(d.rate) ?? baselineY)
        return Math.max(1, bottom - top)
      })
      .attr('rx', 2)
      .attr('fill', (d) => CAT_COLOR[categoryOf(d.rate)])
      .attr('opacity', (d) => (active.has(categoryOf(d.rate)) ? 1 : 0.12))
      .on('mousemove', function (event, d) {
        const svgRect = svgRef.current!.getBoundingClientRect()
        setTip({
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top,
          year: d.year,
          value: d.rate,
        })
        d3.select(this).attr('opacity', 0.85)
      })
      .on('mouseleave', function (_, d) {
        setTip(null)
        d3.select(this).attr('opacity', active.has(categoryOf(d.rate)) ? 1 : 0.12)
      })

    const peak = data.reduce((m, d) => (d.rate > m.rate ? d : m), data[0])
    if (peak && active.has(categoryOf(peak.rate)) && scale === 'linear') {
      g.append('text')
        .attr('class', 'infl-chart__peak-label')
        .attr('x', (x(peak.year) ?? 0) + x.bandwidth() / 2)
        .attr('y', (yScale(peak.rate) ?? 0) - 6)
        .attr('text-anchor', 'middle')
        .text(`${peak.year} · ${peak.rate.toLocaleString('es-AR')} %`)
    }
  }, [data, scale, size, active])

  return (
    <div className="infl-slide">
      <header className="infl-slide__header">
        <p className="infl-slide__eyebrow">Datos · INDEC y reconstrucciones académicas</p>
        <h2 className="infl-slide__title">Argentina · Inflación anual 1980 – 2025</h2>
        <p className="infl-slide__lead">
          Una historia atípica en el mundo: cuatro décadas con inflación estructural,
          un episodio hiperinflacionario en 1989 – 1990 (con dos picos) y un breve período de
          deflación bajo convertibilidad.
        </p>
      </header>

      <div className="infl-slide__controls">
        <div className="infl-toggle" role="tablist" aria-label="Escala">
          <button
            role="tab"
            aria-selected={scale === 'linear'}
            className="infl-toggle__btn"
            data-active={scale === 'linear'}
            onClick={() => setScale('linear')}
          >
            Escala lineal
          </button>
          <button
            role="tab"
            aria-selected={scale === 'log'}
            className="infl-toggle__btn"
            data-active={scale === 'log'}
            onClick={() => setScale('log')}
          >
            Escala log
          </button>
        </div>
        <p className="infl-slide__hint">
          La escala lineal hace evidente la magnitud de las hiperinflaciones; la escala log
          permite ver los años de baja inflación en el mismo gráfico.
        </p>
        <div className="infl-legend" role="group" aria-label="Filtrar categorías">
          {ALL_CATS.map((c) => (
            <button
              key={c}
              type="button"
              className="infl-legend__btn"
              data-active={active.has(c)}
              onClick={() => toggleCat(c)}
            >
              <i style={{ background: CAT_COLOR[c] }} /> {CAT_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="infl-range" aria-label="Filtro de rango de años">
        <div className="infl-range__head">
          <span className="infl-range__label">Rango de años</span>
          <span className="infl-range__values">
            <strong>{yearRange[0]}</strong> – <strong>{yearRange[1]}</strong>
          </span>
        </div>
        <div className="infl-range__slider">
          <div
            className="infl-range__fill"
            style={{
              left: `${((yearRange[0] - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%`,
              right: `${100 - ((yearRange[1] - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={YEAR_MIN}
            max={YEAR_MAX}
            step={1}
            value={yearRange[0]}
            aria-label="Año inicial"
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), yearRange[1])
              setYearRange([v, yearRange[1]])
            }}
            className="infl-range__input infl-range__input--min"
          />
          <input
            type="range"
            min={YEAR_MIN}
            max={YEAR_MAX}
            step={1}
            value={yearRange[1]}
            aria-label="Año final"
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), yearRange[0])
              setYearRange([yearRange[0], v])
            }}
            className="infl-range__input infl-range__input--max"
          />
        </div>
        <div className="infl-range__presets">
          {PRESETS.map((p) => {
            const isActive = yearRange[0] === p.range[0] && yearRange[1] === p.range[1]
            return (
              <button
                key={p.label}
                type="button"
                className="infl-range__preset"
                data-active={isActive}
                onClick={() => setYearRange(p.range)}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="infl-slide__chart" ref={wrapRef}>
        <svg ref={svgRef} width="100%" height={size.h} />
        {tip && (
          <div className="infl-tooltip" style={{ left: tip.x + 12, top: tip.y + 12 }} role="tooltip">
            <div className="infl-tooltip__val">
              {tip.value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%
            </div>
            <div className="infl-tooltip__year">{tip.year}</div>
          </div>
        )}
      </div>

      <p className="infl-slide__cagan">
        <strong>Hiperinflación</strong> (criterio de Cagan, 1956): inflación ≥ 50 % mensual sostenida
        durante varios meses (~13.000 % anual). Aquí destacamos en rojo los años con ≥ 1.000 % anual,
        que en la práctica argentina coincidieron con episodios hiperinflacionarios.
        {scale === 'log' && (
          <span className="infl-slide__cagan-note"> · Los años de deflación se marcan como una banda al pie del eje porque la escala logarítmica no admite valores negativos.</span>
        )}
      </p>
    </div>
  )
}
