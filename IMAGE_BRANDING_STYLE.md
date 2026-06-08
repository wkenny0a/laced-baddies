# Laced Baddies Image Branding And Style Guide

Use this guide for every generated website graphic, ad creative, product comparison image, and product education visual for Laced Baddies.

## Brand Direction

Laced Baddies visuals should feel like premium beauty ecommerce mixed with clean social ad energy. The style is luxury, glossy, warm, high-contrast, and confident without feeling too dark.

Core words:

- Premium
- Polished
- Beauty-tech
- Glueless confidence
- Warm beauty editorial
- Restrained neon accents
- Salon-realistic
- Black-owned luxury
- Fast-scroll social proof

The images should make the product feel expensive, but still direct and easy to understand.

## Core Visual Style

Use a warm softly blurred salon or beauty studio background with realistic lighting. The background should be medium-warm and polished, not blacked out or overly moody. Place text and labels inside glossy deep cocoa or black-coffee translucent panels. Use fuchsia-to-mango accents sparingly: thin borders, small highlight lines, arrows, badges, and premium emphasis only. Avoid heavy neon glow, thick shadowed text, and overly saturated backgrounds.

The best current reference assets are:

- `assets/wig-ultra-hd-lace-tech-themed-v4.png`
- `assets/wig-human-hair-texture-themed.png`
- `assets/laced-baddies-length-guide-26-28-30-v2.png`

## Color Palette

Use the same palette as the website.

| Role | Hex | Usage |
| --- | --- | --- |
| Black coffee shadow | `#120704` | Deep shadows, label bars, subtle edge depth |
| Deep cocoa card | `#220F0A` | Panels, label bars, overlays |
| Neon fuchsia | `#FF007F` | Small borders, arrows, badges, premium accents |
| Mango orange | `#FFA62B` | Gradient ends, small highlights, premium warmth |
| Cream white | `#FFF8F0` | Main text, numbers, labels |
| Muted rose-gray | `#D1C5C0` | Subtitles and softer copy |

Use black coffee and deep cocoa as structure, not as the entire image background. Let the salon/photo background stay visible and warm.

Default gradient:

```css
linear-gradient(135deg, #FF007F, #FFA62B)
```

## Typography Style

Website fonts:

- Headlines: `Syne`, bold, wide, high-impact
- Body/captions: `Outfit`, clean and modern

Generated images should imitate this feeling:

- Large bold uppercase headlines
- Cream or fuchsia-to-orange gradient headline treatment
- Dark translucent label bars
- Minimal copy
- Crisp, readable text
- Subtle shadows only; do not use heavy neon drop-shadows

## Layout Patterns

### Hero Product Education Graphic

Use this for tech or quality explainers.

- Square or landscape crop
- Warm softly blurred salon background
- Large product/model image as the main center subject
- Top-left headline box with a clean thin accent outline
- Right-side circular zoom callout when showing lace/hair details
- Bottom three-card comparison row when comparing features
- Dark label bars with cream text
- Thin fuchsia/mango accent outline around key cards

### Three-Option Comparison Graphic

Use this for length, lace, texture, or plan comparisons.

- Three equal vertical panels
- One clear subject per panel
- Strong bottom labels
- Small hot pink/orange border accents
- Keep each option visually distinct
- Avoid crowding the panel with too many measurement marks

### Closeup Detail Graphic

Use this for lace and hair texture proof.

- Macro hairline, lace, strand, or wave texture
- Circular or card-based zoom
- Skin, lace, and hair must look realistic
- Use premium lighting, not harsh flash
- Show product detail clearly enough to inspect

## Product Subject Rules

Hair should always look:

- Silky
- Smooth
- Glossy
- Real human hair
- Black body wave unless another texture is requested
- Softly voluminous, not stiff
- Easy to style

Lace should always look:

- Fine
- Soft
- Melted
- Light on skin
- Less visible than regular lace
- Clean around the hairline

Models should look:

- Beauty editorial, not stock-photo generic
- Confident and polished
- Natural glam makeup
- Realistic skin texture
- Clean poses that show the product

## Image Text Rules

Keep text short and exact. Generated-image text is fragile, so fewer words is better.

Approved recurring text:

- `LACED BADDIES`
- `LENGTH GUIDE`
- `OUR ULTRA HD LACE TECH`
- `Regular Lace`
- `HD Lace`
- `Our Ultra HD Lace Tech`
- `26"`
- `28"`
- `30"`
- `Silky Smooth`
- `Real Human Hair`
- `Easy To Style`

Avoid long sentences inside images unless absolutely needed.

