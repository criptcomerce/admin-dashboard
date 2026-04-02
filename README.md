# 🖥️ CryptoPay Admin Dashboard

Dashboard admin para monitoramento de pagamentos em criptomoeda, conectado ao backend **criptcomerce** (NOWPayments).

---

## 🗂️ Estrutura

```
src/
├── app/
│   ├── api/auth/login/route.ts   ← API Route de autenticação
│   ├── login/page.tsx
│   ├── dashboard/page.tsx        ← Métricas + Charts
│   ├── orders/page.tsx           ← Tabela + filtros + CSV
│   ├── payments/page.tsx         ← Pagamentos com TX hash
│   ├── analytics/page.tsx        ← Charts aprofundados
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/          Badge · Card · Table · Modal · Pagination · Loader · CopyButton
│   ├── layout/      Sidebar · Topbar · DashboardLayout
│   ├── charts/      RevenueChart · OrdersChart · CurrencyPieChart
│   └── modals/      OrderDetailModal
├── hooks/           useOrders · usePayments
├── lib/             api.ts (Axios) · auth.ts (helpers)
├── store/           auth.store.ts (Zustand)
├── types/           index.ts
└── middleware.ts    ← Proteção de rotas
```

---

## 🚀 Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000   # URL do backend criptcomerce
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=seu-segredo-aqui
```

### 3. Garantir que o backend está rodando
```bash
# No repositório criptcomerce:
docker-compose up -d
# ou
npm run start:dev
```

### 4. Rodar o dashboard
```bash
npm run dev
# Acesse: http://localhost:4000
```

---

## 🔌 Como se conecta ao backend (criptcomerce / NOWPayments)

O dashboard **não** chama a API do NOWPayments diretamente.
Ele chama o **seu backend NestJS** (`criptcomerce`), que já tem os dados processados:

```
Dashboard Next.js
      ↓  GET /orders    → array de pedidos
      ↓  GET /payments  → array de pagamentos
Backend NestJS (criptcomerce)
      ↓  (já integrado com NOWPayments)
PostgreSQL
```

Os endpoints consumidos são exatamente:

| Método | Endpoint      | Usado em                     |
|--------|---------------|------------------------------|
| GET    | /orders       | Dashboard, Orders, Analytics |
| GET    | /orders/:id   | Modal de detalhes            |
| GET    | /payments     | Payments, Dashboard          |

O `api.ts` normaliza a resposta para `{ data: T[], total: number }` independente do formato retornado.

---

## ⚙️ Funcionalidades

| Feature                  | Onde              |
|--------------------------|-------------------|
| Login com JWT            | `/login`          |
| Proteção de rotas        | `middleware.ts`   |
| Métricas em tempo real   | `/dashboard`      |
| Auto-refresh 10 segundos | `providers.tsx`   |
| Filtros + busca          | `/orders`         |
| Exportar CSV             | `/orders`         |
| Copy-to-clipboard        | Todos             |
| Modal de detalhes        | `/orders`         |
| Timeline de status       | Modal             |
| TX Hash blockchain       | `/payments`       |
| Charts interativos       | `/analytics`      |
| Dark/light toggle        | Topbar            |

---

## 🛠️ Adicionar novo endpoint do backend

1. Adicione a função em `src/lib/api.ts`
2. Crie um hook em `src/hooks/`
3. Use o hook na página com `useQuery`

Exemplo:
```ts
// lib/api.ts
export async function fetchTransfers() {
  const { data } = await api.get('/transfers');
  return Array.isArray(data) ? data : data?.data ?? [];
}

// hooks/useTransfers.ts
export function useTransfers() {
  return useQuery({ queryKey: ['transfers'], queryFn: fetchTransfers });
}
```
