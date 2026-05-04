import { useEffect, useMemo, useState } from 'react'
import { useSlideNav } from '@/hooks/useSlideNav'
import { NavControls } from '@/components/NavControls'
import { Whiteboard } from '@/components/Whiteboard'
import { HomeSlide } from '@/slides/HomeSlide'
import { SectionTitleSlide } from '@/slides/SectionTitleSlide'
import { MoneyFunctionsSlide } from '@/slides/MoneyFunctionsSlide'
import { PercentChangeSlide } from '@/slides/PercentChangeSlide'
import { SupplyDemandSlide } from '@/slides/SupplyDemandSlide'
import { RelativeVsGeneralPricesSlide } from '@/slides/RelativeVsGeneralPricesSlide'
import { ExpectationsSlide } from '@/slides/ExpectationsSlide'
import { InflationConceptSlide } from '@/slides/InflationConceptSlide'
import { PriceIndexBasketSlide } from '@/slides/PriceIndexBasketSlide'
import { InflationFormulaSlide } from '@/slides/InflationFormulaSlide'
import { CpiVsDeflatorSlide } from '@/slides/CpiVsDeflatorSlide'
import { ArgentinaInflationSlide } from '@/slides/ArgentinaInflationSlide'
import { RealWageSlide } from '@/slides/RealWageSlide'
import { RealWageHistorySlide } from '@/slides/RealWageHistorySlide'
import { WageInflationGapSlide } from '@/slides/WageInflationGapSlide'
import { PovertyInflationSlide } from '@/slides/PovertyInflationSlide'
import { StudentBasketSlide } from '@/slides/StudentBasketSlide'
import { ParitariasLagSlide } from '@/slides/ParitariasLagSlide'
import { LawyerHookSlide } from '@/slides/LawyerHookSlide'
import { MyInflationSlide } from '@/slides/MyInflationSlide'

interface SlideDef {
  id: string
  render: (isActive: boolean) => React.ReactNode
}

const slides: SlideDef[] = [
  { id: 'home', render: () => <HomeSlide /> },
  { id: 'lawyer-hook', render: (isActive) => <LawyerHookSlide isActive={isActive} /> },
  {
    id: 'section-00',
    render: () => <SectionTitleSlide number="00" title="Fundamentos económicos" />,
  },
  { id: 'money-functions', render: (isActive) => <MoneyFunctionsSlide isActive={isActive} /> },
  { id: 'percent-change', render: (isActive) => <PercentChangeSlide isActive={isActive} /> },
  { id: 'supply-demand', render: (isActive) => <SupplyDemandSlide isActive={isActive} /> },
  {
    id: 'relative-vs-general',
    render: (isActive) => <RelativeVsGeneralPricesSlide isActive={isActive} />,
  },
  {
    id: 'section-01',
    render: () => <SectionTitleSlide number="01" title="Precios e inflación" />,
  },
  { id: 'inflation-concept', render: (isActive) => <InflationConceptSlide isActive={isActive} /> },
  { id: 'price-index-basket', render: (isActive) => <PriceIndexBasketSlide isActive={isActive} /> },
  { id: 'inflation-formula', render: (isActive) => <InflationFormulaSlide isActive={isActive} /> },
  { id: 'cpi-vs-deflator', render: (isActive) => <CpiVsDeflatorSlide isActive={isActive} /> },
  { id: 'my-inflation', render: (isActive) => <MyInflationSlide isActive={isActive} /> },
  { id: 'argentina-inflation', render: () => <ArgentinaInflationSlide /> },
  { id: 'real-wage', render: (isActive) => <RealWageSlide isActive={isActive} /> },
  { id: 'expectations', render: (isActive) => <ExpectationsSlide isActive={isActive} /> },
  {
    id: 'section-02',
    render: () => (
      <SectionTitleSlide number="02" title="Salarios, inflación y poder adquisitivo" />
    ),
  },
  { id: 'real-wage-history', render: () => <RealWageHistorySlide /> },
  { id: 'wage-inflation-gap', render: () => <WageInflationGapSlide /> },
  { id: 'poverty-inflation', render: () => <PovertyInflationSlide /> },
  { id: 'student-basket', render: () => <StudentBasketSlide /> },
  { id: 'paritarias-lag', render: () => <ParitariasLagSlide /> },
]

export default function App() {
  const slideIds = useMemo(() => slides.map((s) => s.id), [])
  const { activeIndex, next, prev, goTo } = useSlideNav(slideIds)
  const [whiteboardOpen, setWhiteboardOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'b' || e.key === 'B') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null
        const tag = target?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
        e.preventDefault()
        setWhiteboardOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div className="deck">
        {slides.map((s, i) => (
          <section
            key={s.id}
            className="slide"
            data-slide-id={s.id}
            data-active={i === activeIndex}
          >
            <div className="slide__inner">{s.render(i === activeIndex)}</div>
          </section>
        ))}
      </div>
      <NavControls
        activeIndex={activeIndex}
        total={slides.length}
        onPrev={prev}
        onNext={next}
        onDot={goTo}
      />
      <button
        type="button"
        className="wb-toggle"
        onClick={() => setWhiteboardOpen(true)}
        aria-label="Abrir pizarra"
        title="Abrir pizarra (B)"
      >
        <span className="wb-toggle__icon" aria-hidden>✎</span>
        Pizarra
      </button>
      <Whiteboard open={whiteboardOpen} onClose={() => setWhiteboardOpen(false)} />
    </>
  )
}
