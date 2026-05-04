import { useEffect, useState } from 'react'
import './CpiVsDeflatorSlide.css'

interface Props { isActive: boolean }

export function CpiVsDeflatorSlide({ isActive }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isActive) setStep(0)
  }, [isActive])

  const next = () => setStep((s) => Math.min(2, s + 1))
  const reset = () => setStep(0)

  return (
    <div className="cpid">
      <header className="cpid__header">
        <p className="cpid__eyebrow">No hay un único índice de precios</p>
        <h2 className="cpid__title">IPC y Deflactor del PIB · ¿qué mide cada uno?</h2>
        <p className="cpid__lead">
          Cuando un titular dice “la inflación fue X %” puede estar usando dos índices distintos.
          Los dos miden “cuánto suben los precios” pero <strong>miran cosas distintas</strong>:
          uno se asoma al bolsillo de los hogares; el otro a todo lo que produce el país.
        </p>
      </header>

      <div className="cpid__grid">
        <article className="cpid__card cpid__card--ipc" data-visible={step >= 1}>
          <div className="cpid__icon" aria-hidden>
            <svg viewBox="0 0 60 60" width="48" height="48">
              <rect x="10" y="14" width="40" height="34" rx="4" fill="none"
                stroke="currentColor" strokeWidth="2" />
              <path d="M16 22 H 44 M16 30 H 44 M16 38 H 36" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" />
              <path d="M22 8 L 22 14 M38 8 L 38 14" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="cpid__name">IPC</h3>
          <p className="cpid__sub">Índice de Precios al Consumidor</p>

          <ul className="cpid__list">
            <li><strong>¿Qué mira?</strong> Lo que compran los hogares: comida, alquiler, transporte, ropa, servicios.</li>
            <li><strong>Canasta:</strong> fija — la misma lista de productos cada mes (se actualiza cada varios años).</li>
            <li><strong>Incluye productos importados</strong> si los hogares los consumen (ej. celular, café).</li>
            <li><strong>No incluye:</strong> maquinaria, fábricas, lo que el país le vende al exterior.</li>
            <li><strong>Frecuencia:</strong> mensual — es el número que sale en los diarios.</li>
          </ul>

          <div className="cpid__tag">Es la inflación que sentís en el supermercado</div>
        </article>

        <article className="cpid__card cpid__card--def" data-visible={step >= 2}>
          <div className="cpid__icon" aria-hidden>
            <svg viewBox="0 0 60 60" width="48" height="48">
              <path d="M10 50 H 50" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="34" width="8" height="14" fill="currentColor" opacity="0.85" />
              <rect x="26" y="22" width="8" height="26" fill="currentColor" opacity="0.7" />
              <rect x="38" y="14" width="8" height="34" fill="currentColor" opacity="0.55" />
            </svg>
          </div>
          <h3 className="cpid__name">Deflactor del PIB</h3>
          <p className="cpid__sub">El precio promedio de lo que produce el país</p>

          <p className="cpid__formula-inline">
            Deflactor = PIB en pesos de hoy / PIB “a precios constantes” × 100
          </p>

          <ul className="cpid__list">
            <li><strong>¿Qué mira?</strong> Todo lo que el país produce: lo que consumen los hogares, lo que invierten las empresas, lo que gasta el Estado y lo que se exporta.</li>
            <li><strong>Canasta:</strong> cambia cada período — refleja lo que efectivamente se produjo ese año.</li>
            <li><strong>Incluye exportaciones</strong> (soja, autos que se venden afuera).</li>
            <li><strong>No incluye productos importados</strong> aunque los compres todos los días — esos sí están en el IPC.</li>
            <li><strong>Frecuencia:</strong> trimestral — lo publica el INDEC con el dato del PIB.</li>
          </ul>

          <div className="cpid__tag">Es el dato “macro” que usan los economistas</div>
        </article>
      </div>

      <div className="cpid__actions">
        {step < 2 ? (
          <button className="cpid__btn" onClick={next}>
            {step === 0 ? 'Mostrar IPC →' : 'Mostrar Deflactor →'}
          </button>
        ) : (
          <button className="cpid__btn cpid__btn--ghost" onClick={reset}>Reiniciar</button>
        )}
      </div>
    </div>
  )
}
