import { describe, expect, it } from 'vitest'
import { GateController } from '@/agent/gateController'

describe('GateController', () => {
  it('resolves when human accepts', async () => {
    const gate = new GateController()
    const opened: string[] = []

    gate.onGateOpen = (req) => opened.push(req.stage)

    const pending = gate.waitForHuman({
      stage: 'trace',
      summary: 'Review trace',
      sourcePreviewUrl: 'blob:test',
      proposedCharacter: 'A',
    })

    gate.respond({ action: 'accept' })
    const result = await pending

    expect(result.action).toBe('accept')
    expect(opened).toEqual(['trace'])
    expect(gate.isPending).toBe(false)
  })

  it('returns retrace nudge to agent', async () => {
    const gate = new GateController()
    const pending = gate.waitForHuman({
      stage: 'trace',
      summary: 'x',
      sourcePreviewUrl: 'blob:test',
      proposedCharacter: 'A',
    })

    gate.respond({ action: 'retrace', nudge: 'sharper corners' })
    const result = await pending

    expect(result).toEqual({ action: 'retrace', nudge: 'sharper corners' })
  })
})