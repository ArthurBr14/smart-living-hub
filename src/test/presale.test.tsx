import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PreSaleDialog } from '@/components/PreSale'

afterEach(() => { cleanup(); localStorage.clear() })

describe('Product-specific reservations', () => {
  it('handles a missing product and recovers when a selection arrives', () => {
    const { rerender } = render(<PreSaleDialog onClose={() => {}} />)
    expect(localStorage.getItem('nextlab-presale')).toBeNull()
    const product = { id: '02', name: 'Spider Flex', image: '/assets/spider-flex.jpg', price: 399, presalePrice: 299 }
    rerender(<PreSaleDialog product={product} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Arthur Silva' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'arthur@example.com' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11912345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pré-venda' }))
    expect(JSON.parse(localStorage.getItem('nextlab-presale') || '[]')[0].product).toBe('Spider Flex')
    rerender(<PreSaleDialog product={null} onClose={() => {}} />)
  })
  it.each([
    { id: '01', name: 'Modu-Desk', image: '/assets/modu-desk.jpg', price: 1499, presalePrice: 1199 },
    { id: '02', name: 'Spider Flex', image: '/assets/spider-flex.jpg', price: 399, presalePrice: 299 },
    { id: '03', name: 'Tênis McFly', image: '/assets/mcfly.jpg', price: 899, presalePrice: 699 },
  ])('reserves only the selected $name', product => {
    render(<PreSaleDialog product={product} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Arthur Silva' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'arthur@example.com' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11912345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pré-venda' }))
    const reservations = JSON.parse(localStorage.getItem('nextlab-presale') || '[]')
    expect(reservations).toHaveLength(1)
    expect(reservations[0].product).toBe(product.name)
    expect(reservations[0].code).toMatch(new RegExp(`^NX-${product.id}-`))
    expect(reservations[0].qty).toBe(1)
  })
})