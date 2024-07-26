import { createHelia } from 'helia'
import { strings } from '@helia/strings'
import { json } from '@helia/json'
export const helia = await createHelia()
export const s = strings(helia)
export const j = json(helia)
