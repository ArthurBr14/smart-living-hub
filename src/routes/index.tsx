import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowUpRight, ArrowRight, Layers3, Wifi, Zap, MoveUpRight, Menu, X, Sparkles, Scan, Footprints, Monitor, Shirt, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import deskImage from '@/assets/modu-desk.jpg'
import shirtImage from '@/assets/spider-flex.jpg'
import shoeImage from '@/assets/mcfly.jpg'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'NEXTLAB — Modu-Desk, Spider Flex e McFly' },
    { name: 'description', content: 'Conheça Modu-Desk, Camiseta Spider Flex e Tênis McFly: três conceitos que conectam organização, moda e movimento à tecnologia.' },
    { property: 'og:title', content: 'NEXTLAB — O próximo passo da inovação' },
    { property: 'og:description', content: 'Explore três conceitos de produtos inteligentes: Modu-Desk, Spider Flex e McFly.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
})

const products = [
  { id: '01', name: 'Modu-Desk', category: 'SMART WORKSPACE', caption: 'Seu espaço. Mais inteligente.', description: 'Organização modular que acompanha suas ideias. Conectada, intuitiva e feita para evoluir com você.', image: deskImage, icon: Monitor, tags: ['Modular', 'E-Ink Touch', 'Conectado'], features: [
    { title: 'Click-N-Stack', text: 'Módulos independentes com travas magnéticas para expandir sua organização na vertical ou na horizontal.' },
    { title: 'Um lugar para cada ideia', text: 'Divisórias em trilhos ajustáveis para documentos A4, A5, DL e envelopes, com nichos para canetas e pequenos materiais.' },
    { title: 'Mais espaço, mais possibilidades', text: 'O suporte superior integrado eleva seu monitor ou notebook e libera espaço na mesa.' },
    { title: 'E-Ink Touch + Find-My-Doc', text: 'Etiquetas digitais na tela frontal e documentos mapeados pelo app via Wi-Fi ou Bluetooth. Ao buscar um arquivo, o LED indica a gaveta correspondente.' },
  ] },
  { id: '02', name: 'Spider Flex', category: 'SMART WEAR', caption: 'Vista sua próxima versão.', description: 'O universo do seu herói encontra o tecido inteligente. Estilo que se transforma e se adapta a você.', image: shirtImage, icon: Shirt, tags: ['Biomimético', 'Postura', 'Color-shift'], features: [
    { title: 'Um ajuste que é só seu', text: 'O tecido inteligente biomimético se adapta às curvas e ao tamanho do corpo de quem veste.' },
    { title: 'Tecnologia para a postura', text: 'Sistema de compressão ergonômica concebido para auxiliar a postura em tempo real.' },
    { title: 'Um herói. Diferentes versões.', text: 'O conceito de tecido reativo permite alternar cores por temperatura ou comando no app, inspirado nos uniformes Clássico, Black Suit e Stark.' },
  ] },
  { id: '03', name: 'Tênis McFly', category: 'SMART MOVEMENT', caption: 'O futuro está nos seus pés.', description: 'Inspirado no cinema. Projetado para o seu movimento. Um ajuste preciso, com um simples toque entre os pés.', image: shoeImage, icon: Footprints, tags: ['Autoajuste', 'Ergonômico', 'Adaptável'], features: [
    { title: 'Um toque para ajustar', text: 'Bata um pé no outro para ativar o sistema de ajuste automático ao tamanho dos seus pés.' },
    { title: 'Cada pé, um ajuste', text: 'As palmilhas se adaptam individualmente, respeitando as diferenças entre seus pés.' },
    { title: 'Da tela para a sua imaginação', text: 'Um conceito inspirado nos tênis de Marty McFly em De Volta para o Futuro, unindo nostalgia e tecnologia.' },
  ] },
]

