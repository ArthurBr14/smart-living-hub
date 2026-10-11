# NEXTLAB — Vitrine de Inovação

Site de divulgação de três conceitos de produto: **Modu-Desk**, **Camiseta Spider Flex** e **Tênis McFly**. A vitrine apresenta cada produto em destaque, com galeria de imagens, recursos detalhados e um diálogo de detalhes para explorar as características de cada conceito.

## Produtos

| Produto | Categoria | Ideia central |
| --- | --- | --- |
| Modu-Desk | Smart Workspace | Gaveta organizadora modular com encaixes magnéticos Click-N-Stack, divisórias ajustáveis, suporte para monitor/notebook, etiquetas E-Ink Touch e LED "Find-My-Doc" ligado ao app. |
| Camiseta Spider Flex | Smart Wear | Tecido biomimético que se adapta ao corpo, compressão ergonômica para postura e troca de cor por temperatura ou app (Clássico, Black Suit, Stark). |
| Tênis McFly | Smart Movement | Ajuste automático ao bater um pé no outro, com palmilhas que se adaptam individualmente a cada pé. |

## Rodando localmente

Pré-requisitos: Node.js 20+ (ou Bun).

```sh
git clone <url-do-repositório>
cd <nome-do-repositório>
npm install      # ou: bun install
npm run dev      # ou: bun run dev
```

O site abre em `http://localhost:5173`.

Comandos disponíveis:

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — serve o build gerado
- `npm test` — executa os testes (Vitest)
- `npm run lint` / `npm run format` — verificação e formatação de código

Não há banco de dados, variáveis de ambiente nem chaves de API: os dados dos produtos são definidos no front-end, então o projeto funciona imediatamente após a instalação das dependências.

## Estrutura

```text
src/
  routes/
    __root.tsx    layout raiz, metadados e fontes
    index.tsx     vitrine completa e diálogo de detalhes
  components/     componentes de interface (botão, diálogo, carrossel)
  assets/         imagens dos produtos
  styles.css      paleta, gradientes e estilos do tema
```

## Stack

TanStack Start (React 19 + Vite), TypeScript, Tailwind CSS v4, componentes Radix UI.

## Publicação no GitHub Pages

O arquivo `.github/workflows/deploy-pages.yml` gera o site estático e o publica a cada envio para a branch `main`.

Configuração única no GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Depois disso, o site fica em `https://<usuario>.github.io/<repositorio>/`. O andamento aparece na aba **Actions**.

## Sincronização com o Lovable

Este repositório está conectado ao projeto no Lovable. As mudanças feitas aqui e enviadas ao repositório aparecem no Lovable, e as mudanças feitas no Lovable são commitadas aqui automaticamente.
