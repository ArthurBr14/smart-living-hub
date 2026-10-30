import { useState } from 'react'
import { CheckCircle2, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { submitReservation } from '@/lib/reservations'

export type PreSaleProduct = { id: string; name: string; image: string; price: number; presalePrice: number }

export const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

type Errors = { name?: string; email?: string; phone?: string }

export function validatePreSale(f: { name: string; email: string; phone: string }) {
  const e: Errors = {}
  const name = f.name.trim()
  if (name.split(/\s+/).length < 2 || name.length < 5) e.name = 'Informe seu nome completo (nome e sobrenome).'
  else if (name.length > 100) e.name = 'Nome muito longo.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()) || f.email.length > 255) e.email = 'Informe um e-mail válido.'
  const digits = f.phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 11) e.phone = 'Informe um telefone com DDD.'
  return e
}

export function PreSaleDialog({ product, onClose }: { product?: PreSaleProduct | null; onClose: () => void }) {
  // A preview refresh can briefly retain a caller with the previous props.
  // Never mount the form until there is a selected product.
  if (!product) return null
  return <ProductReservation key={product.id} product={product} onClose={onClose} />
}

function ProductReservation({ product, onClose }: { product: PreSaleProduct; onClose: () => void }) {
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const close = onClose

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validatePreSale(form)
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    setSubmitError('')
    try {
      const code = await submitReservation({ productId: product.id, qty, ...form })
      setDone(code)
    } catch (error) { setSubmitError(error instanceof Error ? error.message : 'Não foi possível registrar a reserva. Tente novamente.') }
    finally { setBusy(false) }
  }

  return (
    <Dialog open onOpenChange={o => { if (!o) close() }}>
      <DialogContent className="presale-dialog">
        {done ? (
          <div className="presale-success">
            <CheckCircle2 size={44} />
            <DialogTitle className="dialog-title">Reserva confirmada!</DialogTitle>
            <DialogDescription>Obrigado, {form.name.trim().split(' ')[0]}. Sua pré-venda de {qty}× {product.name} foi registrada. Entraremos em contato por {form.email.trim()}.</DialogDescription>
            <p className="presale-code">Código da reserva: <strong>{done}</strong></p>
            <Button onClick={close}>Continuar explorando</Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="presale-form">
            <span className="eyebrow">/ PRÉ-VENDA EXCLUSIVA</span>
            <DialogTitle className="dialog-title">Reserve seu {product.name}</DialogTitle>
            <DialogDescription>Reserve agora com preço de lançamento. Nenhum pagamento é cobrado neste momento.</DialogDescription>

            <div className="presale-product">
              <img src={product.image} alt={product.name} width={88} height={88} />
              <div><strong>{product.name}</strong><small>{formatBRL(product.presalePrice)} / unidade</small></div>
            </div>

            <div className="presale-qty">
              <span>Quantidade</span>
              <div>
                <Button type="button" variant="outline" size="icon" aria-label="Diminuir" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus /></Button>
                <strong>{qty}</strong>
                <Button type="button" variant="outline" size="icon" aria-label="Aumentar" onClick={() => setQty(q => Math.min(5, q + 1))}><Plus /></Button>
              </div>
            </div>

            <div className="presale-field">
              <Label htmlFor="ps-name">Nome completo</Label>
              <Input id="ps-name" maxLength={100} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Arthur Silva" />
              {errors.name && <p className="presale-error">{errors.name}</p>}
            </div>
            <div className="presale-field">
              <Label htmlFor="ps-email">E-mail</Label>
              <Input id="ps-email" type="email" maxLength={255} autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" />
              {errors.email && <p className="presale-error">{errors.email}</p>}
            </div>
            <div className="presale-field">
              <Label htmlFor="ps-phone">Telefone</Label>
              <Input id="ps-phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })} placeholder="(11) 91234-5678" />
              {errors.phone && <p className="presale-error">{errors.phone}</p>}
            </div>

            <div className="presale-total">
              <div><small>De {formatBRL(product.price * qty)}</small><strong>{formatBRL(product.presalePrice * qty)}</strong></div>
              <span>Economia de {formatBRL((product.price - product.presalePrice) * qty)}</span>
            </div>
            {submitError && <p className="presale-error" role="alert">{submitError}</p>}
            <Button type="submit" size="lg" disabled={busy}>{busy ? 'Registrando…' : 'Confirmar pré-venda'}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
