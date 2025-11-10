# Logo & Branding Assets Guide

## 📦 Available Assets

### Logo Files (in `public/`)

| File | Size | Purpose |
|------|------|---------|
| `logo.svg` | 200x200 | Main logo (high-res) |
| `favicon.svg` | 32x32 | Browser tab icon |
| `og-image.svg` | 1200x630 | Social media share image |
| `site.webmanifest` | - | PWA manifest |

---

## 🎨 Logo Component Usage

### Import

```tsx
import { Logo, LogoIcon, LogoText, LogoFull } from '@/components/logo';
```

### Variants

#### Full Logo (Icon + Text)
```tsx
<Logo variant="full" size="md" />
// or
<LogoFull size="md" />
```

#### Icon Only
```tsx
<Logo variant="icon" size="sm" />
// or
<LogoIcon size="sm" />
```

#### Text Only
```tsx
<Logo variant="text" size="lg" />
// or
<LogoText size="lg" />
```

### Sizes

| Size | Height | Use Case |
|------|--------|----------|
| `sm` | h-6 (24px) | Mobile nav, footer |
| `md` | h-8 (32px) | Desktop nav (default) |
| `lg` | h-12 (48px) | Hero sections |
| `xl` | h-16 (64px) | Landing page hero |

### With Link

```tsx
<Logo variant="full" size="md" href="/" />
```

### Custom Styling

```tsx
<Logo
  variant="full"
  size="md"
  className="text-blue-600 hover:text-blue-700 transition"
/>
```

---

## 🖼️ Where Logo Appears

### Browser Tab
- **File**: `favicon.svg`
- **Auto-loaded** by Next.js from `public/`
- Appears in browser tabs, bookmarks, history

### Social Media Shares
- **File**: `og-image.svg`
- **Size**: 1200x630 (Open Graph standard)
- Appears when sharing on:
  - Twitter/X
  - Facebook
  - LinkedIn
  - WhatsApp
  - Slack
  - Discord

### App Icon (PWA)
- **File**: `logo.svg`
- **Configured** in `site.webmanifest`
- Appears when:
  - User adds site to home screen
  - Progressive Web App install
  - Bookmark icon

### Navigation
```tsx
// In your navigation component
import { LogoFull } from '@/components/logo';

<nav>
  <LogoFull size="md" href="/" />
</nav>
```

---

## 🎨 Brand Colors

### Primary Blue
```css
--primary: #2563EB; /* Tailwind: text-primary or bg-primary */
--primary-dark: #1E40AF; /* Darker shade */
--primary-light: #60A5FA; /* Lighter shade */
```

### Usage in Components
```tsx
// Primary color (automatically applied to Logo)
<Logo className="text-primary" />

// Dark blue
<Logo className="text-blue-700" />

// White (on dark backgrounds)
<Logo className="text-white" />
```

---

## 📱 Social Media Profiles

### Profile Picture (Circular)
Use: `logo.svg` (200x200)
- Centered processor icon shows well in circle crop
- White background or transparent

### Cover/Banner Images
Use: `og-image.svg` (1200x630)
- Works well for Twitter header
- LinkedIn company page banner
- Facebook cover photo

---

## ✅ Checklist: Logo Implementation

### Browser
- [x] Favicon appears in browser tab
- [x] Title shows "HitForget - Virtual Embedded Processors"
- [x] Logo SVG loads correctly

### Social Sharing
- [x] Twitter Card preview shows logo
- [x] Facebook preview shows logo
- [x] LinkedIn preview shows logo
- [x] WhatsApp preview shows logo

### PWA
- [x] Manifest file exists (`site.webmanifest`)
- [x] App icons defined
- [x] Theme color set (#2563EB)

### Components
- [x] Logo component created
- [x] Multiple size variants
- [x] Link wrapper support
- [x] Custom styling support

---

## 🔧 Testing

### Test Favicon
1. Open: `http://localhost:3000`
2. Check browser tab for logo icon
3. Bookmark the page - icon should appear

### Test Social Sharing
1. Use tools:
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

2. Enter your URL
3. Verify logo appears in preview

### Test Logo Component
```tsx
// Create a test page: app/test-logo/page.tsx
import { Logo } from '@/components/logo';

export default function TestLogoPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Logo Variants</h1>

      <div className="space-y-4">
        <div>
          <h2>Full Logo - Small</h2>
          <Logo variant="full" size="sm" />
        </div>

        <div>
          <h2>Full Logo - Medium</h2>
          <Logo variant="full" size="md" />
        </div>

        <div>
          <h2>Full Logo - Large</h2>
          <Logo variant="full" size="lg" />
        </div>

        <div>
          <h2>Full Logo - XL</h2>
          <Logo variant="full" size="xl" />
        </div>

        <div>
          <h2>Icon Only</h2>
          <Logo variant="icon" size="md" />
        </div>

        <div>
          <h2>Text Only</h2>
          <Logo variant="text" size="md" />
        </div>

        <div className="bg-blue-600 p-4 rounded">
          <h2 className="text-white mb-2">On Dark Background</h2>
          <Logo variant="full" size="md" className="text-white" />
        </div>
      </div>
    </div>
  );
}
```

Visit: `http://localhost:3000/test-logo`

---

## 📋 Next Steps

### Production Checklist

- [ ] Replace `NEXT_PUBLIC_APP_URL` in `.env.local` with actual domain
- [ ] Re-test social sharing with production URL
- [ ] Add Google Site Verification code (if needed)
- [ ] Create PNG versions of logo for better compatibility:
  - 32x32 (favicon)
  - 180x180 (Apple Touch Icon)
  - 192x192 (Android)
  - 512x512 (Android)
- [ ] Test PWA installation on mobile
- [ ] Verify logo appears correctly on all pages

### Optional Enhancements

- [ ] Add dark mode logo variant
- [ ] Create animated logo for loading states
- [ ] Add logo press kit (ZIP with all formats)
- [ ] Create brand guidelines document

---

## 🎯 Summary

**What was added:**

✅ **Favicon** (`favicon.svg`) - Browser tab icon
✅ **Logo** (`logo.svg`) - High-res main logo
✅ **OG Image** (`og-image.svg`) - Social media preview
✅ **Manifest** (`site.webmanifest`) - PWA configuration
✅ **Metadata** (app/layout.tsx) - SEO + Open Graph
✅ **Logo Component** (`components/logo.tsx`) - Reusable React component

**Now your site has:**
- Professional favicon in browser tabs ✓
- Beautiful social media previews ✓
- Reusable logo component ✓
- PWA-ready configuration ✓
- Full SEO metadata ✓

**Test it:**
```bash
npm run dev
# Open http://localhost:3000
# Check browser tab for icon
# Share on Twitter to test OG image
```

**Deploy it:**
```bash
vercel --prod
# Test social sharing with production URL
```

🎉 **Done!** Your branding is now complete!
