-- ============================================================
-- Update Spaceman theme prompt (tight portrait, no tails/paws/legs)
-- Run in Supabase SQL Editor
-- ============================================================

update public.theme_prompts
set
  prompt = 'INSTRUCTION: Create a high-fidelity 16:9 WIDESCREEN astronaut portrait.

1. SUBJECT & IDENTITY: Use the pet from Image 2. Absolute identity lock on facial structure, ears, and expression.
   - FOCUS: Head and neck only.

2. COMPOSITION & CROPPING (THE "NO TAILS" FIX):
   - SHOT TYPE: Tight Cinematic Portrait.
   - TERMINATION: The render must end at the upper chest/shoulders of the spacesuit.
   - NEGATIVE CONSTRAINT: Strictly NO legs, NO paws, NO tails, and NO lower body visible.
   - NO CLIPPING: Ensure the top of the head/ears has 10% breathing room from the top edge.

3. STYLE & THEME INTEGRATION:
   - MASTER STYLE: Image 1 is the "Aesthetic North Star." Match the specific lens flare, film grain, and "Depth of Field" (bokeh) of Image 1.
   - LIGHTING: Use the high-contrast "Space Studio" lighting from Image 1. Ensure the pet''s face is lit by the same primary light source (e.g., a warm cockpit light or cool starlight).

4. COSTUME ACCURACY:
   - NECK INTERFACE: The pet''s head must sit naturally inside the helmet-ring collar.
   - GEAR: Include only the top-most details of the suit (shoulder patches, neck seals) seen in Image 1.

5. QUALITY: Print-ready, 8K resolution, sharp focus on fur texture, zero artifacts.',
  updated_at = now()
where theme_name = 'spaceman';
