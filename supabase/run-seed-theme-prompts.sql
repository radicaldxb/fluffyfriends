-- ============================================================
-- Seed initial theme prompts for Fireman and Spaceman
-- Run this after creating the theme_prompts table
-- ============================================================

-- Insert Fireman prompt
insert into public.theme_prompts (theme_name, prompt, active)
values (
  'fireman',
  'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN fireman portrait.

1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock. Preserve exact facial features, ear shape, and head tilt. Maintain the pet''s unique characteristics and expression.

2. STYLE & ENVIRONMENT: Use Image 1 as the master reference for the fireman aesthetic. Match the artistic style of Image 1 exactly:
   - Photorealistic rendering with professional photography quality
   - Natural, even lighting that highlights the uniform details
   - Professional portrait composition
   - Color accuracy: match the red/yellow tones and reflective materials from Image 1

3. COSTUME: Apply the fireman uniform and gear from Image 1 with complete accuracy:
   - Firefighter helmet with reflective visor
   - Fire-resistant jacket/turnout coat with reflective stripes
   - Matching pants and boots
   - Any badges, patches, or insignia visible in Image 1

4. ARTISTIC INTEGRATION: The pet must be fully integrated into the medium of Image 1. Match the texture, shadows, lighting, and overall aesthetic style exactly.

5. WIDESCREEN COMPOSITION: Center the subject. Ensure a "Cinematic Wide" view with ample space on left and right sides.

6. NO CLIPPING: Show the subject from head to waist. Ensure there is visible space/background at the bottom of the frame below the costume.

7. NO EXTRA LIMBS: Terminate the render at the torso. Do not draw legs or paws.

8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the uniform, helmet, and pet''s features.',
  true
)
on conflict (theme_name) do update
set prompt = excluded.prompt,
    updated_at = now(),
    active = excluded.active;

-- Insert Spaceman prompt
insert into public.theme_prompts (theme_name, prompt, active)
values (
  'spaceman',
  'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN spaceman portrait.

1. SUBJECT: Use the pet from Image 2. This is the absolute identity lock. Preserve exact facial features, ear shape, and head tilt. Maintain the pet''s unique characteristics and expression.

2. STYLE & ENVIRONMENT: Use Image 1 as the master reference for the spaceman aesthetic. Match the artistic style of Image 1 exactly:
   - Photorealistic rendering with professional photography quality
   - Lighting that matches Image 1 (studio lighting, space environment glow, or natural light)
   - Professional portrait composition
   - Color accuracy: match the white/silver tones, reflective surfaces, and any colored accents from Image 1

3. COSTUME: Apply the astronaut suit and gear from Image 1 with complete accuracy:
   - Space helmet with visor (reflective or clear as shown in Image 1)
   - White/colored spacesuit with patches, mission badges, or NASA insignia
   - Gloves and boots matching the suit design
   - Any equipment or details visible in Image 1

4. ARTISTIC INTEGRATION: The pet must be fully integrated into the medium of Image 1. Match the texture, shadows, lighting, and overall aesthetic style exactly.

5. WIDESCREEN COMPOSITION: Center the subject. Ensure a "Cinematic Wide" view with ample space on left and right sides.

6. NO CLIPPING: Show the subject from head to waist. Ensure there is visible space/background at the bottom of the frame below the costume.

7. NO EXTRA LIMBS: Terminate the render at the torso. Do not draw legs or paws.

8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the suit, helmet, and pet''s features.',
  true
)
on conflict (theme_name) do update
set prompt = excluded.prompt,
    updated_at = now(),
    active = excluded.active;
