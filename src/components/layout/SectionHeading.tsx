export type SectionHeadingProps = {
  kicker: string
  title: string
  lead?: string
  id?: string
  className?: string
}

export function SectionHeading({ kicker, title, lead, id, className = '' }: SectionHeadingProps) {
  return (
    <header className={['space-y-2', className].join(' ')}>
      <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">{kicker}</p>
      <h2 id={id} className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      {lead && <p className="max-w-prose text-sm leading-relaxed text-muted">{lead}</p>}
    </header>
  )
}