# glossaire-app
glossaire personnel

glossaire-app exportée de Manus.im est une application web moderne full-stack en TypeScript/Node.js.

# structure
## Technos  :
Vite (vite.config.ts) : bundler ultra-rapide pour le front-end.
TypeScript (tsconfig.json) : JavaScript typé, proche de Kotlin.
pnpm (pnpm-lock.yaml) : gestionnaire de paquets.
Drizzle (drizzle.config.ts) : ORM pour base de données (probablement SQLite ou PostgreSQL).

## Structure full-stack :
client/ : interface utilisateur (React/Vue/Svelte)
server/ : API back-end (Node.js/Express/Fastify)
shared/ : code commun (types, utilitaires)
drizzle/ : migrations base de données.
​
