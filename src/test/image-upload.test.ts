import { describe, it, expect } from 'vitest'
import { detectImageType } from '@/lib/image-upload'
describe('detectImageType', () => {
  it('accepts a real JPEG', () => expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpeg'))
  it('accepts a real PNG', () => expect(detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('png'))
  it('rejects a program renamed to .jpg', () => expect(detectImageType(new TextEncoder().encode('MZ\x90\x00exe-file'))).toBeNull())
  it('rejects an SVG/script file', () => expect(detectImageType(new TextEncoder().encode('<svg onload=x>'))).toBeNull())
})
