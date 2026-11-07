export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Detects the real image type from the file's first bytes; returns null when it is not a JPEG, PNG or WebP. */
export function detectImageType(b: Uint8Array): 'jpeg' | 'png' | 'webp' | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg'
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return 'png'
  if (b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP') return 'webp'
  return null
}

/** Checks a photo and redraws it as a clean JPEG, discarding any hidden content. Returns a data URL or throws a user-facing message. */
export async function sanitizeImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error('A foto deve ter no máximo 5 MB.')
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (!detectImageType(head)) throw new Error('Arquivo recusado: não é uma foto JPG, PNG ou WebP válida.')
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { throw new Error('Arquivo recusado: a foto está corrompida ou é suspeita.') }
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.82)
}
