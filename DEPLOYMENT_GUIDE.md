# 🚀 Restaurant ERP & POS SaaS - Cloud Deployment Guide

આ પ્રોજેક્ટને Cloud પર સરળતાથી deploy કરવા માટેનું સંપૂર્ણ Step-by-Step માર્ગદર્શન.

---

## 🏗️ Deployment Architecture (આર્કિટેક્ચર)

| ઘટક (Component) | ટેકનોલોજી | ભલામણ કરેલ પ્લેટફોર્મ | પ્લાન |
|---|---|---|---|
| **Database** | PostgreSQL | [Neon.tech](https://neon.tech) અથવા [Supabase](https://supabase.com) | Free |
| **Backend** | NestJS + Socket.IO | [Render.com](https://render.com) અથવા [Railway.app](https://railway.app) | Free / Starter |
| **Frontend** | Next.js 14 | [Vercel.com](https://vercel.com) | Free |

---

## 📌 STEP 1: Git Repository સેટઅપ અને GitHub પર Push કરવું

તમારા પ્રોજેક્ટ ફાઇલોને GitHub પર અપલોડ કરવા માટે:

1. ટર્મિનલમાં પ્રોજેક્ટના root ફોલ્ડરમાં જાઓ:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for production deployment"
   ```

2. GitHub.com પર એક નવું **Private** અથવા **Public** Repository બનાવો (દા.ત. `restaurant-erp`).

3. GitHub repo ને લિંક કરીને push કરો:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/restaurant-erp.git
   git push -u origin main
   ```

---

## 🗄️ STEP 2: મફત PostgreSQL ડેટાબેઝ સેટઅપ (Neon.tech)

1. [Neon.tech](https://neon.tech) પર જઈને ફ્રી એકાઉન્ટ બનાવો (Sign up with GitHub).
2. **"Create Project"** પર ક્લિક કરો:
   - Project Name: `restaurant-erp`
   - Region: તમારા સૌથી નજીકનો પ્રદેશ (જેમ કે `AWS Singapore` અથવા `AWS Frankfurt`)
3. પ્રોજેક્ટ બન્યા પછી Dashboard પર તમને **Connection Details** મળશે.
4. **Connection String** કોપી કરો (Postgres URL):
   ```
   postgresql://username:password@ep-cool-flower-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   *(આ `DATABASE_URL` તમારા Backend માટે જરૂરી છે)*

---

## ⚙️ STEP 3: Backend Deploy કરવું (Render.com પર)

Render પર WebSockets (Socket.IO) અને Background tasks ખૂબ સારી રીતે સપોર્ટ કરે છે.

1. [Render.com](https://render.com) પર લૉગિન કરો (Sign in with GitHub).
2. Dashboard પર **New +** બટન દબાવીને **Web Service** પસંદ કરો.
3. તમારું GitHub repository (`restaurant-erp`) પસંદ કરો.
4. નીચે મુજબ સેટિંગ્સ ભરો:
   - **Name**: `restaurant-erp-backend`
   - **Region**: ડેટાબેઝ જેવો જ પ્રદેશ પસંદ કરો (દા.ત. Singapore / Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install --include=dev && npm run prisma:generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npx prisma db push && npm run seed:site-owner && npm run start:prod
     ```
   - **Instance Type**: `Free`

5. **Environment Variables** સેક્શનમાં નીચેના વેરીએબલ્સ ઉમેરો:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon.tech માંથી કોપી કરેલી PostgreSQL Connection String |
   | `JWT_SECRET` | કોઈ પણ લાંબો સિક્રેટ સ્ટ્રિંગ (દા.ત. `restaurant_erp_jwt_secret_2026_super_key`) |
   | `PORT` | `10000` |
   | `NODE_ENV` | `production` |
   | `SITE_OWNER_LOGIN_ID` | `tomsiteowner` (અથવા તમારો સુપર એડમિન આઈડી) |
   | `SITE_OWNER_PASSWORD` | તમારો સુરક્ષિત પાસવર્ડ (ઓછામાં ઓછા 6 અક્ષર) |
   | `SITE_OWNER_NAME` | `Platform Admin` |

6. **"Create Web Service"** પર ક્લિક કરો.
7. બિલ્ડ પૂર્ણ થયા પછી Render તમને લાઈવ URL આપશે:
   `https://restaurant-erp-backend.onrender.com`

> **Note**: જો તમારે ડેમો રેસ્ટોરન્ટ અને સેમ્પલ મેનુ ડેટા પણ લોડ કરવો હોય, તો Render ના Shell/Terminal માં જઈને `npm run prisma:seed` રન કરી શકો છો.

---

## 💻 STEP 4: Frontend Deploy કરવું (Vercel.com પર)

1. [Vercel.com](https://vercel.com) પર લૉગિન કરો (Sign in with GitHub).
2. **"Add New Project"** પર ક્લિક કરો અને તમારું GitHub repo Import કરો.
3. નીચે મુજબ સેટિંગ્સ સેટ કરો:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `Edit` પર ક્લિક કરીને `frontend` ફોલ્ડર પસંદ કરો.
4. **Environment Variables** સેક્શન ખોલો અને આ બે વેરીએબલ્સ ઉમેરો:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://restaurant-erp-backend.onrender.com` (તમારું Render Backend URL) |
   | `NEXT_PUBLIC_SOCKET_URL` | `https://restaurant-erp-backend.onrender.com` (તમારું Render Backend URL) |

   *(નોંધ: URL ના છેડે `/` ના મૂકવો)*
5. **"Deploy"** બટન પર ક્લિક કરો.
6. 1 થી 2 મિનિટમાં Frontend લાઈવ થઈ જશે અને તમને Vercel Domain મળશે:
   `https://restaurant-erp-frontend.vercel.app`

---

## ✅ STEP 5: Live Test અને Login ચકાસણી

1. તમારા Vercel લાઈવ URL પર જાઓ: `https://restaurant-erp-frontend.vercel.app/login`
2. **Site Owner (Super Admin) Login:**
   - **Login ID**: `tomsiteowner` (અથવા Render પર જે સેટ કર્યું હોય તે)
   - **Password**: જે પાસવર્ડ Render ના `SITE_OWNER_PASSWORD` માં સેટ કર્યો હોય તે
3. Site Owner Dashboard (`/dashboard/site-owner`) પર જઈને તમે નવી Restaurant onboard કરી શકો છો, સબ્સ્ક્રિપ્શન મેનેજ કરી શકો છો!
4. નવી Restaurant Owner રજીસ્ટ્રેશન કરવા માટે `/register` પેજ પર જાઓ.
