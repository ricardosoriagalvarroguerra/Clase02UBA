import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import './ParitariasLagSlide.css'

// Serie ilustrativa: índice base 100 en Nov 2023.
// IPC mensual aproximado (variaciones m/m INDEC, redondeadas) — refleja
// devaluación dic-23, pico ene-24, desaceleración 2024-2025.
const MONTHLY_IPC_PCT = [
  // 2023
  { m: '2023-11', v: 12.8 },
  { m: '2023-12', v: 25.5 },
  // 2024
  { m: '2024-01', v: 20.6 },
  { m: '2024-02', v: 13.2 },
  { m: '2024-03', v: 11.0 },
  { m: '2024-04', v: 8.8 },
  { m: '2024-05', v: 4.2 },
  { m: '2024-06', v: 4.6 },
  { m: '2024-07', v: 4.0 },
  { m: '2024-08', v: 4.2 },
  { m: '2024-09', v: 3.5 },
  { m: '2024-10', v: 2.7 },
  { m: '2024-11', v: 2.4 },
  { m: '2024-12', v: 2.7 },
  // 2025
  { m: '2025-01', v: 2.2 },
  { m: '2025-02', v: 2.4 },
  { m: '2025-03', v: 2.8 },
  { m: '2025-04', v: 2.6 },
  { m: '2025-05', v: 2.3 },
  { m: '2025-06', v: 2.0 },
  { m: '2025-07', v: 1.9 },
  { m: '2025-08', v: 1.8 },
  { m: '2025-09', v: 1.7 },
  { m: '2025-10', v: 1.6 },
  { m: '2025-11', v: 1.5 },
  { m: '2025-12', v: 1.6 },
  // 2026
  { m: '2026-01', v: 1.7 },
  { m: '2026-02', v: 1.5 },
  { m: '2026-03', v: 1.4 },
  { m: '2026-04', v: 1.4 },
] as const

// Aumentos paritarios: saltos de sueldo nominal (%) en fechas concretas.
const PARITARIAS = [
  { m: '2023-11', pct: 0 },     // base
  { m: '2024-01', pct: 16 },
  { m: '2024-04', pct: 20 },
  { m: '2024-07', pct: 14 },
  { m: '2024-10', pct: 10 },
  { m: '2025-01', pct: 8 },
  { m: '2025-04', pct: 7 },
  { m: '2025-07', pct: 6 },
  { m: '2025-10', pct: 5 },
  { m: '2026-01', pct: 4 },
  { m: '2026-04', pct: 4 },
] as const

interface Series {
  m: string
  ipc: number
  salario: number
}

