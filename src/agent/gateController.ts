import type { ValidationResult } from '@/types/pipeline'

export type GateStage = 'trace' | 'font'

export type GateRequest = {
  stage: GateStage
  summary: string
  sourcePreviewUrl: string
  tracePreviewPng?: string
  renderPreviewPng?: string
  proposedCharacter: string
  validation?: ValidationResult
}

export type GateResponse =
  | { action: 'accept' }
  | { action: 'retrace'; nudge: string }
  | { action: 'fixCharacter'; character: string }
  | { action: 'adjust'; nudge: string }

export type GateHandlers = {
  accept: () => void
  retrace: (nudge: string) => void
  fixCharacter: (character: string) => void
  adjust: (nudge: string) => void
}

export class GateController {
  private pending?: {
    resolve: (response: GateResponse) => void
    reject: (err: Error) => void
  }

  onGateOpen?: (request: GateRequest) => void
  onGateClose?: () => void

  waitForHuman(request: GateRequest): Promise<GateResponse> {
    this.onGateOpen?.(request)
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject }
    })
  }

  respond(response: GateResponse) {
    if (!this.pending) return
    this.pending.resolve(response)
    this.pending = undefined
    this.onGateClose?.()
  }

  cancel() {
    if (!this.pending) return
    this.pending.reject(new Error('Gate cancelled'))
    this.pending = undefined
    this.onGateClose?.()
  }

  get isPending() {
    return Boolean(this.pending)
  }

  toHandlers(): GateHandlers {
    return {
      accept: () => this.respond({ action: 'accept' }),
      retrace: (nudge) => this.respond({ action: 'retrace', nudge }),
      fixCharacter: (character) => this.respond({ action: 'fixCharacter', character }),
      adjust: (nudge) => this.respond({ action: 'adjust', nudge }),
    }
  }
}