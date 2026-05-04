import './SectionTitleSlide.css'

interface Props {
  number: string
  title: string
}

export function SectionTitleSlide({ number, title }: Props) {
  return (
    <div className="section">
      <span className="section__number">{number}</span>
      <h2 className="section__title">{title}</h2>
      <div className="section__line" />
    </div>
  )
}
