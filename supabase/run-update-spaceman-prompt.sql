-- ============================================================
-- Update Spaceman theme prompt (head/neck only, no tails, style lock)
-- Run in Supabase SQL Editor
-- ============================================================

update public.theme_prompts
set
  prompt = 'INSTRUCTION: High-fidelity 16:9 WIDESCREEN astronaut portrait.

1. SUBJECT & IDENTITY: Use the pet from Image 2. Focus strictly on the face, ears, and expression.
   - COMPOSITION LIMIT: Portrait shot. Head and neck only.

2. CROP & TERMINATION (THE "NO TAILS" FIX):
   - MAPPING: The subject is a head sitting on a torso.
   - BOTTOM BORDER: The frame must cut off at the chest/shoulder area of the spacesuit.
   - ABSOLUTE NEGATIVE: Zero tolerance for legs, paws, tails, or lower body details.
   - SPACING: Ensure the ears have 10% breathing room from the top; do not crop the ears.

3. STYLE LOCK:
   - MASTER REFERENCE: Match the cinematic bokeh, lighting, and film grain of Image 1 exactly.
   - LIGHTING: High-contrast "Studio Space" lighting. Use rim lighting to define the fur edges (especially for dark pets) against the space background.

4. COSTUME INTERFACE:
   - NECK SEAL: The pet''s neck must integrate seamlessly into the suit''s mechanical gasket/collar.
   - GEAR: Only show the upper shoulder plates and neck ring—no full body suit components.

5. QUALITY: Sharp focus on fur texture, 8K resolution, zero artifacts.',
  updated_at = now()
where theme_name = 'spaceman';
