import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
export const Route = createFileRoute('/reset-password')({
 head: () => ({ meta: [{ title: 'Redefinir senha — NEXTLAB' }, { name: 'description', content: 'Redefina sua senha de acesso à NEXTLAB.' }, { property: 'og:title', content: 'Redefinir senha — NEXTLAB' }, { property: 'og:description', content: 'Recuperação de acesso à NEXTLAB.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
 component: ResetPassword,
})
function ResetPassword() {
 const [valid, setValid] = useState(false); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
 useEffect(() => { const recovery = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'; supabase.auth.getUser().then(({ data }) => setValid(recovery && !!data.user)) }, [])
 async function submit(e: React.FormEvent) { e.preventDefault(); if (password !== confirm) { setMessage('As senhas não coincidem.'); return }; setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? error.message : 'Senha atualizada.'); setBusy(false) }
 return <main className="auth-page"><section className="auth-panel"><h1>Redefinir senha</h1>{valid ? <form onSubmit={submit}><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /><Label htmlFor="confirm-password">Confirmar senha</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} /><Button disabled={busy}>Salvar senha</Button></form> : <p>Abra o link de recuperação enviado ao seu e-mail.</p>}{message && <p role="status">{message}</p>}<Button asChild variant="link"><Link to="/auth">Voltar ao login</Link></Button></section></main>
}