export function ParitariasLagSlide() {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [size, setSize] = useState({ w: 900, h: 360 })

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

  const series = useMemo<Series[]>(() => {
    let ipc = 100
    let salario = 100
    const paritariasMap = new Map<string, number>(PARITARIAS.map((p) => [p.m, p.pct]))
    const out: Series[] = []
    for (const { m, v } of MONTHLY_IPC_PCT) {
      ipc *= 1 + v / 100
      const bump = paritariasMap.get(m) ?? 0
      salario *= 1 + bump / 100
      out.push({ m, ipc, salario })
    }
    return out
  }, [])

  useEffect(() => {
    if (!svgRef.current || series.length === 0) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 28, right: 80, bottom: 40, left: 56 }
    const width = size.w - margin.left - margin.right
    const height = size.h - margin.top - margin.bottom

    const g = svg
      .attr('viewBox', `0 0 ${size.w} ${size.h}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const parse = d3.timeParse('%Y-%m')
    const data = series.map((d) => ({ ...d, date: parse(d.m) as Date }))

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, width])

    const yMax = (d3.max(data, (d) => Math.max(d.ipc, d.salario)) ?? 600) * 1.04
    const y = d3.scaleLinear().domain([100, yMax]).range([height, 0]).nice()

    // Grid
    g.append('g')
      .attr('class', 'plg__grid')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))

    // Axes
    g.append('g')
      .attr('class', 'plg__axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(4))
          .tickFormat((d) => {
            const dt = d as Date
            const fmt = d3.timeFormat('%b %y')
            return fmt(dt)
          })
          .tickSize(0),
      )
      .call((sel) => sel.select('.domain').remove())

    g.append('g')
      .attr('class', 'plg__axis')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => String(d))
          .tickSize(0),
      )
      .call((sel) => sel.select('.domain').remove())

    g.append('text')
      .attr('class', 'plg__y-label')
      .attr('transform', `translate(-44,${height / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .text('Índice (Nov 2023 = 100)')

    // Área entre IPC y salario (pérdida acumulada)
    const area = d3
      .area<typeof data[number]>()
      .x((d) => x(d.date))
      .y0((d) => y(d.salario))
      .y1((d) => y(d.ipc))
      .curve(d3.curveStepAfter)

    g.append('path')
      .datum(data)
      .attr('class', 'plg__gap')
      .attr('d', area)

    // Línea IPC (continua)
    const lineIpc = d3
      .line<typeof data[number]>()
      .x((d) => x(d.date))
      .y((d) => y(d.ipc))
      .curve(d3.curveMonotoneX)
    g.append('path')
      .datum(data)
      .attr('class', 'plg__line plg__line--ipc')
      .attr('d', lineIpc)

    // Línea salario (escalonada — paritarias en saltos)
    const lineSal = d3
      .line<typeof data[number]>()
      .x((d) => x(d.date))
      .y((d) => y(d.salario))
      .curve(d3.curveStepAfter)
    g.append('path')
      .datum(data)
      .attr('class', 'plg__line plg__line--salario')
      .attr('d', lineSal)

    // Etiquetas finales
    const last = data[data.length - 1]
    g.append('text')
      .attr('class', 'plg__end-label plg__end-label--ipc')
      .attr('x', x(last.date) + 8)
      .attr('y', y(last.ipc) + 4)
      .text(`IPC · ${last.ipc.toFixed(0)}`)
    g.append('text')
      .attr('class', 'plg__end-label plg__end-label--salario')
      .attr('x', x(last.date) + 8)
      .attr('y', y(last.salario) + 4)
      .text(`Sueldo · ${last.salario.toFixed(0)}`)

    // Marcas de paritarias (puntos en la línea de salario)
    g.selectAll('.plg__bump')
      .data(PARITARIAS.filter((p) => p.pct > 0))
      .enter()
      .append('circle')
      .attr('class', 'plg__bump')
      .attr('r', 3)
      .attr('cx', (p) => {
        const point = data.find((d) => d.m === p.m)
        return point ? x(point.date) : 0
      })
      .attr('cy', (p) => {
        const point = data.find((d) => d.m === p.m)
        return point ? y(point.salario) : 0
      })
  }, [series, size])

  const last = series[series.length - 1]
  const realFinal = last ? (last.salario / last.ipc) * 100 : 100

  return (
    <div className="plg">
      <header className="plg__header">
        <p className="plg__eyebrow">Aterrizando los conceptos · paritarias y rezago</p>
        <h2 className="plg__title">¿Por qué el aumento siempre llega tarde?</h2>
        <p className="plg__lead">
          Los precios suben <strong>todos los meses</strong>; los sueldos suben en
          <strong> saltos </strong> cuando se firma una paritaria. Aunque a fin de año los
          dos índices terminen parecidos, durante los meses intermedios el sueldo viene
          corriendo de atrás. Esa diferencia es <strong>plata real perdida</strong> —
          aunque la cifra del recibo siga subiendo.
        </p>
      </header>

      <div className="plg__chart-wrap" ref={wrapRef}>
        <svg ref={svgRef} width="100%" height={size.h} />
        <div className="plg__legend">
          <span className="plg__legend-item">
            <i className="plg__sw plg__sw--ipc" /> IPC (precios al consumidor)
          </span>
          <span className="plg__legend-item">
            <i className="plg__sw plg__sw--salario" /> Sueldo nominal (paritarias)
          </span>
          <span className="plg__legend-item">
            <i className="plg__sw plg__sw--gap" /> Pérdida acumulada
          </span>
        </div>
      </div>

      <div className="plg__insight">
        <div className="plg__insight-card">
          <span className="plg__insight-num">01</span>
          <h4 className="plg__insight-title">El precio se mueve continuo</h4>
          <p className="plg__insight-text">
            Cada vez que vas al kiosco o al super, los precios cambiaron un poquito.
            La inflación es un <em>goteo diario</em>.
          </p>
        </div>
        <div className="plg__insight-card">
          <span className="plg__insight-num">02</span>
          <h4 className="plg__insight-title">El sueldo se mueve a saltos</h4>
          <p className="plg__insight-text">
            La paritaria se firma cada 3 ó 6 meses. Hasta que llega el aumento,
            el sueldo está <em>congelado</em> aunque los precios sigan subiendo.
          </p>
        </div>
        <div className="plg__insight-card plg__insight-card--key">
          <span className="plg__insight-num">03</span>
          <h4 className="plg__insight-title">El área es la pérdida</h4>
          <p className="plg__insight-text">
            Esa zona sombreada entre las dos líneas es <strong>poder de compra
            que ya no recuperás</strong>, aunque después la paritaria “empate” al IPC.
            Por eso el sueldo real terminó en {realFinal.toFixed(0)} (no en 100).
          </p>
        </div>
      </div>
    </div>
  )
}
