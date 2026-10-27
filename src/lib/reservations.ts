import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type Filters = { search: string; product: string; status: string; from: string; to: string }
export const emptyFilters: Filters = { search: '', product: '', status: '', from: '', to: '' }
export function filterReservations(rows: Reservation[], filters: Filters) {
  const term = filters.search.trim().toLocaleLowerCase('pt-BR')
  return rows.filter(row => {
    const day = new Date(row.created_at).toLocaleDateString('sv-SE')
    return (!term || [row.customer_name, row.email, row.phone, row.code].some(value => value.toLocaleLowerCase('pt-BR').includes(term))) &&
      (!filters.product || row.product_id === filters.product) && (!filters.status || row.status === filters.status) &&
      (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to)
  })
}
export async function submitReservation(input: { productId: string; name: string; email: string; phone: string; qty: number }) {
  const { data, error } = await supabase.rpc('reserve_product', { p_product_id: input.productId, p_name: input.name, p_email: input.email, p_phone: input.phone, p_quantity: input.qty })
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Não foi possível registrar a reserva.')
  return data
}
export const managementOptions = {
  queryKey: ['management'],
  queryFn: async () => {
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData.user) throw new Error('Entre novamente para continuar.')
    const { data: admin, error: roleError } = await supabase.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' })
    if (roleError) throw new Error(roleError.message)
    if (!admin) return { allowed: false, rows: [] as Reservation[], profile: '', userId: userData.user.id }
    const rows: Reservation[] = []
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false }).order('id').range(offset, offset + 999)
      if (error) throw new Error(error.message)
      rows.push(...data)
      if (data.length < 1000) break
    }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('full_name').eq('id', userData.user.id).maybeSingle()
    if (profileError) throw new Error(profileError.message)
    return { allowed: true, rows, profile: profile?.full_name || '', userId: userData.user.id }
  },
}
