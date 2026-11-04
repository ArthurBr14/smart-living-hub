import { describe, it, expect } from 'vitest'
import { validatePrices } from '@/lib/products'
describe('validatePrices', () => {
  it('accepts presale lower than normal price', () => expect(validatePrices(1499, 1199)).toBeNull())
  it('rejects presale higher than normal price', () => expect(validatePrices(299, 399)).not.toBeNull())
  it('rejects zero price', () => expect(validatePrices(0, 0)).not.toBeNull())
})
