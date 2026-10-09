# EcoKit — product photography prompts

Every product on the site currently shows a branded placeholder. These prompts
generate the 18 real photos.

## How to use this

1. Paste **Section A (the style block)** once at the top of your generator, so
   every image comes from the same imaginary shoot. Consistency across the grid
   matters more than any single image.
2. Then run the 18 prompts in **Section C**.
3. Save each result under the exact filename given — that filename is already
   wired into the site, so the placeholder is replaced with no code change:

   ```
   ecokit-next/public/images/products/<filename>.jpg
   ```

4. Then in the admin panel (or in `src/lib/products.ts`) untick **"Still using a
   placeholder photo"** for each one, so the dashboard count goes to zero.

**Output spec for every image**
- Aspect ratio **4:5 portrait**, at least **1200 × 1500 px**
- JPEG, under ~400 KB each (the site resizes and serves modern formats itself)
- Product centred with generous margin — the site crops to square on some cards

---

## Section A — style block (prepend to every prompt)

> Premium e-commerce product photograph for an eco-friendly personal-care brand.
> Single product, centred, shot on a warm sand-cream background (#FFF6E5) with a
> soft matching surface. Natural diffused daylight from the upper left, gentle
> realistic soft shadow falling to the lower right, no harsh highlights, no
> studio strobe look. Warm neutral colour grade, muted and earthy, slightly
> desaturated. Shallow depth of field with the whole product in sharp focus.
> Shot on an 85mm lens, eye-level three-quarter angle. Minimal, calm, editorial,
> expensive-looking. Photorealistic, high detail, true-to-life material texture.
> 4:5 portrait composition with generous empty space around the product.
> No text, no logos, no watermarks, no packaging branding, no hands, no people,
> no clutter, no props competing with the product.

**Palette to keep in frame (the brand's):** sand cream `#FFF6E5`, deep forest
green `#14342B`, marigold `#F4A300`, terracotta `#E2593B`, leaf green `#B7D14B`.
Accents only — the background must stay sand cream.

---

## Section B — things to get right

- **Bamboo** should read as pale honey-blond wood with a visible fine grain, not
  dark or orange like teak.
- **Wheat straw** items are a moulded composite: matte, slightly speckled,
  oat-coloured, a little more "plastic-like" in form than bamboo but clearly
  natural in finish.
- **Bottles and tubes** should be unbranded or carry only a plain kraft-paper
  label — the real labels do not exist yet, and invented branding would have to
  be regenerated later.
- Keep every product at a **similar visual size** in frame. A pen and a towel
  photographed at the same scale look wrong together in a grid.

---

## Section C — the 18 prompts

### Oral care

**1. `bamboo-toothbrush.jpg`**
> A single bamboo toothbrush lying at a slight diagonal. Smooth pale bamboo
> handle with visible fine grain, soft charcoal-grey bristles. One product only.

**2. `wheat-straw-toothbrush.jpg`**
> A single toothbrush with a matte oat-coloured wheat-straw composite handle,
> faint natural speckling, soft white bristles. Lying at a slight diagonal.

**3. `bamboo-tongue-cleaner.jpg`**
> A U-shaped bamboo tongue cleaner with a smooth curved scraping edge and two
> rounded handles, laid flat and angled slightly. Pale bamboo, fine grain.

### Hair care

**4. `bamboo-comb.jpg`**
> A wide-tooth bamboo comb, rounded rectangular body, evenly spaced teeth, laid
> at a gentle diagonal. Pale honey bamboo with clear grain running lengthways.

**5. `wheat-straw-comb.jpg`**
> A moulded wheat-straw comb in matte oat colour with faint natural fibre
> speckling, fine teeth, rounded handle. Laid at a gentle diagonal.

**6. `neem-comb.jpg`**
> A hand-finished neem wood comb, warm mid-brown with a visible grain and
> slightly rustic hand-cut edges, wide teeth. Laid at a gentle diagonal.

**7. `shampoo.jpg`**
> An unbranded amber-brown glass bottle with a matte black pump, standing
> upright. Plain narrow kraft-paper band around the middle, no text on it.

### Bath & body

**8. `shower-gel.jpg`**
> An unbranded amber-brown glass bottle with a matte black pump, standing
> upright, slightly taller and slimmer than a shampoo bottle. Plain kraft band.

**9. `handcrafted-soap.jpg`**
> A rectangular cold-pressed soap bar in natural cream-beige with a slightly
> rough hand-cut surface, resting on a folded sheet of unbleached kraft paper.

**10. `moisturizer.jpg`**
> An unbranded frosted-white cosmetic bottle with a matte bamboo cap, standing
> upright. Soft, clean, spa-like. Plain kraft band, no text.

**11. `jute-loofah.jpg`**
> A natural jute loofah pad — coarse woven golden-brown fibre, slightly uneven
> handmade texture, with a short jute hanging loop. Laid flat, angled slightly.

**12. `bamboo-towel.jpg`**
> A single neatly folded bamboo-fibre towel in soft off-white, fine flat weave
> with a subtle sheen, crisp folded edges, photographed as a tidy stack of one.

**13. `biodegradable-shower-cap.jpg`**
> A biodegradable shower cap in soft translucent natural beige with a gathered
> elasticated edge, resting lightly domed rather than flat.

### Grooming

**14. `wheat-straw-razor.jpg`**
> A safety razor with a matte oat-coloured wheat-straw composite handle and a
> brushed stainless-steel head, laid at a slight diagonal.

**15. `shaving-gel.jpg`**
> An unbranded soft-matte cream-coloured squeeze tube standing upright on its
> flat cap, with a plain kraft-paper band. Clean and minimal, no text.

### Travel

**16. `sugarcane-water-bottle.jpg`**
> A reusable water bottle moulded from sugarcane-bagasse fibre: matte,
> oat-to-pale-sand coloured with a faint natural fleck, cylindrical with a
> screw cap. Standing upright.

### Corporate & gifting

**17. `bamboo-diary.jpg`**
> A closed A5 notebook with a pale bamboo veneer cover showing fine grain, and
> visible recycled off-white paper edges. Resting flat, angled slightly, with a
> gentle shadow under the raised corner.

**18. `bamboo-pen.jpg`**
> A slim pen with a turned pale bamboo barrel and a brushed metal tip and clip,
> lying at a gentle diagonal.

---

## Optional extras

Not required, but these would lift the site if the generator has capacity. Save
them in `public/images/` (not the `products/` folder).

- `kit-oral-care.jpg` — a bamboo toothbrush, tongue cleaner and comb arranged as
  a flat-lay kit on kraft paper, same lighting and background.
- `kit-hotel-amenity.jpg` — soap, shower cap, loofah and a small bottle grouped
  as a hotel bathroom amenity set.
- `kit-corporate-gift.jpg` — bamboo diary, pen and water bottle arranged as a
  corporate welcome gift.

These three would replace the reused stock images currently standing in for the
Hospitality and Custom Kits sections.