function Index() {
  const [selected, setSelected] = useState<(typeof products)[number] | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  return (
    <main>
      <header className="site-header">
        <a href="#" className="wordmark" aria-label="NEXTLAB início"><span className="brand-symbol"><MoveUpRight /></span>NEXT<span>LAB</span><span className="brand-dot">®</span></a>
        <nav className="desktop-nav" aria-label="Navegação principal"><a href="#produtos">Produtos</a><a href="#tecnologia">Tecnologia</a><a href="#sobre">Sobre a NEXTLAB</a></nav>
        <Button asChild variant="outline" className="header-cta"><a href="#produtos">Explore o futuro <ArrowUpRight /></a></Button>
        <Button variant="ghost" size="icon" className="mobile-menu-button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
        {menuOpen && <nav className="mobile-nav" aria-label="Navegação móvel">{[['Produtos', '#produtos'], ['Tecnologia', '#tecnologia'], ['Sobre a NEXTLAB', '#sobre']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={16} /></a>)}</nav>}
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-image" src={deskImage} alt="Modu-Desk: gavetas modulares com iluminação e suporte de monitor" width={1920} height={1024} fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow"><span className="status-dot" /> IDEIAS À FRENTE DO TEMPO</span>
          <h1 id="hero-title">Produtos do futuro.<br /><span>No seu presente.</span></h1>
          <p>Transformamos o extraordinário em possibilidades.<br className="desktop-break" /> Conheça uma nova forma de trabalhar, vestir e se mover.</p>
          <div className="hero-actions"><Button asChild size="lg"><a href="#produtos">Conheça os produtos <ArrowUpRight /></a></Button><Button variant="ghost" className="hero-secondary" onClick={() => setAboutOpen(true)}>Nossa visão <ArrowRight /></Button></div>
          <div className="hero-footnote"><span className="tiny-line" /> 3 CONCEITOS. INFINITAS POSSIBILIDADES.</div>
        </div>
        <Button variant="ghost" className="hero-product-link" onClick={() => setSelected(products[0])}><span><small>EM DESTAQUE / 01</small>Modu-Desk</span><ArrowUpRight /></Button>
        <div className="hero-index"><span>01</span><i />03</div>
      </section>

      <section className="values-strip" aria-label="Princípios"><span><Layers3 /> Design que se adapta</span><span><Wifi /> Tecnologia que conecta</span><span><Zap /> Inovação que transforma</span><span className="strip-end">O PRÓXIMO JÁ COMEÇOU <ArrowUpRight /></span></section>

      <section id="produtos" className="products-section page-section">
        <div className="section-heading"><div><span className="eyebrow muted-eyebrow">/ NOSSA COLEÇÃO</span><h2>Três produtos.<br />Uma nova perspectiva.</h2></div><p>Não é apenas sobre o que vem a seguir.<br />É sobre o que você pode fazer diferente, agora.</p></div>
        <div className="product-grid">{products.map(product => <article key={product.id} className="product-card">
          <div className="product-image-wrap"><img src={product.image} alt={product.name} width={1024} height={1024} loading="lazy" /><span className="product-category">{product.category}</span><span className="product-number">/{product.id}</span><Button variant="outline" size="icon" className="product-image-action" aria-label={`Conhecer ${product.name}`} onClick={() => setSelected(product)}><ArrowUpRight /></Button></div>
          <div className="product-card-body"><div className="product-title-line"><h3>{product.name}</h3><product.icon size={20} /></div><h4>{product.caption}</h4><p>{product.description}</p><div className="tags">{product.tags.map(tag => <span key={tag}>{tag}</span>)}</div><Button variant="link" className="product-detail-button" onClick={() => setSelected(product)}>Explorar produto <ArrowUpRight /></Button></div>
        </article>)}</div>
        <p className="concept-note">Produtos conceituais em apresentação. Imagens ilustrativas; funcionalidades descritas representam a proposta de cada conceito.</p>
      </section>

      <section id="tecnologia" className="technology-section page-section"><div className="technology-heading"><span className="eyebrow">/ TECNOLOGIA COM PROPÓSITO</span><h2>Inteligente por dentro.<br />Extraordinário por fora.</h2><p>O melhor da tecnologia é quando ela se torna parte natural da sua vida.</p></div><div className="technology-grid"><div><Layers3 /><h3>Feito para se adaptar</h3><p>Do espaço da sua mesa às particularidades do seu corpo. Design que respeita a sua individualidade.</p></div><div><Scan /><h3>Conectado a você</h3><p>Interações intuitivas, materiais inteligentes e novas possibilidades na palma da sua mão.</p></div><div><Sparkles /><h3>Além do convencional</h3><p>Ideias inspiradas pela imaginação para repensar os objetos que fazem parte do seu dia.</p></div></div></section>

      <section id="sobre" className="about-section page-section"><span className="eyebrow muted-eyebrow">/ O ESPÍRITO NEXTLAB</span><div className="about-content"><h2>O futuro não espera.<br /><span>A gente também não.</span></h2><div><p>Acreditamos em ideias que desafiam o comum. A NEXTLAB é uma vitrine para conceitos que aproximam tecnologia, design e imaginação — colocando novas possibilidades em movimento.</p><Button asChild variant="outline"><a href="#produtos">Encontre sua próxima inovação <ArrowUpRight /></a></Button></div></div></section>
      <footer className="site-footer"><a href="#" className="wordmark">NEXT<span>LAB</span><span className="brand-dot">®</span></a><p>Imaginação que move o amanhã.</p><span>© 2026 NEXTLAB</span><Button asChild variant="ghost" size="icon"><a href="#" aria-label="Voltar ao topo"><MoveUpRight /></a></Button></footer>

      <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }}><DialogContent className="product-dialog">{selected && <><div className="dialog-product-image"><img src={selected.image} alt={selected.name} width={1024} height={1024} /><span className="eyebrow">{selected.category}</span></div><div className="dialog-product-copy"><span className="eyebrow muted-eyebrow">CONCEITO / {selected.id}</span><DialogTitle className="dialog-title">{selected.name}</DialogTitle><DialogDescription>{selected.description}</DialogDescription><div className="feature-list">{selected.features.map(feature => <div key={feature.title}><ChevronRight size={18} /><div><h3>{feature.title}</h3><p>{feature.text}</p></div></div>)}</div><p className="dialog-note">Conceito em apresentação · Imagem ilustrativa · Sem venda disponível</p><Button variant="outline" onClick={() => setSelected(null)}>Continuar explorando <ArrowRight /></Button></div></>}</DialogContent></Dialog>
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}><DialogContent className="vision-dialog"><span className="eyebrow">/ NOSSA VISÃO</span><DialogTitle className="dialog-title">Imaginar é o primeiro passo.</DialogTitle><DialogDescription>A NEXTLAB reúne três conceitos que exploram o encontro entre tecnologia e vida cotidiana. Organização inteligente, moda adaptável e movimento personalizado: ideias para um futuro com mais possibilidades.</DialogDescription><p>Esta é uma apresentação conceitual, não uma loja. As imagens são ilustrações das ideias, e as tecnologias descritas representam propostas de desenvolvimento.</p><Button onClick={() => { setAboutOpen(false); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }) }}>Conhecer os conceitos <ArrowUpRight /></Button></DialogContent></Dialog>
    </main>
  )
}