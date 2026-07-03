import type { PipelineUiStep } from '@/store/projectStore'

const NODES: { id: PipelineUiStep | 'export'; label: string }[] = [
  { id: 'preprocess', label: 'pre' },
  { id: 'trace', label: 'trc' },
  { id: 'place', label: 'plc' },
  { id: 'build', label: 'bld' },
  { id: 'export', label: 'exp' },
]

const ORDER = NODES.map((n) => n.id)

function stepIndex(step: PipelineUiStep): number {
  if (step === 'idle' || step === 'done') return -1
  if (step === 'validate') return ORDER.indexOf('build')
  if (step === 'render') return ORDER.indexOf('export')
  return ORDER.indexOf(step)
}

type PipelineGraphProps = {
  currentStep: PipelineUiStep
  isActive: boolean
}

export function PipelineGraph({ currentStep, isActive }: PipelineGraphProps) {
  const activeIndex = isActive ? stepIndex(currentStep) : -1
  const complete = currentStep === 'done'

  return (
    <div className="pipeline-tags" role="list" aria-label="Pipeline progress">
      {NODES.map((node, index) => {
        const isCurrent = isActive && activeIndex === index
        const isComplete = complete || (activeIndex >= 0 && index < activeIndex)
        const edgeComplete = complete || (activeIndex >= 0 && index <= activeIndex)

        return (
          <div key={node.id} className="flex min-w-0 flex-1 items-center gap-1" role="listitem">
            <span
              className={[
                'pipeline-tag',
                isCurrent ? 'pipeline-tag--active' : '',
                isComplete ? 'pipeline-tag--complete' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isCurrent ? 'step' : undefined}
              title={node.id}
            >
              {node.label}
            </span>
            {index < NODES.length - 1 && (
              <span
                className={['pipeline-edge', edgeComplete ? 'pipeline-edge--complete' : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden
              />
            )}
          </div>
        )
      })}
    </div>
  )
}