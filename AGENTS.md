<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application structure
- Keep the product showcase on the index route with browser-safe product data and a shared detail dialog; this keeps exploration fast without requiring a backend.
- Define the showcase palette and presentation styles in src/styles.css and use the shared Button component for actions; this keeps the visual system consistent.
- Pre-optimize the showcase's React-dependent UI packages in Vite alongside the template's React entries; this prevents late dependency discovery from replacing the React module graph in an open preview.
- Build for GitHub Pages only when GITHUB_PAGES_BASE is set (sub-path base, router basepath, nitro off, prerender "/"), and reference public files through import.meta.env.BASE_URL; the repo sub-path breaks root-absolute URLs while Lovable hosting stays at "/".
