import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { isRecoveryUrl } from '@/lib/recovery'

export const Route = createFileRoute('/reset-password')({
 head: () => ({ meta: [{ title: 'Redefinir senha — NEXTLAB' }, { name: 'description', content: 'Defina uma senha nova para voltar à área privada da NEXTLAB.' }, { property: 'og:title', content: 'Redefinir senha — NEXTLAB' }, { property: 'og:description', content: 'Recuperação de acesso à NEXTLAB.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
 component: ResetPassword,
})

// Read the URL once, before the auth client consumes ?code= and cleans the address bar.
const openedAsRecovery = typeof window !== 'undefined' && isRecoveryUrl(window.location.search, window.location.hash)

type Phase = 'checking' | 'form' | 'expired' | 'no-link'

function ResetPassword() {
 const navigate = useNavigate()
 const [phase, setPhase] = useState<Phase>('checking')
 const [password, setPassword] = useState('')
 const [confirm, setConfirm] = useState('')
 const [reveal, setReveal] = useState(false)
 const [message, setMessage] = useState('')
 const [saved, setSaved] = useState(false)
 const [busy, setBusy] = useState(false)

 useEffect(() => {
  let alive = true
  const { data: sub } = supabase.auth.onAuthStateChange(event => {
   if (event === 'PASSWORD_RECOVERY' && alive) setPhase('form')
  })
  void (async () => {
   // A PKCE link needs a moment: the code is exchanged for a session in the background.
   for (let attempt = 0; attempt < 24 && alive; attempt += 1) {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
     if (alive) setPhase(openedAsRecovery ? 'form' : 'no-link')
     return
    }
    await new Promise(resolve => setTimeout(resolve, 250))
   }
   if (alive) setPhase(openedAsRecovery ? 'expired' : 'no-link')
  })()
  return () => {
   alive = false
   sub.subscription.unsubscribe()
  }
 }, [])

 async function submit(e: React.FormEvent) {
  e.preventDefault()
  if (busy) return
  if (password.length < 8) { setMessage('A senha precisa ter pelo menos 8 caracteres.'); return }
  if (password !== confirm) { setMessage('As duas senhas não coincidem.'); return }
  setBusy(true); setMessage('')
  const { error } = await supabase.auth.updateUser({ password })
  setBusy(false)
  if (error) { setMessage(error.message); return }
  setSaved(true)
  setTimeout(() => void navigate({ to: '/gestao', replace: true }), 2200)
 }

 return <main className="auth-page">
  <Button asChild variant="ghost"><Link to="/auth"><ArrowLeft /> Voltar ao acesso</Link></Button>
  <section className="auth-panel">
   <span className="eyebrow muted-eyebrow">/ RECUPERAR ACESSO</span>
   <h1>{saved ? 'Senha atualizada' : 'Definir nova senha'}</h1>

   {phase === 'checking' && <p role="status">Confirmando o seu link de recuperação…</p>}

   {phase === 'no-link' && <>
    <p>Abra o link de recuperação que enviamos ao seu e-mail. Digitar o endereço por conta própria não libera a troca de senha.</p>
    <Button asChild variant="outline"><Link to="/auth">Solicitar um novo link</Link></Button>
   </>}

   {phase === 'expired' && <>
    <p><ShieldAlert /> Este link expirou ou já foi usado. Peça um novo e abra o mais recente que chegar.</p>
    <Button asChild variant="outline"><Link to="/auth">Solicitar um novo link</Link></Button>
   </>}

   {phase === 'form' && !saved && <form onSubmit={submit}>
    <div>
     <Label htmlFor="new-password">Nova senha</Label>
     <Input id="new-password" type={reveal ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
     <Button type="button" variant="link" onClick={() => setReveal(value => !value)}>{reveal ? 'Ocultar senha' : 'Mostrar senha'}</Button>
    </div>
    <div>
     <Label htmlFor="confirm-password">Confirmar nova senha</Label>
     <Input id="confirm-password" type={reveal ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} />
    </div>
    <Button type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar nova senha'}</Button>
    <p>Use pelo menos 8 caracteres. Depois de salvar, você volta direto para a área privada.</p>
   </form>}

   {saved && <>
    <p role="status"><CheckCircle2 /> Sua senha foi alterada. Levando você para a área privada…</p>
    <Button asChild><Link to="/gestao">Entrar na área privada</Link></Button>
   </>}

   {message && <p role="alert">{message}</p>}
  </section>
 </main>
}
