import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LogIn, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { lovable } from '@/integrations/lovable/index'
import '@lovable.dev/cloud-auth-js/styles.css'
export const Route = createFileRoute('/auth')({
 head: () => ({ meta: [{ title: 'Acesso privado — NEXTLAB' }, { name: 'description', content: 'Entre na área privada de clientes e vendas NEXTLAB.' }, { property: 'og:title', content: 'Acesso privado — NEXTLAB' }, { property: 'og:description', content: 'Acesso à gestão NEXTLAB.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
 component: Auth,
})
function Auth() {
 const navigate = useNavigate()
 const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
 const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('')
 const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
 useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: '/gestao', replace: true }) }) }, [navigate])
 async function submit(e: React.FormEvent) {
  e.preventDefault(); setBusy(true); setMessage('')
  try {
   if (mode === 'reset') {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password` })
    if (error) throw error
    setMessage('Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.')
   } else if (mode === 'signup') {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}auth` } })
    if (error) throw error
    setMessage('Confira seu e-mail para confirmar o cadastro. Criar uma conta não concede acesso aos clientes.')
   } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await navigate({ to: '/gestao' })
   }
  } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.') }
  finally { setBusy(false) }
 }
 async function social(provider: 'google' | 'lovable') {
  setBusy(true); setMessage('')
  const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}${import.meta.env.BASE_URL}auth` })
  if (result.error) setMessage(result.error.message)
  else if (!result.redirected) await navigate({ to: '/gestao' })
  setBusy(false)
 }
 return <main className="auth-page"><Button asChild variant="ghost"><Link to="/"><ArrowLeft /> NEXTLAB</Link></Button><section className="auth-panel"><span className="eyebrow muted-eyebrow">/ ÁREA PRIVADA</span><h1>{mode === 'signup' ? 'Crie sua conta' : mode === 'reset' ? 'Recuperar senha' : 'Bem-vindo de volta'}</h1><form onSubmit={submit}>{mode === 'signup' && <div><Label htmlFor="auth-name">Nome completo</Label><Input id="auth-name" autoComplete="name" maxLength={100} required value={name} onChange={e => setName(e.target.value)} /></div>}<div><Label htmlFor="auth-email">E-mail</Label><Input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>{mode !== 'reset' && <div><Label htmlFor="auth-password">Senha</Label><Input id="auth-password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></div>}<Button type="submit" disabled={busy}><LogIn />{busy ? 'Aguarde…' : mode === 'signup' ? 'Criar conta' : mode === 'reset' ? 'Enviar link' : 'Entrar'}</Button></form>{message && <p role="status">{message}</p>}{mode !== 'reset' && <div className="auth-social"><Button variant="outline" disabled={busy} onClick={() => social('google')}>Continuar com Google</Button><Button className="lovable-auth-button" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button></div>}<div className="auth-links"><Button variant="link" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setMessage('') }}>{mode === 'signup' ? 'Já tenho uma conta' : 'Criar conta'}</Button><Button variant="link" onClick={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setMessage('') }}>{mode === 'reset' ? 'Voltar ao login' : 'Esqueci minha senha'}</Button></div></section></main>
}
