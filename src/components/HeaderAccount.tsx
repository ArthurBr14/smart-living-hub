import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LayoutDashboard, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/integrations/supabase/client'
import { accountInitials, accountName, useSession } from '@/hooks/use-session'

/**
 * Header sign-in affordance. Always rendered from the live session: signed-out
 * visitors get "Entrar", signed-in ones get their account menu with a way out.
 */
export function HeaderAccount() {
  const { user, loading } = useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: isAdmin = false } = useQuery({
    queryKey: ['account-role', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('has_role', { _user_id: user!.id, _role: 'admin' })
      return !error && !!data
    },
  })

  async function signOut() {
    await queryClient.cancelQueries()
    queryClient.clear()
    await supabase.auth.signOut()
    navigate({ to: '/', replace: true })
  }

  if (loading) return <span className="header-account-skeleton" aria-hidden />

  if (!user) {
    return (
      <Button asChild variant="outline" className="header-account">
        <Link to="/auth" search={{ next: '/' }}><LogIn /> Entrar</Link>
      </Button>
    )
  }

  const name = accountName(user)
  const first = name.includes('@') ? name.split('@')[0] : name.split(/\s+/)[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="header-account" aria-label={`Conta de ${name}`}>
          <span className="header-account-avatar" aria-hidden>{accountInitials(name)}</span>
          <span className="header-account-name">{first}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="header-account-menu" align="end">
        <DropdownMenuLabel className="header-account-email">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/gestao"><LayoutDashboard /> Área de gestão</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={signOut}><LogOut /> Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
