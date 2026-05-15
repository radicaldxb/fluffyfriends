export type Theme = {
  id: string
  name: string
  tagline: string
  story: string
  hasNameTag: boolean
  nameTagFormat?: string
  printIdeas: string[]
  faqs: { question: string; answer: string }[]
  relatedThemes: string[]
  previewImage: string
  masterImage: string
}

export const themes: Record<string, Theme> = {
  pilot: {
    id: "pilot",
    name: "Pilot",
    tagline: "Your pet, born to fly.",
    story:
      "Every great aviator needs a portrait worthy of the hangar wall. Dressed in a worn leather A-2 bomber jacket, aviator sunglasses hanging from the zipper, your pet takes their place among the legends of flight. This is not just a portrait. It is a statement.",
    hasNameTag: true,
    nameTagFormat: "{{PET_NAME}} on gold chest name tag",
    printIdeas: [
      "Above a home office desk, commanding and characterful",
      "In a hallway gallery wall alongside other theme portraits",
      "As a gift for a pilot, aviation enthusiast, or Top Gun fan",
      "Framed in dark wood at 50x28cm for maximum impact",
    ],
    faqs: [
      {
        question: "Does the Pilot portrait include my pet's name?",
        answer:
          "Yes. Your pet's name appears on a gold name tag on the left chest of the bomber jacket, rendered in engraved capital letters.",
      },
      {
        question: "What is the background of the Pilot portrait?",
        answer:
          "A vintage aircraft hangar with dramatic golden sunset light pouring through the open doors, with a P-51 Mustang visible in the background.",
      },
      {
        question: "What frame size works best for the Pilot portrait?",
        answer:
          "The landscape format prints beautifully at 50x28cm or 65x36cm. A dark wood or black metal frame complements the cinematic warm tones perfectly.",
      },
      {
        question: "Can I order the Pilot portrait as a gift?",
        answer:
          "Absolutely. The Pilot portrait makes an exceptional gift for aviation enthusiasts, dog lovers, or anyone who appreciates bold, cinematic wall art.",
      },
    ],
    relatedThemes: ["admiral", "fireman", "police"],
    previewImage: "/images/themes/pilot-preview.webp",
    masterImage:
      "https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/pilot-master.png",
  },
  king: {
    id: "king",
    name: "King",
    tagline: "Long may they reign.",
    story:
      "Your pet has always ruled the household. Now it is official. Draped in ermine fur, adorned with a gold crown and sapphire pendant, your pet sits for their royal portrait in the tradition of 17th century court painters. Regal, timeless, and unmistakably yours.",
    hasNameTag: false,
    printIdeas: [
      "Above a fireplace mantle, the classic royal portrait position",
      "In a living room as a conversation-starting centrepiece",
      "As a housewarming or birthday gift for a pet-obsessed friend",
      "Framed in ornate gold at 65x36cm for full royal impact",
    ],
    faqs: [
      {
        question: "Does the King portrait include my pet's name?",
        answer:
          "The King portrait does not include a name tag. The classical oil painting style keeps the composition clean and regal.",
      },
      {
        question: "What artistic style is the King portrait?",
        answer:
          "The King portrait is rendered as a classical oil painting with rich, warm tones and detailed brushwork, as if painted by a 17th century court artist.",
      },
      {
        question: "What is the background of the King portrait?",
        answer:
          "A deep dark charcoal background with subtle vignette, keeping all focus on the subject, exactly as in classical royal portraiture.",
      },
      {
        question: "Does the King portrait work for cats as well as dogs?",
        answer:
          "Yes. The King portrait works beautifully for both dogs and cats. The costume and composition are designed to suit any pet.",
      },
    ],
    relatedThemes: ["queen", "samurai", "admiral"],
    previewImage: "/images/themes/king-preview.webp",
    masterImage:
      "https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/king-master.png",
  },
  queen: {
    id: "queen",
    name: "Queen",
    tagline: "She has always been royalty.",
    story:
      "Pearl necklaces, a sapphire crown with gold filigree, and a crimson robe with dense gold brocade. Your pet steps into a portrait fit for the grandest of galleries. Painted in the style of the great classical masters, this is wall art that commands a room.",
    hasNameTag: false,
    printIdeas: [
      "Above a bedroom dresser or vanity, elegant and personal",
      "Paired with the King portrait for a matching royal set",
      "As a gift for a cat owner, dog mum, or anyone who spoils their pet",
      "Framed in antique gold at 65x36cm",
    ],
    faqs: [
      {
        question: "Does the Queen portrait include my pet's name?",
        answer:
          "The Queen portrait does not include a name tag. The classical oil painting style keeps the composition elegant and uncluttered.",
      },
      {
        question: "Can I order King and Queen portraits as a matching pair?",
        answer:
          "Yes. The King and Queen portraits share the same background, artistic style, and dimensions, making them a perfect matching pair for display together.",
      },
      {
        question: "What makes the Queen portrait different from the King?",
        answer:
          "The Queen portrait features a sapphire crown with filigree finials, layered pearl necklaces, a lace ruffled collar, and a jewelled brooch clasp, distinct from the King's simpler crown and gold chain.",
      },
      {
        question: "What size should I print the Queen portrait?",
        answer:
          "The landscape file prints at up to 65x36cm (25x14in) with full detail. An antique gold or ornate frame at 50x28cm is a popular choice.",
      },
    ],
    relatedThemes: ["king", "samurai", "vet"],
    previewImage: "/images/themes/queen-preview.webp",
    masterImage:
      "https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/queen-master.png",
  },
  fireman: {
    id: "fireman",
    name: "Fireman",
    tagline: "Brave. Bold. Ready for anything.",
    story:
      "Your pet has always rushed in where others hesitate. Now, dressed in full firefighter gear with their name on the chest patch, they take their rightful place as the hero of the firehouse. A portrait for the brave at heart.",
    hasNameTag: true,
    nameTagFormat: "{{PET_NAME}} on chest patch",
    printIdeas: [
      "In a child's bedroom, bold, colourful, and inspiring",
      "As a gift for a firefighter who loves their pet",
      "In a playroom or family room as a fun conversation piece",
      "Paired with the Police Officer portrait for a first responder set",
    ],
    faqs: [
      {
        question: "Does the Fireman portrait include my pet's name?",
        answer: "Yes. Your pet's name is personalised on the chest patch of the firefighter uniform in the portrait.",
      },
      {
        question: "What is the background of the Fireman portrait?",
        answer: "A dramatic firehouse interior with warm lighting, fire engine details visible in the background.",
      },
      {
        question: "Is the Fireman portrait suitable as a gift?",
        answer:
          "It makes an excellent gift, especially for families with children, firefighters, or anyone with a brave and energetic pet.",
      },
      {
        question: "Can I order Fireman and Police Officer portraits together?",
        answer:
          "Yes. Both share a similar bold style and work well as a matching first responder pair displayed side by side.",
      },
    ],
    relatedThemes: ["police", "pilot", "admiral"],
    previewImage: "/images/themes/fireman-preview.webp",
    masterImage:
      "https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/fireman-master.png",
  },
  police: {
    id: "police",
    name: "Police Officer",
    tagline: "To protect and to sit.",
    story:
      "Badge polished, expression serious, your pet upholds the law with dignity. The Police Officer portrait captures your pet in full uniform with their name on the badge. A portrait that demands respect and raises a smile in equal measure.",
    hasNameTag: true,
    nameTagFormat: "{{PET_NAME}} on chest badge",
    printIdeas: [
      "In a home office or study, authoritative and amusing",
      "As a gift for a police officer, security professional, or law enthusiast",
      "Paired with the Fireman portrait for a matching first responder duo",
      "In a child's room, fun, bold, and character-building",
    ],
    faqs: [
      {
        question: "Does the Police Officer portrait include my pet's name?",
        answer: "Yes. Your pet's name is personalised on the chest badge of the police uniform.",
      },
      {
        question: "What is the background of the Police Officer portrait?",
        answer:
          "A police garage or precinct environment with dramatic lighting, keeping the focus on the uniformed subject.",
      },
      {
        question: "Does this work for cats as well as dogs?",
        answer: "Yes. The Police Officer portrait works for both dogs and cats. The uniform is designed to sit naturally on any pet.",
      },
      {
        question: "What frame style works best for the Police Officer portrait?",
        answer:
          "A dark wood or black frame at 50x28cm gives the portrait a serious, official look that plays up the humour perfectly.",
      },
    ],
    relatedThemes: ["fireman", "pilot", "admiral"],
    previewImage: "/images/themes/police-preview.webp",
    masterImage:
      "https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/police-master.png",
  },
  admiral: {
    id: "admiral",
    name: "Admiral",
    tagline: "Commander of all they survey.",
    story:
      "In the captain's study, among leather-bound charts and brass compasses, your pet commands the fleet with calm authority. The Admiral portrait is a tribute to the dignified, the distinguished, and the quietly magnificent.",
    hasNameTag: true,
    nameTagFormat: "ADMIRAL {{PET_NAME}} on gold breast plate",
    printIdeas: [
      "In a study, library, or home office, distinguished and characterful",
      "As a gift for a navy veteran, sailor, or maritime enthusiast",
      "Above a bookshelf alongside other classic portraits",
      "Framed in dark mahogany at 65x36cm for full naval gravitas",
    ],
    faqs: [
      {
        question: "Does the Admiral portrait include my pet's name?",
        answer:
          'Yes. Your pet\'s name appears on a gold name plate on the left breast of the uniform, reading "ADMIRAL [PET NAME]" in engraved capital letters.',
      },
      {
        question: "What is the background of the Admiral portrait?",
        answer:
          "A dark mahogany wood-panelled captain's study with a harbour-view window, nautical charts, a brass compass, and a framed painting of a tall sailing ship.",
      },
      {
        question: "What frame style suits the Admiral portrait?",
        answer:
          "A dark mahogany or navy blue frame at 65x36cm complements the warm tones of the captain's study beautifully.",
      },
      {
        question: "Is the Admiral portrait suitable as a gift for a sailor or navy veteran?",
        answer:
          "It makes an exceptional gift. The maritime setting and distinguished uniform make it a meaningful and humorous tribute for anyone with a connection to the sea.",
      },
    ],
    relatedThemes: ["pilot", "king", "fireman"],
    previewImage: "/images/themes/admiral-preview.webp",
    masterImage:
      "https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/admiral-master.png",
  },
  vet: {
    id: "vet",
    name: "Veterinarian",
    tagline: "Doctor's orders: be adorable.",
    story:
      "Your pet has always had a gift for healing hearts. Now, in white lab coat and stethoscope, they step into the clinic as the most qualified professional in the room. DR. [PET NAME] is ready to see patients.",
    hasNameTag: true,
    nameTagFormat: "DR. {{PET_NAME}} on right lapel badge",
    printIdeas: [
      "In a vet clinic waiting room, guaranteed to delight patients",
      "As a gift for a vet, vet nurse, or animal lover",
      "In a home office or study, professional and playful",
      "Framed in white or light wood at 50x28cm for a clean clinical look",
    ],
    faqs: [
      {
        question: "Does the Veterinarian portrait include my pet's name?",
        answer:
          'Yes. Your pet\'s name appears on the white name badge on the right lapel of the lab coat, reading "DR. [PET NAME]" with a small paw print icon.',
      },
      {
        question: "What is the background of the Veterinarian portrait?",
        answer:
          "A clean, modern veterinary examination room with stainless steel equipment, medical supply cabinets, and a clinical white environment.",
      },
      {
        question: "Is the Veterinarian portrait a good gift for a vet?",
        answer:
          "It is an ideal gift for any vet, vet nurse, or animal health professional. Both meaningful and genuinely funny.",
      },
      {
        question: "What frame style works for the Veterinarian portrait?",
        answer:
          "A clean white or light oak frame at 50x28cm suits the clinical brightness of the portrait. It also works well unframed as a print.",
      },
    ],
    relatedThemes: ["police", "fireman", "queen"],
    previewImage: "/images/themes/vet-preview.webp",
    masterImage:
      "https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/vet-master.png",
  },
  samurai: {
    id: "samurai",
    name: "Samurai",
    tagline: "Noble. Fearless. Legendary.",
    story:
      "Seated among autumn mountains, katana resting at their side, your pet embodies the calm strength of a samurai warrior. Painted in rich oil painting style with gold armour and crimson sash, this is the most striking portrait in the collection.",
    hasNameTag: false,
    printIdeas: [
      "As a dramatic statement piece above a sofa or bed",
      "In a home with Japanese-inspired or minimal interior design",
      "As a gift for a martial arts enthusiast or Japan lover",
      "Framed in black lacquer at 65x36cm for maximum visual impact",
    ],
    faqs: [
      {
        question: "Does the Samurai portrait include my pet's name?",
        answer:
          "The Samurai portrait does not include a name tag. The costume design is kept authentic to the classical samurai aesthetic with no text elements.",
      },
      {
        question: "What is the background of the Samurai portrait?",
        answer:
          "A sweeping East Asian mountain landscape with autumn foliage in vivid red and orange, a misty valley, and snow-capped peaks in the distance, painted in a rich classical style.",
      },
      {
        question: "What artistic style is the Samurai portrait?",
        answer:
          "The Samurai portrait uses a rich painterly oil painting aesthetic: warm golden armour, detailed fur rendering, and a dramatic landscape background with high colour contrast.",
      },
      {
        question: "What frame style suits the Samurai portrait?",
        answer:
          "A black lacquer or dark wood frame at 65x36cm creates a striking gallery-quality display. The warm autumn tones also work well with natural wood frames.",
      },
    ],
    relatedThemes: ["king", "queen", "pilot"],
    previewImage: "/images/themes/samurai-preview.webp",
    masterImage:
      "https://mblnpneghvkfmbgmbrco.supabase.co/storage/v1/object/public/images/themes/samurai-master.png",
  },
}

/** Matches the order on /create (theme picker). */
export const THEME_DISPLAY_ORDER = [
  "fireman",
  "police",
  "admiral",
  "vet",
  "king",
  "queen",
  "samurai",
  "pilot",
] as const

export const themeIds = Object.keys(themes)

export function getTheme(slug: string): Theme | undefined {
  return themes[slug]
}

/** Used when Supabase prompt has a name tag but no {{PET_NAME}} and no custom `name_tag_instruction`. */
export const DEFAULT_NAMETAG_INSTRUCTION =
  "Render the pet's name {{PET_NAME}} clearly on the theme's name badge, patch, or plate where it belongs for this costume."
