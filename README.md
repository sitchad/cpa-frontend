# CPA Frontend

Interface React connectée au backend Laravel CPA.

## Stack
- **Vite** + **React 18**
- **React Router v6** (routes protégées, redirection rôle)
- **Axios** (Bearer Token auto, intercepteurs 401)
- **Lucide React** (icônes)

## Installation

```bash
cd cpa-frontend
npm install
npm run dev
```

## Structure des fichiers

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Router + guards (RequireAuth, RequireAdmin)
├── index.css                   # Design system complet (variables CSS)
├── context/
│   └── AuthContext.jsx         # État global auth (login, logout, user, isAdmin)
├── services/
│   └── api.js                  # Axios instance + toutes les fonctions API
├── components/
│   └── Sidebar.jsx             # Sidebar partagée
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx
    ├── Offers.jsx
    ├── Wallet.jsx
    ├── Withdraw.jsx
    └── admin/
        ├── AdminDashboard.jsx
        ├── AdminUsers.jsx
        └── AdminWithdrawals.jsx
```

## Fonctionnement de l'auth

1. `POST /auth/login` → reçoit `token` + `user`
2. Token stocké dans `localStorage`
3. Chaque requête Axios → `Authorization: Bearer <token>` automatique
4. Si réponse 401 → déconnexion + redirect `/login`
5. Après login : `GET /auth/me` → si `role === 'admin'` → `/admin`, sinon → `/dashboard`

## Variables d'environnement (optionnel)

Créez un `.env` à la racine :
```
VITE_API_URL=https://cpa-backend-main-2nqdmn.laravel.cloud/api
```

Et dans `src/services/api.js`, remplacez la `BASE_URL` par :
```js
const BASE_URL = import.meta.env.VITE_API_URL
```
# cpa-frontend
