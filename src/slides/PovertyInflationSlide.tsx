import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { povertyArgentina, canastaArgentina } from '@/data/povertyArgentina'
import './PovertyInflationSlide.css'

type View = 'poverty' | 'canasta'

interface PovertyTip {
  x: number
  y: number
  period: string
  povertyRate: number
  indigenceRate: number
}

interface CanastaTip {
  x: number
  y: number
  year: number
  cbt: number
  cba: number
  ipc: number
}

export function PovertyInflationSlide() {
  const [view, setView] = useState<View>('poverty')
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [size, setSize] = useState({ w: 900, h: 360 })
  const [povTip, setPovTip] = useState<PovertyTip | null>(null)
  const [canTip, setCanTip] = useState<CanastaTip | null>(null)

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

  const povertyData = useMemo(() => {
    return povertyArgentina.map((p) => ({
      ...p,
      tIndex: p.year + (p.semester === 1 ? 0.0 : 0.5),
    }))
  }, [])

  const canastaData = useMemo(() => canastaArgentina, [])

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 32, right: 32, bottom: 40, left: 56 }
    const width = size.w - margin.left - margin.right
    const height = size.h - margin.top - margin.bottom

    const g = svg
      .attr('viewBox', `0 0 ${size.w} ${size.h}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    if (view === 'poverty') {
      drawPoverty(g, width, height)
    } else {
      drawCanasta(g, width, height)
    }

    function drawPoverty(
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      width: number,
      height: number,
    ) {
      const x = d3
        .scaleLinear()
        .domain(d3.extent(povertyData, (d) => d.tIndex) as [number, number])
        .range([0, width])
      const yMax = (d3.max(povertyData, (d) => d.povertyRate) ?? 60) * 1.05
      const y = d3.scaleLinear().domain([0, yMax]).range([height, 0]).nice()

      g.append('g')
        .attr('class', 'pov-chart__grid')
        .selectAll('line')
        .data(y.ticks(5))
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', (d) => y(d))
        .attr('y2', (d) => y(d))

      g.append('g')
        .attr('class', 'pov-chart__axis')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3
            .axisBottom(x)
            .tickValues(d3.range(2016, 2026, 1))
            .tickFormat((d) => String(Math.floor(Number(d))))
            .tickSize(0),
        )
        .call((sel) => sel.select('.domain').remove())

      g.append('g')
        .attr('class', 'pov-chart__axis')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickFormat((d) => `${d}%`)
            .tickSize(0),
        )
        .call((sel) => sel.select('.domain').remove())

      g.append('text')
        .attr('class', 'pov-chart__y-label')
        .attr('transform', `translate(-44,${height / 2}) rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text('Personas bajo línea (%)')

      // Línea pobreza
      const lineP = d3
        .line<typeof povertyData[number]>()
        .x((d) => x(d.tIndex))
        .y((d) => y(d.povertyRate))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(povertyData)
        .attr('class', 'pov-chart__line pov-chart__line--poverty')
        .attr('d', lineP)

      // Línea indigencia
      const lineI = d3
        .line<typeof povertyData[number]>()
        .x((d) => x(d.tIndex))
        .y((d) => y(d.indigenceRate))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(povertyData)
        .attr('class', 'pov-chart__line pov-chart__line--indigence')
        .attr('d', lineI)

      // Puntos pobreza
      g.selectAll('.pov-chart__pt-pov')
        .data(povertyData)
        .enter()
        .append('circle')
        .attr('class', 'pov-chart__pt-pov')
        .attr('cx', (d) => x(d.tIndex))
        .attr('cy', (d) => y(d.povertyRate))
        .attr('r', 3.5)

      g.selectAll('.pov-chart__pt-ind')
        .data(povertyData)
        .enter()
        .append('circle')
        .attr('class', 'pov-chart__pt-ind')
        .attr('cx', (d) => x(d.tIndex))
        .attr('cy', (d) => y(d.indigenceRate))
        .attr('r', 2.5)

      // Hover targets
      g.selectAll('.pov-chart__hover')
        .data(povertyData)
        .enter()
        .append('circle')
        .attr('class', 'pov-chart__hover')
        .attr('cx', (d) => x(d.tIndex))
        .attr('cy', (d) => y(d.povertyRate))
        .attr('r', 14)
        .attr('fill', 'transparent')
        .on('mousemove', function (event, d) {
          const svgRect = svgRef.current!.getBoundingClientRect()
          setPovTip({
            x: event.clientX - svgRect.left,
            y: event.clientY - svgRect.top,
            period: d.period,
            povertyRate: d.povertyRate,
            indigenceRate: d.indigenceRate,
          })
        })
        .on('mouseleave', () => setPovTip(null))

      // Anotación 2024-S1 (peak)
      const peak = povertyData.find((d) => d.period === '2024-S1')
      if (peak) {
        g.append('text')
          .attr('class', 'pov-chart__peak-label')
          .attr('x', x(peak.tIndex))
          .attr('y', y(peak.povertyRate) - 12)
          .attr('text-anchor', 'middle')
          .text(`2024-S1 · ${peak.povertyRate}%`)
        g.append('line')
          .attr('class', 'pov-chart__peak-tick')
          .attr('x1', x(peak.tIndex))
          .attr('x2', x(peak.tIndex))
          .attr('y1', y(peak.povertyRate))
          .attr('y2', y(peak.povertyRate) - 8)
      }
    }

    function drawCanasta(
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      width: number,
      height: number,
    ) {
      const x0 = d3
        .scaleBand<number>()
        .domain(canastaData.map((d) => d.year))
        .range([0, width])
        .paddingInner(0.25)
        .paddingOuter(0.1)
      const x1 = d3
        .scaleBand<string>()
        .domain(['cba', 'cbt', 'ipc'])
        .range([0, x0.bandwidth()])
        .padding(0.08)
      const yMax = d3.max(canastaData, (d) => Math.max(d.cbtChange, d.cbaChange, d.ipcChange)) ?? 100
      const y = d3.scaleLinear().domain([0, yMax * 1.05]).range([height, 0]).nice()

      g.append('g')
        .attr('class', 'pov-chart__grid')
        .selectAll('line')
        .data(y.ticks(5))
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', (d) => y(d))
        .attr('y2', (d) => y(d))

      g.append('g')
        .attr('class', 'pov-chart__axis')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3
            .axisBottom(x0 as unknown as d3.AxisScale<number>)
            .tickFormat((d) => String(d))
            .tickSize(0),
        )
        .call((sel) => sel.select('.domain').remove())

      g.append('g')
        .attr('class', 'pov-chart__axis')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickFormat((d) => `${d}%`)
            .tickSize(0),
        )
        .call((sel) => sel.select('.domain').remove())

      g.append('text')
        .attr('class', 'pov-chart__y-label')
        .attr('transform', `translate(-44,${height / 2}) rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text('Variación interanual (%)')

      const groups = g
        .selectAll('.pov-chart__cgrp')
        .data(canastaData)
        .enter()
        .append('g')
        .attr('class', 'pov-chart__cgrp')
        .attr('transform', (d) => `translate(${x0(d.year) ?? 0},0)`)

      const drawBars = (
        key: 'cba' | 'cbt' | 'ipc',
        accessor: (d: typeof canastaData[number]) => number,
        cls: string,
      ) => {
        groups
          .append('rect')
          .attr('class', `pov-chart__cbar ${cls}`)
          .attr('x', x1(key) ?? 0)
          .attr('width', x1.bandwidth())
          .attr('y', (d) => y(accessor(d)))
          .attr('height', (d) => height - y(accessor(d)))
          .attr('rx', 2)
          .on('mousemove', function (event, d) {
            const svgRect = svgRef.current!.getBoundingClientRect()
            setCanTip({
              x: event.clientX - svgRect.left,
              y: event.clientY - svgRect.top,
              year: d.year,
              cbt: d.cbtChange,
              cba: d.cbaChange,
              ipc: d.ipcChange,
            })
          })
          .on('mouseleave', () => setCanTip(null))
      }

      drawBars('cba', (d) => d.cbaChange, 'pov-chart__cbar--cba')
      drawBars('cbt', (d) => d.cbtChange, 'pov-chart__cbar--cbt')
      drawBars('ipc', (d) => d.ipcChange, 'pov-chart__cbar--ipc')
    }
  }, [view, povertyData, canastaData, size])

  return (
    <div className="pov">
      <header className="pov__header">
        <p className="pov__eyebrow">Datos · INDEC, Encuesta Permanente de Hogares (EPH)</p>
        <h2 className="pov__title">Inflación, canasta básica y pobreza</h2>
        <p className="pov__lead">
          Una persona es <strong>pobre</strong> cuando sus ingresos no alcanzan a comprar la
          Canasta Básica Total (CBT). Si la CBT sube más rápido que los ingresos — y muchas veces
          más rápido que el IPC general — la pobreza aumenta aunque los salarios “suban”.
        </p>
      </header>

      <div className="pov__controls">
        <div className="pov-toggle" role="tablist" aria-label="Vista">
          <button
            role="tab"
            className="pov-toggle__btn"
            data-active={view === 'poverty'}
            onClick={() => setView('poverty')}
          >
            Pobreza e indigencia
          </button>
          <button
            role="tab"
            className="pov-toggle__btn"
            data-active={view === 'canasta'}
            onClick={() => setView('canasta')}
          >
            Canasta vs. IPC
          </button>
        </div>
        <div className="pov__legend">
          {view === 'poverty' ? (
            <>
              <span className="pov__legend-item">
                <i className="pov__sw pov__sw--poverty" /> Pobreza (CBT)
              </span>
              <span className="pov__legend-item">
                <i className="pov__sw pov__sw--indigence" /> Indigencia (CBA)
              </span>
            </>
          ) : (
            <>
              <span className="pov__legend-item">
                <i className="pov__sw pov__sw--cba" /> CBA · alimentos
              </span>
              <span className="pov__legend-item">
                <i className="pov__sw pov__sw--cbt" /> CBT · canasta total
              </span>
              <span className="pov__legend-item">
                <i className="pov__sw pov__sw--ipc" /> IPC general
              </span>
            </>
          )}
        </div>
      </div>

      <div className="pov__chart-wrap" ref={wrapRef}>
        <svg ref={svgRef} width="100%" height={size.h} />
        {povTip && view === 'poverty' && (
          <div className="pov-tooltip" style={{ left: povTip.x + 12, top: povTip.y + 12 }} role="tooltip">
            <div className="pov-tooltip__period">{povTip.period}</div>
            <div className="pov-tooltip__row">
              <span className="pov-tooltip__lbl pov-tooltip__lbl--poverty">Pobreza</span>
              <span className="pov-tooltip__val">{povTip.povertyRate.toFixed(1)} %</span>
            </div>
            <div className="pov-tooltip__row">
              <span className="pov-tooltip__lbl pov-tooltip__lbl--indigence">Indigencia</span>
              <span className="pov-tooltip__val">{povTip.indigenceRate.toFixed(1)} %</span>
            </div>
          </div>
        )}
        {canTip && view === 'canasta' && (
          <div className="pov-tooltip" style={{ left: canTip.x + 12, top: canTip.y + 12 }} role="tooltip">
            <div className="pov-tooltip__period">{canTip.year}</div>
            <div className="pov-tooltip__row">
              <span className="pov-tooltip__lbl pov-tooltip__lbl--cba">CBA</span>
              <span className="pov-tooltip__val">{canTip.cba.toFixed(1)} %</span>
            </div>
            <div className="pov-tooltip__row">
              <span className="pov-tooltip__lbl pov-tooltip__lbl--cbt">CBT</span>
              <span className="pov-tooltip__val">{canTip.cbt.toFixed(1)} %</span>
            </div>
            <div className="pov-tooltip__row">
              <span className="pov-tooltip__lbl pov-tooltip__lbl--ipc">IPC</span>
              <span className="pov-tooltip__val">{canTip.ipc.toFixed(1)} %</span>
            </div>
          </div>
        )}
      </div>

      <div className="pov__insight">
        <h4 className="pov__insight-title">Cómo se conectan</h4>
        <ol className="pov__insight-list">
          <li>
            <strong>Inflación de alimentos &gt; IPC general.</strong> En 2018, 2020, 2022 y 2023, los
            alimentos (CBA) subieron por encima del nivel general. La CBA pesa fuerte en la canasta
            de los hogares de menores ingresos: si los alimentos suben rápido, la línea de pobreza
            se aleja.
          </li>
          <li>
            <strong>El salto de 2024-S1.</strong> La devaluación de diciembre de 2023 disparó el IPC
            (+25 % sólo ese mes). La pobreza saltó del 41,7 % (2023-S2) al 52,9 % (2024-S1):
            más de <strong>5 millones</strong> de personas adicionales bajo la línea en seis meses.
          </li>
          <li>
            <strong>El descenso posterior.</strong> Cuando la inflación desacelera y los ingresos se
            recomponen — incluso parcialmente — la pobreza retrocede. Pero la velocidad asimétrica
            (sube rápido, baja despacio) es típica de las crisis inflacionarias en Argentina.
          </li>
        </ol>
      </div>
    </div>
  )
}
