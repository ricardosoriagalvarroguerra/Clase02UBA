import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { realWageArgentina, wageMilestones } from '@/data/realWageArgentina'
import './RealWageHistorySlide.css'

interface Tooltip {
  x: number
  y: number
  year: number
  index: number
  changeVsBase: number
}

export function RealWageHistorySlide() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 900, h: 360 })
  const [tip, setTip] = useState<Tooltip | null>(null)
  const [highlighted, setHighlighted] = useState<number | null>(null)

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width } = e.contentRect
        const vh = window.innerHeight
        const h = Math.max(240, Math.min(Math.round(width * 0.42), vh * 0.42))
        setSize({ w: Math.max(320, Math.floor(width)), h })
      }
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  const data = useMemo(() => realWageArgentina, [])

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 38, right: 32, bottom: 42, left: 68 }
    const width = size.w - margin.left - margin.right
    const height = size.h - margin.top - margin.bottom

    const g = svg
      .attr('viewBox', `0 0 ${size.w} ${size.h}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([60, 110])
      .range([height, 0])
      .nice()

    g.append('g')
      .attr('class', 'rwh-chart__grid')
      .selectAll('line')
      .data(y.ticks(6))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))

    // Línea base 2016 = 100
    g.append('line')
      .attr('class', 'rwh-chart__base')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(100))
      .attr('y2', y(100))

    g.append('text')
      .attr('class', 'rwh-chart__base-label')
      .attr('x', width)
      .attr('y', y(100) - 6)
      .attr('text-anchor', 'end')
      .text('Base 2016 = 100')

    g.append('g')
      .attr('class', 'rwh-chart__axis rwh-chart__axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(data.map((d) => d.year))
          .tickFormat((d) => String(d))
          .tickSize(0),
      )
      .call((gAxis) => gAxis.select('.domain').remove())

    g.append('g')
      .attr('class', 'rwh-chart__axis rwh-chart__axis--y')
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickFormat((d) => `${d}`)
          .tickSize(0),
      )
      .call((gAxis) => gAxis.select('.domain').remove())

    g.append('text')
      .attr('class', 'rwh-chart__y-label')
      .attr('transform', `translate(-52,${height / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .text('Salario real · base 2016')

    // Sombreado: encima/debajo de la base 100
    const areaTop = d3
      .area<typeof data[number]>()
      .x((d) => x(d.year))
      .y0(y(100))
      .y1((d) => Math.min(y(d.realIndex), y(100)))
      .curve(d3.curveMonotoneX)

    const areaBottom = d3
      .area<typeof data[number]>()
      .x((d) => x(d.year))
      .y0(y(100))
      .y1((d) => Math.max(y(d.realIndex), y(100)))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('class', 'rwh-chart__area rwh-chart__area--up')
      .attr('d', areaTop)

    g.append('path')
      .datum(data)
      .attr('class', 'rwh-chart__area rwh-chart__area--down')
      .attr('d', areaBottom)

    // Línea principal
    const line = d3
      .line<typeof data[number]>()
      .x((d) => x(d.year))
      .y((d) => y(d.realIndex))
      .curve(d3.curveMonotoneX)

    const path = g
      .append('path')
      .datum(data)
      .attr('class', 'rwh-chart__line')
      .attr('d', line)

    const len = (path.node() as SVGPathElement).getTotalLength()
    path
      .attr('stroke-dasharray', `${len}`)
      .attr('stroke-dashoffset', len)
      .transition()
      .duration(1200)
      .attr('stroke-dashoffset', 0)

    // Anotaciones de hitos
    g.selectAll('.rwh-chart__milestone')
      .data(wageMilestones)
      .enter()
      .each(function (m) {
        const point = data.find((d) => d.year === m.year)
        if (!point) return
        const cx = x(point.year)
        const cy = y(point.realIndex)
        const sel = d3.select(this).append('g')
          .attr('class', 'rwh-chart__milestone')
          .attr('data-year', m.year)
          .attr('transform', `translate(${cx},${cy})`)
          .attr('opacity', highlighted === m.year ? 1 : 0.85)
          .style('cursor', 'pointer')
          .on('mouseenter', () => setHighlighted(m.year))
          .on('mouseleave', () => setHighlighted(null))
        sel.append('circle')
          .attr('r', 5)
          .attr('class', 'rwh-chart__milestone-dot')
        sel.append('circle')
          .attr('r', 10)
          .attr('class', 'rwh-chart__milestone-halo')
      })

    // Puntos hover
    g.selectAll('.rwh-chart__hover')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'rwh-chart__hover')
      .attr('cx', (d) => x(d.year))
      .attr('cy', (d) => y(d.realIndex))
      .attr('r', 12)
      .attr('fill', 'transparent')
      .on('mousemove', function (event, d) {
        const svgRect = svgRef.current!.getBoundingClientRect()
        setTip({
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top,
          year: d.year,
          index: d.realIndex,
          changeVsBase: ((d.realIndex - 100) / 100) * 100,
        })
      })
      .on('mouseleave', () => setTip(null))
  }, [data, size, highlighted])

  const activeMilestone = highlighted
    ? wageMilestones.find((m) => m.year === highlighted)
    : null

  const max = data.reduce((a, b) => (a.realIndex > b.realIndex ? a : b))
  const min = data.reduce((a, b) => (a.realIndex < b.realIndex ? a : b))
  const last = data[data.length - 1]
  const peakLossPct = ((last.realIndex - max.realIndex) / max.realIndex) * 100

  return (
    <div className="rwh">
      <header className="rwh__header">
        <p className="rwh__eyebrow">Datos oficiales · INDEC salarios e IPC nacional</p>
        <h2 className="rwh__title">Salario real argentino · 2016 – 2025</h2>
        <p className="rwh__lead">
          Serie anual calculada con el índice total de salarios de INDEC deflactado por el IPC
          nacional. Muestra cuánto cambia el poder de compra del salario respecto de diciembre
          de 2016.
        </p>
      </header>

      <div className="rwh__chart-wrap" ref={wrapRef}>
        <svg ref={svgRef} width="100%" height={size.h} />
        {tip && (
          <div className="rwh-tooltip" style={{ left: tip.x + 12, top: tip.y + 12 }} role="tooltip">
            <div className="rwh-tooltip__val">{tip.index.toFixed(0)}</div>
            <div className="rwh-tooltip__year">{tip.year}</div>
            <div className="rwh-tooltip__delta">
              {tip.changeVsBase >= 0 ? '+' : ''}
              {tip.changeVsBase.toFixed(1)} % vs. 2016
            </div>
          </div>
        )}
      </div>

      <div className="rwh__stats">
        <div className="rwh__stat">
          <span className="rwh__stat-label">Pico</span>
          <span className="rwh__stat-val">{max.realIndex}</span>
          <span className="rwh__stat-sub">{max.year}</span>
        </div>
        <div className="rwh__stat">
          <span className="rwh__stat-label">Mínimo</span>
          <span className="rwh__stat-val">{min.realIndex}</span>
          <span className="rwh__stat-sub">{min.year}</span>
        </div>
        <div className="rwh__stat">
          <span className="rwh__stat-label">Último valor</span>
          <span className="rwh__stat-val">{last.realIndex}</span>
          <span className="rwh__stat-sub">{last.year}</span>
        </div>
        <div className="rwh__stat rwh__stat--accent">
          <span className="rwh__stat-label">Distancia al pico</span>
          <span className="rwh__stat-val">{peakLossPct.toFixed(1)} %</span>
          <span className="rwh__stat-sub">vs. {max.year}</span>
        </div>
      </div>

      <div className="rwh__milestones">
        <p className="rwh__milestones-title">Hitos · pasá el cursor sobre los puntos del gráfico</p>
        <div className="rwh__milestones-grid">
          {wageMilestones.map((m) => (
            <article
              key={m.year}
              className="rwh__milestone-card"
              data-active={highlighted === m.year}
              onMouseEnter={() => setHighlighted(m.year)}
              onMouseLeave={() => setHighlighted(null)}
            >
              <span className="rwh__milestone-year">{m.year}</span>
              <h4 className="rwh__milestone-label">{m.label}</h4>
              <p className="rwh__milestone-desc">{m.description}</p>
            </article>
          ))}
        </div>
      </div>

      {activeMilestone && (
        <div className="rwh__active-banner" aria-live="polite">
          <strong>{activeMilestone.year} · {activeMilestone.label}.</strong>{' '}
          {activeMilestone.description}
        </div>
      )}
    </div>
  )
}
