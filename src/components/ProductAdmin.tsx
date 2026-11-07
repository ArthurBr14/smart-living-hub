import { useState } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { Plus, Save, Eye, EyeOff, Upload } from 'lucide-react'
import { sanitizeImage } from '@/lib/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { productsQuery, validatePrices, type Product } from '@/lib/products'
import { formatBRL } from '@/components/PreSale'

function PriceRow({ product, onSaved }: { product: Product; onSaved: (msg: string) => void }) {
  const [price, setPrice] = useState(String(product.price))
  const [presale, setPresale] = useState(String(product.presalePrice))
  const [busy, setBusy] = useState(false)
  async function save(extra?: { active: boolean }) {
    const p = Number(price.replace(',', '.')), s = Number(presale.replace(',', '.'))
    const err = validatePrices(p, s)
    if (err) return onSaved(err)
    setBusy(true)
    const { error } = await supabase.from('products').update({ price: p, presale_price: s, ...extra }).eq('id', product.id).select('id').single()
    setBusy(false)
    onSaved(error ? `Não foi possível salvar ${product.name}.` : `${product.name} atualizado.`)
  }
  return <tr>
    <td><img src={product.image} alt="" width={48} height={48} style={{ borderRadius: 8, objectFit: 'cover' }} /></td>
    <td><strong>{product.name}</strong><small>{product.category}{product.active ? '' : ' · oculto'}</small></td>
    <td><Input aria-label={`Preço normal ${product.name}`} inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} /></td>
    <td><Input aria-label={`Preço pré-venda ${product.name}`} inputMode="decimal" value={presale} onChange={e => setPresale(e.target.value)} /></td>
    <td><Button size="sm" disabled={busy} onClick={() => save()}><Save /> Salvar</Button> <Button size="sm" variant="ghost" disabled={busy} onClick={() => save({ active: !product.active })}>{product.active ? <><EyeOff /> Ocultar</> : <><Eye /> Mostrar</>}</Button></td>
  </tr>
}

const empty = { name: '', category: '', caption: '', description: '', image: '', price: '', presale: '', tags: '' }

export function ProductAdmin() {
  const queryClient = useQueryClient()
  const { data: products = [] } = useQuery(productsQuery)
  const [form, setForm] = useState(empty)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = (msg: string) => { setMessage(msg); queryClient.invalidateQueries({ queryKey: ['products'] }) }
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  async function add(e: React.FormEvent) {
    e.preventDefault()
    const p = Number(form.price.replace(',', '.')), s = Number(form.presale.replace(',', '.'))
    if (form.name.trim().length < 2) return setMessage('Informe o nome do produto.')
    const err = validatePrices(p, s); if (err) return setMessage(err)
    if (form.image && !form.image.startsWith('data:image/jpeg;base64,') && !/^https?:\/\//.test(form.image.trim())) return setMessage('O link da foto deve começar com https://')
    const next = String(Math.max(0, ...products.map(x => Number(x.id) || 0)) + 1).padStart(2, '0')
    setBusy(true)
    const { error } = await supabase.from('products').insert({ id: next, name: form.name.trim(), category: form.category.trim().toUpperCase() || 'NOVIDADE', caption: form.caption.trim(), description: form.description.trim(), image_url: form.image.trim(), price: p, presale_price: s, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5), sort_order: Number(next) })
    setBusy(false)
    if (error) return setMessage('Não foi possível adicionar o produto.')
    setForm(empty); refresh(`${form.name.trim()} adicionado à vitrine.`)
  }
  return <section className="management-products">
    {message && <p role="status">{message}</p>}
    <div className="management-table"><table><thead><tr><th></th><th>Produto</th><th>Preço normal (R$)</th><th>Pré-venda (R$)</th><th>Ações</th></tr></thead>
      <tbody>{products.map(p => <PriceRow key={`${p.id}-${p.price}-${p.presalePrice}-${p.active}`} product={p} onSaved={refresh} />)}</tbody></table></div>
    <form className="management-product-form" onSubmit={add}>
      <h2><Plus /> Adicionar produto</h2>
      <div><Label htmlFor="np-name">Nome</Label><Input id="np-name" maxLength={80} value={form.name} onChange={set('name')} /></div>
      <div><Label htmlFor="np-cat">Categoria</Label><Input id="np-cat" maxLength={40} placeholder="SMART HOME" value={form.category} onChange={set('category')} /></div>
      <div><Label htmlFor="np-price">Preço normal (R$)</Label><Input id="np-price" inputMode="decimal" value={form.price} onChange={set('price')} /></div>
      <div><Label htmlFor="np-presale">Preço pré-venda (R$)</Label><Input id="np-presale" inputMode="decimal" value={form.presale} onChange={set('presale')} /></div>
      <div><Label htmlFor="np-caption">Frase de destaque</Label><Input id="np-caption" maxLength={120} value={form.caption} onChange={set('caption')} /></div>
      <div><Label htmlFor="np-image">Link da foto (https://…)</Label><Input id="np-image" maxLength={500} value={form.image.startsWith('data:') ? '' : form.image} placeholder={form.image.startsWith('data:') ? 'Foto enviada do computador' : ''} onChange={set('image')} /></div>
      <div><Label htmlFor="np-file">Ou envie uma foto</Label><Button type="button" variant="outline" disabled={busy} onClick={() => document.getElementById('np-file')?.click()}><Upload /> Escolher foto</Button>
        <input id="np-file" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={async e => {
          const file = e.target.files?.[0]; e.target.value = ''
          if (!file) return
          setBusy(true); setMessage('Verificando a foto…')
          try { const url = await sanitizeImage(file); setForm(f => ({ ...f, image: url })); setMessage('Foto verificada e aprovada.') }
          catch (err) { setMessage(err instanceof Error ? err.message : 'Foto recusada.') }
          setBusy(false)
        }} />
        {form.image.startsWith('data:') && <img src={form.image} alt="Prévia da foto" width={64} height={64} style={{ borderRadius: 8, objectFit: 'cover', marginTop: 8 }} />}</div>
      <div className="wide"><Label htmlFor="np-desc">Descrição</Label><textarea id="np-desc" maxLength={500} rows={3} value={form.description} onChange={set('description')} /></div>
      <div className="wide"><Label htmlFor="np-tags">Etiquetas (separadas por vírgula)</Label><Input id="np-tags" maxLength={150} value={form.tags} onChange={set('tags')} /></div>
      {form.price && form.presale && <p className="wide">Na vitrine: <s>{formatBRL(Number(form.price.replace(',', '.')) || 0)}</s> <strong>{formatBRL(Number(form.presale.replace(',', '.')) || 0)}</strong></p>}
      <Button type="submit" disabled={busy}><Plus /> Adicionar à vitrine</Button>
    </form>
  </section>
}
