import './HomeSlide.css'

export function HomeSlide() {
  return (
    <div className="home">
      <div className="home__accent" />
      <p className="home__eyebrow">Maestría en Economía y Derecho · UBA</p>
      <h1 className="home__title">Macroeconomía</h1>
      <p className="home__subtitle">
        Clase 02 · Dinero, precios, inflación y poder adquisitivo
      </p>
      <div className="home__footer">
        <span>Matias Mednik</span>
        <span className="home__footer-dot">·</span>
        <span>Ciclo 2026</span>
      </div>
    </div>
  )
}
