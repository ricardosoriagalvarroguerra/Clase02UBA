import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { realWageArgentina } from '@/data/realWageArgentina'
import { argentinaInflation } from '@/data/argentinaInflation'
import './WageInflationGapSlide.css'

interface YearRow {
  year: number
  inflation: number
  nominal: number
  real: number
}

interface Tooltip {
  x: number
  y: number
  row: YearRow
}

// Período de mejor cobertura para el concepto de "paritaria" como mecanismo formal de ajuste.
const FROM_YEAR = 2017
const TO_YEAR = 2025

export function WageInflationGapSlide() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 900, h: 360 })
  const [tip, setTip] = useState<Tooltip | null>(null)

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

  const rows: YearRow[] = useMemo(() => {
    const inflMap = new Map(argentinaInflation.map((p) => [p.year, p.rate]))
    const wageMap = new Map(realWageArgentina.map((p) => [p.year, p.realIndex]))
    const out: YearRow[] = []
    for (let y = FROM_YEAR; y <= TO_YEAR; y++) {
      const realT = wageMap.get(y)
      const realPrev = wageMap.get(y - 1)
      const pi = inflMap.get(y)
      if (realT === undefined || realPrev === undefined || pi === undefined) continue
      const realGrowth = (realT / realPrev - 1) * 100
      // (1 + nominal) = (1 + real) * (1 + π)
      const nominal = ((1 + realGrowth / 100) * (1 + pi / 100) - 1) * 100
      out.push({ year: y, inflation: pi, nominal, real: realGrowth })
    }
    return out
  }, [])

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 28, right: 24, bottom: 56, left: 56 }
    const width = size.w - margin.left - margin.right
    const height = size.h - margin.top - margin.bottom

    const g = svg
      .attr('viewBox', `0 0 ${size.w} ${size.h}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x0 = d3
      .scaleBand<number>()
      .domain(rows.map((d) => d.year))
      .range([0, width])
      .paddingInner(0.25)
      .paddingOuter(0.1)

    const x1 = d3
      .scaleBand<string>()
      .domain(['nominal', 'inflation'])
      .range([0, x0.bandwidth()])
      .padding(0.1)

    const yMax = d3.max(rows, (d) => Math.max(d.inflation, d.nominal)) ?? 100
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.05])
      .range([height, 0])
      .nice()

    g.append('g')
      .attr('class', 'wig-chart__grid')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))

    g.append('g')
      .attr('class', 'wig-chart__axis wig-chart__axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x0 as unknown as d3.AxisScale<number>)
          .tickFormat((d) => String(d))
          .tickSize(0),
      )
      .call((gAxis) => gAxis.select('.domain').remove())

    g.append('g')
      .attr('class', 'wig-chart__axis wig-chart__axis--y')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${d}%`)
          .tickSize(0),
      )
      .call((gAxis) => gAxis.select('.domain').remove())

    g.append('text')
      .attr('class', 'wig-chart__y-label')
      .attr('transform', `translate(-44,${height / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .text('Variación interanual (%)')

    // Grupos por año
    const groups = g
      .selectAll('.wig-chart__group')
      .data(rows)
      .enter()
      .append('g')
      .attr('class', 'wig-chart__group')
      .attr('transform', (d) => `translate(${x0(d.year) ?? 0},0)`)

    // Barra paritaria (nominal)
    groups
      .append('rect')
      .attr('class', 'wig-chart__bar wig-chart__bar--nominal')
      .attr('x', x1('nominal') ?? 0)
      .attr('width', x1.bandwidth())
      .attr('y', (d) => y(d.nominal))
      .attr('height', (d) => height - y(d.nominal))
      .attr('rx', 2)
      .on('mousemove', function (event, d) {
        showTip(event, d)
      })
      .on('mouseleave', () => setTip(null))

    // Barra inflación
    groups
      .append('rect')
      .attr('class', 'wig-chart__bar wig-chart__bar--inflation')
      .attr('x', x1('inflation') ?? 0)
      .attr('width', x1.bandwidth())
      .attr('y', (d) => y(d.inflation))
      .attr('height', (d) => height - y(d.inflation))
      .attr('rx', 2)
      .on('mousemove', function (event, d) {
        showTip(event, d)
      })
      .on('mouseleave', () => setTip(null))

    // Etiqueta Δ real bajo cada par de barras
    groups
      .append('text')
      .attr('class', (d) => `wig-chart__delta ${d.real >= 0 ? 'wig-chart__delta--up' : 'wig-chart__delta--down'}`)
      .attr('x', x0.bandwidth() / 2)
      .attr('y', height + 22)
      .attr('text-anchor', 'middle')
      .text((d) => `${d.real >= 0 ? '+' : ''}${d.real.toFixed(1)}%`)

    g.append('text')
      .attr('class', 'wig-chart__delta-caption')
      .attr('x', -8)
      .attr('y', height + 22)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .text('Δ real')

    function showTip(event: MouseEvent, d: YearRow) {
      const svgRect = svgRef.current!.getBoundingClientRect()
      setTip({
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top,
        row: d,
      })
    }
  }, [rows, size])

  const realLossYears = rows.filter((r) => r.real < 0).length

  return (
    <div className="wig">
      <header className="wig__header">
        <p className="wig__eyebrow">Datos · INDEC + paritarias homologadas</p>
        <h2 className="wig__title">Paritarias vs. inflación · ¿quién corre más rápido?</h2>
        <p className="wig__lead">
          Cada año los sindicatos negocian una <strong>paritaria</strong>: un aumento del salario nominal
          pactado con las empresas. Pero ese aumento sólo mejora el bolsillo si supera a la inflación.
          La diferencia entre la barra verde y la barra roja es el cambio del salario real.
        </p>
      </header>

      <div className="wig__chart-wrap" ref={wrapRef}>
        <svg ref={svgRef} width="100%" height={size.h} />
        {tip && (
          <div className="wig-tooltip" style={{ left: tip.x + 12, top: tip.y + 12 }} role="tooltip">
            <div className="wig-tooltip__year">{tip.row.year}</div>
            <div className="wig-tooltip__rows">
              <span className="wig-tooltip__lbl wig-tooltip__lbl--nominal">Paritaria nominal</span>
              <span className="wig-tooltip__val">{tip.row.nominal.toFixed(1)} %</span>
              <span className="wig-tooltip__lbl wig-tooltip__lbl--inflation">Inflación</span>
              <span className="wig-tooltip__val">{tip.row.inflation.toFixed(1)} %</span>
              <span className="wig-tooltip__lbl wig-tooltip__lbl--real">Δ Salario real</span>
              <span
                className={`wig-tooltip__val ${tip.row.real < 0 ? 'wig-tooltip__val--down' : 'wig-tooltip__val--up'}`}
              >
                {tip.row.real >= 0 ? '+' : ''}
                {tip.row.real.toFixed(1)} %
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="wig__legend">
        <span className="wig__legend-item">
          <i className="wig__legend-swatch wig__legend-swatch--nominal" />
          Aumento salarial nominal (paritaria)
        </span>
        <span className="wig__legend-item">
          <i className="wig__legend-swatch wig__legend-swatch--inflation" />
          Inflación interanual
        </span>
      </div>

      <div className="wig__insight">
        <h4 className="wig__insight-title">Lo que esconde el gráfico</h4>
        <ul className="wig__insight-list">
          <li>
            <strong>El rezago.</strong> Las paritarias se firman <em>una vez al año</em> (a veces
            dos), pero los precios suben todos los meses. Aunque la paritaria iguale la inflación
            anual, durante los meses sin aumento el salario real cae y luego se recupera parcialmente.
          </li>
          <li>
            <strong>Pierde la mayoría de los años.</strong> En {realLossYears} de los {rows.length} años
            mostrados, la paritaria perdió contra la inflación. Resultado: caída acumulada del salario
            real desde 2017.
          </li>
          <li>
            <strong>2024 es la excepción.</strong> Tras el salto inflacionario de 2023, las paritarias
            sobrepasaron a la inflación y el salario real recuperó parte de lo perdido.
          </li>
        </ul>
      </div>
    </div>
  )
}
