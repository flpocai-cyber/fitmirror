# FitMirror (Espelho do Futuro) 🧘‍♀️✨

FitMirror é um PWA mobile-first focado no público feminino, permitindo o acompanhamento de metas fitness, registro de refeições por foto e projeções visuais do futuro ("FitMirror").

## 🚀 Tecnologias
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** (Dark Mode Default)
- **Supabase** (Auth, Postgres, Storage, RLS)
- **Stripe** (Assinaturas Premium)
- **Lucide React** (Ícones)
- **Recharts** (Gráficos)
- **Next-PWA** (Manifest + Service Worker)

## 🛠 Configuração Local

### 1. Clonar e Instalar
```bash
npm install
```

### 2. Variáveis de Ambiente
Renomeie `.env.example` para `.env.local` e preencha com suas chaves:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3. Banco de Dados (Supabase)
Execute o conteúdo do arquivo `supabase.sql` no **SQL Editor** do seu painel Supabase. Isso criará:
- Tabelas (`profiles`, `meals`, `workouts`, etc.)
- Enums e Triggers de Auth
- Políticas de Segurança (RLS)
- Buckets de Storage (`meal-photos`, `body-photos`)

### 4. Stripe
Configure um produto no Stripe Dashboard (Assinatura Mensal) e use o ID do preço nos arquivos se necessário (atualmente usando `price_data` dinâmico para MVP).

### 5. Rodar
```bash
npm run dev
```

## 📱 Funcionalidades
- **Dashboard**: Resumo diário de calorias e macros (Proteína, Carbo, Gordura).
- **Food Scan**: Registre refeições via upload de foto (Mock AI pronto para integração).
- **Evolução**: Gráficos de peso e histórico de medidas.
- **FitMirror (Premium)**: Projeções de 30/60/90 dias baseadas no seu objetivo.
- **PWA**: "Adicionar à Tela Inicial" para experiência de app nativo.

## 🔐 Segurança (RLS)
Todas as tabelas possuem Row Level Security ativado. Usuários só podem ler e escrever seus próprios dados. Fotos de refeições e corpo são armazenadas em buckets privados.

---
Desenvolvido com ❤️ para mulheres que buscam sua melhor versão.
