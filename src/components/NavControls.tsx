interface Props {
  activeIndex: number
  total: number
  onPrev: () => void
  onNext: () => void
  onDot: (i: number) => void
}

export function NavControls({ activeIndex, total, onPrev, onNext, onDot }: Props) {
  return (
    <>
      <div className="progress" role="navigation" aria-label="Progreso">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            className="progress__dot"
            data-active={i === activeIndex}
            aria-label={`Ir a diapositiva ${i + 1}`}
            onClick={() => onDot(i)}
          />
        ))}
      </div>
      <div className="nav-controls">
        <button
          className="nav-btn"
          onClick={onPrev}
          disabled={activeIndex === 0}
          aria-label="Anterior"
        >
          ↑
        </button>
        <button
          className="nav-btn"
          onClick={onNext}
          disabled={activeIndex === total - 1}
          aria-label="Siguiente"
        >
          ↓
        </button>
      </div>
      <div className="slide-counter">
        {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </>
  )
}
