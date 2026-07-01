import type { ToolResultOutput } from '@ai-sdk/provider-utils'
import { dataUrlToBase64 } from '@/lib/dataUrl'

export function jsonWithPreview(value: unknown, previewPng?: string): ToolResultOutput {
  if (!previewPng) {
    return { type: 'json', value: value as Extract<ToolResultOutput, { type: 'json' }>['value'] }
  }

  return {
    type: 'content',
    value: [
      { type: 'text', text: JSON.stringify(value, null, 2) },
      {
        type: 'image-data',
        data: dataUrlToBase64(previewPng),
        mediaType: 'image/png',
      },
    ],
  }
}