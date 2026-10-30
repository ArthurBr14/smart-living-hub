import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PreSaleDialog } from '@/components/PreSale'

const rpc = vi.hoisted(() => vi.fn().mockResolvedValue({ data: 'NX-TEST-CODE', error: null }))
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc } }))
afterEach(() => { cleanup(); localStorage.clear(); rpc.mockClear() })

describe('Product-specific reservations', () => {
  it('handles a missing product and recovers when a selection arrives', async () => {
    const { rerender } = render(<PreSaleDialog onClose={() => {}} />)
    expect(localStorage.getItem('nextlab-presale')).toBeNull()
    const product = { id: '02', name: 'Spider Flex', image: '/assets/spider-flex.jpg', price: 399, presalePrice: 299 }
    rerender(<PreSaleDialog product={product} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Arthur Silva' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'arthur@example.com' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11912345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pré-venda' }))
    await waitFor(() => expect(rpc).toHaveBeenCalledWith('reserve_product', expect.objectContaining({ p_product_id: '02' })))
    rerender(<PreSaleDialog product={null} onClose={() => {}} />)
  })
  it.each([
    { id: '01', name: 'Modu-Desk', image: '/assets/modu-desk.jpg', price: 1499, presalePrice: 1199 },
    { id: '02', name: 'Spider Flex', image: '/assets/spider-flex.jpg', price: 399, presalePrice: 299 },
    { id: '03', name: 'Tênis McFly', image: '/assets/mcfly.jpg', price: 899, presalePrice: 699 },
  ])('reserves only the selected $name', async product => {
    render(<PreSaleDialog product={product} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Arthur Silva' } })
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'arthur@example.com' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11912345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pré-venda' }))
    await waitFor(() => expect(rpc).toHaveBeenCalledWith('reserve_product', { p_product_id: product.id, p_name: 'Arthur Silva', p_email: 'arthur@example.com', p_phone: '(11) 91234-5678', p_quantity: 1 }))
    expect(localStorage.getItem('nextlab-presale')).toBeNull()
  })
})