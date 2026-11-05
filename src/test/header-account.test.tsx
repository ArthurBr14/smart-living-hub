import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HeaderAccount } from '@/components/HeaderAccount'

const getSession = vi.hoisted(() => vi.fn())
const signOut = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }))
const rpc = vi.hoisted(() => vi.fn().mockResolvedValue({ data: false, error: null }))
const navigate = vi.hoisted(() => vi.fn())

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc,
    auth: {
      getSession,
      signOut,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useNavigate: () => navigate,
}))

const user = { id: 'u1', email: 'arthur@example.com', user_metadata: { full_name: 'Arthur Braga' } }
const renderAccount = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <HeaderAccount />
    </QueryClientProvider>,
  )

afterEach(() => {
  cleanup()
  getSession.mockReset()
  rpc.mockReset().mockResolvedValue({ data: false, error: null })
  signOut.mockClear()
  navigate.mockClear()
})

describe('Header sign-in affordance', () => {
  it('offers Entrar to visitors with no session', async () => {
    getSession.mockResolvedValueOnce({ data: { session: null } })
    renderAccount()
    expect(await screen.findByText('Entrar')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Conta de/ })).toBeNull()
  })

  it('shows the signed-in account and its sign-out', async () => {
    getSession.mockResolvedValueOnce({ data: { session: { user } } })
    renderAccount()
    const trigger = await screen.findByRole('button', { name: 'Conta de Arthur Braga' })
    expect(screen.getByText('AB')).toBeTruthy()
    await userEvent.click(trigger)
    expect(await screen.findByText('arthur@example.com')).toBeTruthy()
    expect(screen.queryByText('Área de gestão')).toBeNull()
    await userEvent.click(screen.getByText('Sair'))
    await waitFor(() => expect(signOut).toHaveBeenCalled())
    expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
  })

  it('offers the management area only to admins', async () => {
    rpc.mockResolvedValueOnce({ data: true, error: null })
    getSession.mockResolvedValueOnce({ data: { session: { user } } })
    renderAccount()
    await userEvent.click(await screen.findByRole('button', { name: 'Conta de Arthur Braga' }))
    expect(await screen.findByText('Área de gestão')).toBeTruthy()
  })

  it('shortens an e-mail-only account name in the header', async () => {
    getSession.mockResolvedValueOnce({ data: { session: { user: { id: 'u2', email: 'arthurbraga59@gmail.com', user_metadata: {} } } } })
    renderAccount()
    await screen.findByRole('button', { name: 'Conta de arthurbraga59@gmail.com' })
    expect(screen.getByText('arthurbraga59')).toBeTruthy()
    expect(screen.queryByText('arthurbraga59@gmail.com')).toBeNull()
  })
})
