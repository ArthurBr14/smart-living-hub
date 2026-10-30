import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Search, RefreshCw, LogOut, Users, ShoppingBag, ArrowLeft, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { emptyFilters, filterReservations, managementOptions, type Filters } from '@/lib/reservations'
import { formatBRL } from '@/components/PreSale'
const statuses = { reservado: 'Reservado', contatado: 'Contatado', vendido: 'Vendido', cancelado: 'Cancelado' }
export const Route = createFileRoute('/_authenticated/gestao')({
  head: () => ({ meta: [{ title: 'Clientes e vendas — NEXTLAB' }, { name: 'description', content: 'Gestão privada de clientes, reservas e vendas NEXTLAB.' }, { property: 'og:title', content: 'Clientes e vendas — NEXTLAB' }, { property: 'og:description', content: 'Área administrativa privada NEXTLAB.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managementOptions),
  errorComponent: ({ error, reset }) => <main className="management-page"><h1>Não foi possível carregar</h1><p>{error instanceof Error ? error.message : 'Tente novamente.'}</p><Button onClick={reset}>Tentar novamente</Button></main>,
  component: Management,
})
function Management() {
  const { data } = useSuspenseQuery(managementOptions)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [tab, setTab] = useState<'reservas' | 'clientes'>('reservas')
  const [page, setPage] = useState(0)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [profileName, setProfileName] = useState(data.profile)
  const rows = useMemo(() => filterReservations(data.rows, filters), [data.rows, filters])
  const clients = useMemo(() => Array.from(new Map(rows.map(row => [row.email, row])).values()), [rows])
  const list = tab === 'reservas' ? rows : clients
  const pages = Math.max(1, Math.ceil(list.length / 20))
  const visible = list.slice(page * 20, page * 20 + 20)
  const change = (key: keyof Filters, value: string) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(0) }
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }) }
  async function status(id: string, value: string) {
    setBusy(true); setMessage('')
    const { error } = await supabase.from('reservations').update({ status: value }).eq('id', id).select('id').single()
    if (error) setMessage('Não foi possível atualizar a reserva.')
    else await queryClient.invalidateQueries({ queryKey: ['management'] })
    setBusy(false)
  }
  async function saveProfile() {
    setBusy(true)
    const { error } = await supabase.from('profiles').upsert({ id: data.userId, full_name: profileName.trim() })
    setMessage(error ? 'Não foi possível salvar seu perfil.' : 'Perfil atualizado.')
    setBusy(false)
  }
  return <main className="management-page">
    <header className="management-header"><Button asChild variant="ghost"><Link to="/"><ArrowLeft /> NEXTLAB</Link></Button><Button variant="outline" onClick={signOut}><LogOut /> Sair</Button></header>
    <div className="management-title"><div><span className="eyebrow muted-eyebrow">/ ÁREA PRIVADA</span><h1>Clientes e vendas</h1></div><Button variant="outline" disabled={busy} onClick={() => queryClient.invalidateQueries({ queryKey: ['management'] })}><RefreshCw /> Atualizar</Button></div>
    {!data.allowed ? <section className="management-empty"><h2>Acesso não autorizado</h2><p>Esta conta não tem permissão para consultar clientes e vendas.</p></section> : <>
      <div className="management-stats"><div><Users /><span>Clientes encontrados</span><strong>{clients.length}</strong></div><div><ShoppingBag /><span>Reservas encontradas</span><strong>{rows.length}</strong></div><div><span>Valor reservado</span><strong>{formatBRL(rows.filter(r => r.status !== 'cancelado' && r.status !== 'vendido').reduce((sum, r) => sum + r.quantity * r.unit_price, 0))}</strong></div><div><span>Vendas confirmadas</span><strong>{formatBRL(rows.filter(r => r.status === 'vendido').reduce((sum, r) => sum + r.quantity * r.unit_price, 0))}</strong></div></div>
      <div className="management-tabs"><Button variant={tab === 'reservas' ? 'default' : 'ghost'} onClick={() => { setTab('reservas'); setPage(0) }}><ShoppingBag /> Reservas e vendas</Button><Button variant={tab === 'clientes' ? 'default' : 'ghost'} onClick={() => { setTab('clientes'); setPage(0) }}><Users /> Clientes</Button></div>
      <section className="management-filters" aria-label="Filtros"><div><Label htmlFor="search">Cliente ou código</Label><div className="management-search"><Search size={18} /><Input id="search" value={filters.search} onChange={e => change('search', e.target.value)} placeholder="Nome, e-mail, telefone ou código" /></div></div><div><Label htmlFor="product-filter">Produto</Label><select id="product-filter" value={filters.product} onChange={e => change('product', e.target.value)}><option value="">Todos os produtos</option><option value="01">Modu-Desk</option><option value="02">Spider Flex</option><option value="03">Tênis McFly</option></select></div><div><Label htmlFor="status-filter">Situação</Label><select id="status-filter" value={filters.status} onChange={e => change('status', e.target.value)}><option value="">Todas as situações</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div><Label htmlFor="date-from">De</Label><Input id="date-from" type="date" value={filters.from} max={filters.to || undefined} onChange={e => change('from', e.target.value)} /></div><div><Label htmlFor="date-to">Até</Label><Input id="date-to" type="date" value={filters.to} min={filters.from || undefined} onChange={e => change('to', e.target.value)} /></div><Button variant="ghost" size="icon" aria-label="Limpar filtros" title="Limpar filtros" onClick={() => { setFilters(emptyFilters); setPage(0) }}><X /></Button></section>
      {message && <p role="status">{message}</p>}
      <div className="management-table"><table><thead><tr><th>Cliente</th><th>Contato</th>{tab === 'reservas' ? <><th>Produto / código</th><th>Quantidade</th><th>Total</th><th>Situação</th><th>Data</th></> : <><th>Reservas</th><th>Valor reservado</th></>}</tr></thead><tbody>{visible.map(row => <tr key={tab === 'reservas' ? row.id : row.email}><td><strong>{row.customer_name}</strong></td><td><a href={`mailto:${row.email}`}>{row.email}</a><a href={`tel:${row.phone.replace(/\D/g, '')}`}>{row.phone}</a></td>{tab === 'reservas' ? <><td>{row.product_name}<small>{row.code}</small></td><td>{row.quantity}</td><td>{formatBRL(row.quantity * row.unit_price)}</td><td><select aria-label={`Situação ${row.code}`} value={row.status} disabled={busy} onChange={e => status(row.id, e.target.value)}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></td><td>{new Date(row.created_at).toLocaleDateString('pt-BR')}</td></> : <><td>{rows.filter(r => r.email === row.email).length}</td><td>{formatBRL(rows.filter(r => r.email === row.email && r.status !== 'cancelado').reduce((sum, r) => sum + r.quantity * r.unit_price, 0))}</td></>}</tr>)}</tbody></table>{!list.length && <div className="management-empty"><Users /><h2>Nenhum registro encontrado</h2><p>{data.rows.length ? 'Nenhum resultado para os filtros escolhidos.' : 'As novas reservas aparecerão aqui.'}</p></div>}</div>
      <footer className="management-pagination"><span>{list.length} registros · Página {page + 1} de {pages}</span><div><Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button><Button variant="outline" disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)}>Próxima</Button></div></footer>
      <section className="management-profile"><Label htmlFor="profile-name">Seu nome</Label><Input id="profile-name" maxLength={100} value={profileName} onChange={e => setProfileName(e.target.value)} /><Button variant="outline" disabled={busy} onClick={saveProfile}><Save /> Salvar perfil</Button></section>
    </>}
  </main>
}
