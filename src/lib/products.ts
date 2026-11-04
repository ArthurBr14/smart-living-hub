import { supabase } from '@/integrations/supabase/client'

export type Feature = { title: string; text: string }
export type Product = { id: string; name: string; category: string; caption: string; description: string; image: string; price: number; presalePrice: number; tags: string[]; features: Feature[]; active: boolean; sortOrder: number }

const base = import.meta.env.BASE_URL
export const resolveImage = (url: string) => !url ? `${base}assets/modu-desk.jpg` : /^(https?:|data:)/.test(url) ? url : `${base}${url.replace(/^\//, '')}`

const staticFeatures: Record<string, Feature[]> = {
  '01': [
    { title: 'Click-N-Stack', text: 'Módulos independentes com travas magnéticas para expandir sua organização na vertical ou na horizontal.' },
    { title: 'Um lugar para cada ideia', text: 'Divisórias em trilhos ajustáveis para documentos A4, A5, DL e envelopes, com nichos para canetas e pequenos materiais.' },
    { title: 'Mais espaço, mais possibilidades', text: 'O suporte superior integrado eleva seu monitor ou notebook e libera espaço na mesa.' },
    { title: 'E-Ink Touch + Find-My-Doc', text: 'Etiquetas digitais na tela frontal e documentos mapeados pelo app via Wi-Fi ou Bluetooth. Ao buscar um arquivo, o LED indica a gaveta correspondente.' },
  ],
  '02': [
    { title: 'Um ajuste que é só seu', text: 'O tecido inteligente biomimético se adapta às curvas e ao tamanho do corpo de quem veste.' },
    { title: 'Tecnologia para a postura', text: 'Sistema de compressão ergonômica concebido para auxiliar a postura em tempo real.' },
    { title: 'Um herói. Diferentes versões.', text: 'O conceito de tecido reativo permite alternar cores por temperatura ou comando no app, inspirado nos uniformes Clássico, Black Suit e Stark.' },
  ],
  '03': [
    { title: 'Um toque para ajustar', text: 'Bata um pé no outro para ativar o sistema de ajuste automático ao tamanho dos seus pés.' },
    { title: 'Cada pé, um ajuste', text: 'As palmilhas se adaptam individualmente, respeitando as diferenças entre seus pés.' },
    { title: 'Da tela para a sua imaginação', text: 'Um conceito inspirado nos tênis de Marty McFly em De Volta para o Futuro, unindo nostalgia e tecnologia.' },
  ],
}

export const fallbackProducts: Product[] = [
  { id: '01', name: 'Modu-Desk', category: 'SMART WORKSPACE', price: 1499, presalePrice: 1199, caption: 'Seu espaço. Mais inteligente.', description: 'Organização modular que acompanha suas ideias. Conectada, intuitiva e feita para evoluir com você.', image: resolveImage('assets/modu-desk.jpg'), tags: ['Modular', 'E-Ink Touch', 'Conectado'], features: staticFeatures['01'], active: true, sortOrder: 1 },
  { id: '02', name: 'Spider Flex', category: 'SMART WEAR', price: 399, presalePrice: 299, caption: 'Vista sua próxima versão.', description: 'O universo do seu herói encontra o tecido inteligente. Estilo que se transforma e se adapta a você.', image: resolveImage('assets/spider-flex.jpg'), tags: ['Biomimético', 'Postura', 'Color-shift'], features: staticFeatures['02'], active: true, sortOrder: 2 },
  { id: '03', name: 'Tênis McFly', category: 'SMART MOVEMENT', price: 899, presalePrice: 699, caption: 'O futuro está nos seus pés.', description: 'Inspirado no cinema. Projetado para o seu movimento. Um ajuste preciso, com um simples toque entre os pés.', image: resolveImage('assets/mcfly.jpg'), tags: ['Autoajuste', 'Ergonômico', 'Adaptável'], features: staticFeatures['03'], active: true, sortOrder: 3 },
]

type Row = { id: string; name: string; category: string; caption: string; description: string; image_url: string; price: number; presale_price: number; tags: string[]; features: unknown; active: boolean; sort_order: number }
export function fromRow(r: Row): Product {
  const features = Array.isArray(r.features) && r.features.length ? (r.features as Feature[]) : staticFeatures[r.id] ?? []
  return { id: r.id, name: r.name, category: r.category, caption: r.caption, description: r.description, image: resolveImage(r.image_url), price: Number(r.price), presalePrice: Number(r.presale_price), tags: r.tags, features, active: r.active, sortOrder: r.sort_order }
}

export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*').order('sort_order').order('created_at')
  if (error) throw new Error(error.message)
  return data.map(fromRow)
}
export const productsQuery = { queryKey: ['products'], queryFn: fetchProducts }

/** Validates admin price input; returns an error message or null. */
export function validatePrices(price: number, presalePrice: number) {
  if (!Number.isFinite(price) || price <= 0) return 'Informe um preço normal maior que zero.'
  if (!Number.isFinite(presalePrice) || presalePrice <= 0) return 'Informe um preço de pré-venda maior que zero.'
  if (presalePrice > price) return 'O preço de pré-venda não pode ser maior que o preço normal.'
  return null
}
