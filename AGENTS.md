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

## Architecture

- The homepage hero is a React Three Fiber scene. `three`/`@react-three/fiber`/
  `@react-three/drei` must only be imported inside `src/components/hero/`
  modules, and that tree is loaded via `React.lazy` from `src/routes/index.tsx`
  so SSR never evaluates it.
- `src/lib/reveal.ts` is the shared browser-safe bridge between the 3D scene
  and DOM overlays (mutable per-frame motion state + zustand flags). Keep it
  free of `three` imports.
- The car model lives at `public/models/mustang-fastback.glb` (1967 Shelby
  GT500 by AIR3D via BlendKit — royalty-free, commercial use, no attribution
  required). Do not commit other copies of the binary.