When labels are required:

- Use exact spelling and capitalization
- Use only the necessary labels
- Do not add extra measurement numbers
- Do not let text overlap hair, faces, or UI borders
- Put labels in clean dark bottom bars when possible

## Length Guide Rules

For length guide images:

- Use three different girls/models when showing 26, 28, and 30 inches
- Make 28 inches clearly longer than 26 inches
- Make 30 inches clearly the longest
- Use one horizontal marker line per panel
- Align the marker line with the lowest visible hair tips
- No hair strands should extend below the marker line
- Do not include extra measurements like 8, 12, 16, 20, or 24
- Bottom label bars should show only `26"`, `28"`, and `30"`

## Image Prompt Template

Use this as the base prompt for future image generation:

```text
Create a premium Laced Baddies ecommerce beauty graphic.

Style: warm softly blurred salon background, glossy black-coffee/deep cocoa glass panels, restrained hot pink-to-mango accents, thin accent outlines, high-end beauty ad lighting, realistic product photography. Keep the background lighter than black and avoid heavy neon glow.

Brand text: LACED BADDIES.
Main headline: [EXACT HEADLINE].
Subject: [describe wig, model, lace, hair texture, or length guide].
Composition: [single hero, three-panel comparison, circular zoom callout, bottom cards].
Labels: use only these exact labels: [LABELS].

Hair: silky black body wave human hair, glossy, smooth, realistic, soft movement.
Lace: fine, melted, subtle, clean hairline, premium beauty-tech look.

Avoid: misspelled text, extra labels, watermark, clutter, cartoon style, distorted faces, unrealistic hair, messy props, hands covering hair, incorrect numbers, text overlap.
```

## Specific Prompt Patterns

### Ultra HD Lace Tech

```text
Create a Laced Baddies Ultra HD Lace Tech comparison graphic in a warm salon beauty-ad style. Use a main model wearing a sleek black wig with a melted hairline. Add a circular closeup callout showing fine lace detail. Add three bottom cards labeled Regular Lace, HD Lace, and Our Ultra HD Lace Tech. Make the Ultra HD panel look the most invisible and premium. Use clean cocoa label bars, thin fuchsia-to-mango accent borders, and only a small amount of neon.
```

### Hair Texture

```text
Create a Laced Baddies hair texture graphic showing silky smooth real human hair that is easy to style. Use glossy black body wave hair, realistic strand detail, and a premium warm salon background. Structure it like a beauty-tech comparison graphic with clean labels: Silky Smooth, Real Human Hair, Easy To Style. Use subtle fuchsia/orange outlines and clean dark label bars.
```

### Length Guide

```text
Create a Laced Baddies length guide with three different girls in three side-by-side panels. Each wears silky black body wave hair. Left panel is 26 inches, center is 28 inches, right panel is 30 inches. Make 28 inches clearly longer than 26 inches. Use one marker line per panel, aligned exactly with the lowest hair tips. Bottom labels must be only 26", 28", and 30". Use a warm salon background, glossy cocoa panels, and thin fuchsia-to-orange accent borders.
```

## Do And Do Not

Do:

- Use warm salon/studio backgrounds with natural depth
- Use high-contrast cream text
- Use fuchsia/orange gradient borders sparingly
- Keep neon accents small and intentional
- Show the actual product feature clearly
- Make comparison differences obvious
- Keep labels large and simple
- Save project-ready assets in `assets/`

Do not:

- Use flat beige, plain white, or pastel-only visuals
- Make the whole image black, overly smoky, or heavily neon
- Add thick glow effects behind every label
- Use busy props that distract from the wig
- Use tiny unreadable text
- Add unrelated fashion/editorial copy
- Let hair length markers mismatch the hair tips
- Reuse the same model in all panels when variety is requested
- Include secret keys, URLs, or checkout details inside images

## File Naming

Use clear lowercase filenames:

```text
assets/laced-baddies-length-guide-26-28-30-v2.png
assets/wig-ultra-hd-lace-tech-themed-v4.png
assets/wig-human-hair-texture-themed.png
```

For revisions, use `-v2`, `-v3`, etc. Do not overwrite an existing asset unless intentionally replacing it site-wide.

## Final QA Checklist

Before adding an image to the site, check:

- Text is spelled correctly
- Labels are readable on mobile
- Image matches the warm editorial Laced Baddies style
- Product feature is obvious within 2 seconds
- No watermark or random logo appears
- Hair and lace look realistic
- Measurements match the visual
- File is saved in `assets/`
- The website references the correct asset path
