export type SectionHeadingProps = {
  kicker: string
  title: string
  lead?: string
  id?: string
  className?: string
}

export function SectionHeading({ kicker, title, lead, id, className = '' }: SectionHeadingProps) {
  return (
    <header className={className}>
      <p className="section-eyebrow">{kicker}</p>
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {lead ? <p className="section-desc">{lead}</p> : null}
    </header>
  )
}