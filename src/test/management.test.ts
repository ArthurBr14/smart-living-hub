import { describe, expect, it } from 'vitest'
import { emptyFilters, filterReservations, type Reservation } from '@/lib/reservations'
const base: Reservation = { id: 'a', code: 'NX-A', product_id: '01', product_name: 'Modu-Desk', customer_name: 'Arthur Silva', email: 'arthur@example.com', phone: '(11) 91234-5678', quantity: 1, unit_price: 1199, status: 'reservado', created_at: '2026-10-24T12:00:00Z' }
const rows = [base, { ...base, id: 'b', code: 'NX-B', product_id: '02', customer_name: 'Maria Souza', email: 'maria@example.com', status: 'vendido', created_at: '2026-10-25T12:00:00Z' }]
describe('Management filters', () => {
 it('filters customers by name', () => expect(filterReservations(rows, { ...emptyFilters, search: 'maria' }).map(r => r.id)).toEqual(['b']))
 it('filters sales by product', () => expect(filterReservations(rows, { ...emptyFilters, product: '01' }).map(r => r.id)).toEqual(['a']))
 it('filters sales by status', () => expect(filterReservations(rows, { ...emptyFilters, status: 'vendido' }).map(r => r.id)).toEqual(['b']))
 it('filters by inclusive date range', () => expect(filterReservations(rows, { ...emptyFilters, from: '2026-10-24', to: '2026-10-24' }).map(r => r.id)).toEqual(['a']))
})
