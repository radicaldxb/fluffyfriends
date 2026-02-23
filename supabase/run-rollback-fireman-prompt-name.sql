-- Roll back fireman prompt to version without NAME PATCH / {{PET_NAME}}.
-- Use this if you want to remove the Gemini name-on-jacket instruction.

update public.theme_prompts
set prompt = 'INSTRUCTION: Create a high-fidelity, photorealistic 16:9 WIDESCREEN fireman portrait.

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

8. QUALITY: Output must be print-ready, high-resolution, with sharp details on the uniform, helmet, and pet''s features.'::text,
    updated_at = now()
where theme_name = 'fireman';
