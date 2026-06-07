# Laced Baddies Site

Headless ecommerce storefront for the Laced Baddies product landing page.

The site is still a fast static storefront, but checkout is now wired for Swell through a public config endpoint that works locally and on Vercel.

## Run Locally

```bash
npm start
```

Open:

```text
http://127.0.0.1:3000
```

Use another port if needed:

```bash
PORT=4173 npm start
```

## Swell Setup

Copy the env template:

```bash
cp .env.example .env
```

Fill in:

```text
SWELL_STORE_ID=
SWELL_PUBLIC_KEY=
SWELL_PRODUCT_ID=
```

If each length or purchase plan is a different Swell product, use the optional product-specific variables in `.env.example`.

The 30-day plan sends a Swell `subscription` purchase option by default, and one-time purchase sends `standard`. Add the optional plan ID variables in `.env.example` if your Swell product has named purchase plans.

The browser only receives public storefront config from `/api/swell-config`. Do not add Swell secret keys to client-side code.

## Vercel

Add these environment variables in the Vercel project settings:

```text
SWELL_STORE_ID
SWELL_PUBLIC_KEY
SWELL_PRODUCT_ID
```

Then deploy through the Vercel GitHub integration or from the CLI:

```bash
vercel
vercel --prod
```

Large unused generated media folders are excluded from Vercel uploads through `.vercelignore`.

## GitHub

This repo includes a GitHub Actions CI workflow at `.github/workflows/ci.yml`.

Recommended first push:

```bash
git init
git add .
git commit -m "Set up headless Swell storefront"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```
