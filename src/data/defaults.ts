import heroBridalImg from '@/src/assets/images/hero_bridal_studio_1795097235135.jpg';
import bridalRoyalImg from '@/src/assets/images/bridal_package_royal_1795097234305.jpg';
import partyGlamImg from '@/src/assets/images/party_glam_editorial_1795097234924.jpg';
import cosmeticsFlatlayImg from '@/src/assets/images/cosmetics_luxury_flatlay_1795097234312.jpg';
import hairBridalImg from '@/src/assets/images/hair_styling_bridal_1795097233740.jpg';
import {
  BridalPackage,
  BusinessSettings,
  GalleryCategory,
  GalleryItem,
  Offer,
  Review,
  Service,
} from '@/src/types';

export const BRAND_IMAGES = {
  heroBridal: heroBridalImg,
  bridalRoyal: bridalRoyalImg,
  partyGlam: partyGlamImg,
  cosmeticsFlatlay: cosmeticsFlatlayImg,
  hairBridal: hairBridalImg,
};

export const VERIFIED_BUSINESS_INFO = {
  name: 'KD Makeovers & Cosmetics',
  shortName: 'KD Makeovers',
  tagline: 'Redefine Beauty',
  owner: 'Komal Kumari',
  phoneDisplay: '+91 96503 49357',
  phoneRaw: '+919650349357',
  whatsappNumber: '919650349357',
  email: 'komalbsc@gmail.com',
  addressLine1: '41ft Road Kamal Vihar, Sant Nagar,',
  addressLine2: 'Burari, Delhi-110084',
  fullAddress: '41ft Road Kamal Vihar, Sant Nagar, Burari, Delhi-110084',
  hoursSummary: 'Mon - Sun: 10:00 AM - 08:30 PM',
  mapDirectionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=KD+Makeovers+%26+Cosmetics,+Sant+Nagar,+Delhi',
  mapShareUrl: 'https://share.google/xIt4UThOQCeSDPB8I',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=KD%20Makeovers%20%26%20Cosmetics%20Sant%20Nagar%20Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed',
  googleReviewsUrl:
    'https://www.google.com/search?q=kd+makeovers+%26+cosmetics#lrd=0x390cff595fb9fcdd:0xbc93f994fe8c0caa,1,,,,',
};

export const ALL_SERVICE_CATEGORIES = [
  'Bridal Makeup',
  'Engagement Makeup',
  'Party Makeup',
  'Reception Makeup',
  'HD Makeup',
  'Airbrush Makeup',
  'Hairstyling',
  'Saree Draping',
  'Facial',
  'Cleanup',
  'Hair Treatments',
  'Haircuts',
  'Hair Colour',
  'Waxing',
  'Threading',
  'Manicure',
  'Pedicure',
  'Nail Art',
  'Cosmetics',
] as const;

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  'Bridal Makeup',
  'Reception Makeup',
  'Engagement Makeup',
  'Party Makeup',
  'Hairstyling',
  'Before and After',
];

export const OFFICIAL_STUDIO_LOGO = '/kd-logo-round.png';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: VERIFIED_BUSINESS_INFO.name,
  tagline: VERIFIED_BUSINESS_INFO.tagline,
  logoUrl: OFFICIAL_STUDIO_LOGO,
  phone: VERIFIED_BUSINESS_INFO.phoneDisplay,
  whatsappNumber: VERIFIED_BUSINESS_INFO.whatsappNumber,
  email: VERIFIED_BUSINESS_INFO.email,
  address: VERIFIED_BUSINESS_INFO.fullAddress,
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  openingTime: '10:00',
  closingTime: '20:30',
  breakStart: '14:00',
  breakEnd: '14:30',
  holidays: [],
  defaultSlotDuration: 60,
  bookingAdvancePercent: 25,
  cancellationPolicy:
    'Free rescheduling up to 48 hours before your appointment. Bridal bookings require advance confirmation with the studio.',
  instagramUrl: 'https://www.instagram.com/',
  facebookUrl: 'https://www.facebook.com/',
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'bridal-makeup',
    name: 'Signature Bridal Makeup',
    description:
      'Complete bridal transformation including hair styling, dupatta & saree draping, lashes, and long-wear HD bridal makeup.',
    price: '₹10,000 onwards',
    numericPrice: 10000,
    durationMinutes: 180,
    category: 'Bridal Makeup',
    imageUrl: heroBridalImg,
    active: true,
    featured: true,
  },
  {
    id: 'engagement-makeup',
    name: 'Engagement Makeup',
    description:
      'Soft, radiant luminous finish tailored for ring ceremony and engagement photography under indoor and outdoor lighting.',
    price: '₹7,000 onwards',
    numericPrice: 7000,
    durationMinutes: 150,
    category: 'Engagement Makeup',
    imageUrl: partyGlamImg,
    active: true,
    featured: true,
  },
  {
    id: 'party-makeup',
    name: 'Party & Occasion Makeup',
    description:
      'Polished, camera-ready makeup look for family weddings, sangeet nights, cocktail evenings, and festive celebrations.',
    price: '₹1,200 onwards',
    numericPrice: 1200,
    durationMinutes: 90,
    category: 'Party Makeup',
    imageUrl: partyGlamImg,
    active: true,
    featured: true,
  },
  {
    id: 'reception-makeup',
    name: 'Reception Glam Makeup',
    description:
      'Sculpted evening glamour featuring modern smokey or rose-gold eyes, sleek hairstyling, and full outfit pinning.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 150,
    category: 'Reception Makeup',
    imageUrl: heroBridalImg,
    active: true,
    featured: false,
  },
  {
    id: 'hd-makeup',
    name: 'HD Pro Studio Makeup',
    description:
      'High-definition seamless complexion artistry engineered for 4K wedding photography and zero-flashback finish.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 120,
    category: 'HD Makeup',
    imageUrl: partyGlamImg,
    active: true,
    featured: false,
  },
  {
    id: 'airbrush-makeup',
    name: 'Waterproof Airbrush Makeup',
    description:
      'Feather-light silicone airbrush application offering breathable, sweat-resistant coverage for long wedding ceremonies.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 150,
    category: 'Airbrush Makeup',
    imageUrl: heroBridalImg,
    active: true,
    featured: false,
  },
  {
    id: 'hairstyling',
    name: 'Bridal & Party Hairstyling',
    description:
      'Professional hair styling from traditional floral gajra buns and messy braids to soft Hollywood waves.',
    price: '₹500 onwards',
    numericPrice: 500,
    durationMinutes: 60,
    category: 'Hairstyling',
    imageUrl: hairBridalImg,
    active: true,
    featured: true,
  },
  {
    id: 'saree-draping',
    name: 'Saree & Bridal Dupatta Draping',
    description:
      'Precision pleating, double-dupatta bridal pinning, and traditional or modern saree silhouettes.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 45,
    category: 'Saree Draping',
    imageUrl: bridalRoyalImg,
    active: true,
    featured: false,
  },
  {
    id: 'facial-ritual',
    name: 'Luxury Glow Facial',
    description:
      'Deep hydration, lymphatic massage, and radiance-boosting mask tailored to your skin type ahead of events.',
    price: 'Flexible',
    numericPrice: 0,
    durationMinutes: 60,
    category: 'Facial',
    imageUrl: cosmeticsFlatlayImg,
    active: true,
    featured: false,
  },
  {
    id: 'skin-cleanup',
    name: 'Purifying Skin Cleanup',
    description:
      'Gentle exfoliation, blackhead extraction, and soothing hydration for refreshed everyday skin clarity.',
    price: 'Flexible',
    numericPrice: 0,
    durationMinutes: 45,
    category: 'Cleanup',
    imageUrl: cosmeticsFlatlayImg,
    active: true,
    featured: false,
  },
  {
    id: 'hair-treatments',
    name: 'Hair Spa & Keratin Rituals',
    description:
      'Nourishing hair spa, smoothening, and deep repair treatments for frizz-free gloss and strength.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 90,
    category: 'Hair Treatments',
    imageUrl: hairBridalImg,
    active: true,
    featured: false,
  },
  {
    id: 'haircuts',
    name: 'Precision Haircut & Blowdry',
    description:
      'Customized layers, face-framing cuts, and bouncy salon blowdry finish.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 45,
    category: 'Haircuts',
    imageUrl: hairBridalImg,
    active: true,
    featured: false,
  },
  {
    id: 'hair-colour',
    name: 'Global Colour & Balayage',
    description:
      'Root touch-ups, rich dimensional highlights, and ammonia-gentle tones customized to your undertone.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 120,
    category: 'Hair Colour',
    imageUrl: hairBridalImg,
    active: true,
    featured: false,
  },
  {
    id: 'waxing',
    name: 'Rica & Honey Waxing',
    description:
      'Hygienic full-arm, leg, and underarm waxing using gentle skin-calming formulations.',
    price: 'Flexible',
    numericPrice: 0,
    durationMinutes: 45,
    category: 'Waxing',
    imageUrl: cosmeticsFlatlayImg,
    active: true,
    featured: false,
  },
  {
    id: 'threading',
    name: 'Eyebrow Sculpting & Threading',
    description:
      'Symmetric arch shaping and gentle facial threading tailored to your facial structure.',
    price: 'Flexible',
    numericPrice: 0,
    durationMinutes: 30,
    category: 'Threading',
    imageUrl: partyGlamImg,
    active: true,
    featured: false,
  },
  {
    id: 'manicure',
    name: 'Spa Manicure',
    description:
      'Cuticle care, exfoliating hand massage, nail shaping, and long-wear polish.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 45,
    category: 'Manicure',
    imageUrl: cosmeticsFlatlayImg,
    active: true,
    featured: false,
  },
  {
    id: 'pedicure',
    name: 'Luxury Spa Pedicure',
    description:
      'Warm soak, heel renewal, foot massage, and glossy finish for soft, pampered feet.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 45,
    category: 'Pedicure',
    imageUrl: cosmeticsFlatlayImg,
    active: true,
    featured: false,
  },
  {
    id: 'nail-art',
    name: 'Gel Extensions & Bridal Nail Art',
    description:
      'Custom acrylic/gel nail extensions, French tips, chrome finishes, and bridal stone art.',
    price: 'On Consultation',
    numericPrice: 0,
    durationMinutes: 90,
    category: 'Nail Art',
    imageUrl: cosmeticsFlatlayImg,
    active: true,
    featured: false,
  },
  {
    id: 'cosmetics-consult',
    name: 'Cosmetics & Shade Consultation',
    description:
      'Curated beauty essentials, bridal vanity kits, and personalized undertone foundation matching.',
    price: 'Flexible',
    numericPrice: 0,
    durationMinutes: 30,
    category: 'Cosmetics',
    imageUrl: cosmeticsFlatlayImg,
    active: true,
    featured: false,
  },
];

export const DEFAULT_PACKAGES: BridalPackage[] = [
  {
    id: 'pkg-bridal-signature',
    name: 'Royal Bridal Signature Package',
    tier: 'Bridal',
    price: '₹10,000 onwards',
    numericPrice: 10000,
    includedServices: [
      'Signature HD Bridal Makeup',
      'Bridal Hair Bun & Fresh Gajra Styling',
      'Double Dupatta & Lehenga Draping',
      'Faux Mink Lashes & Nail Polish',
      'Touch-up Lip & Setting Kit',
    ],
    imageUrl: heroBridalImg,
    description:
      'Our flagship bridal transformation crafted by Komal Kumari for wedding ceremonies, ensuring radiant photography and all-night comfort.',
    specialOffer: 'Complimentary Trial Consultation on Advance Booking',
    durationMinutes: 210,
    active: true,
  },
  {
    id: 'pkg-engagement-radiance',
    name: 'Engagement & Ring Ceremony Look',
    tier: 'Engagement',
    price: '₹7,000 onwards',
    numericPrice: 7000,
    includedServices: [
      'Luminous HD Engagement Makeup',
      'Soft Waves or Braided Floral Hairstyling',
      'Gown / Saree Pinning & Draping',
      'Lashes & Dewy Glow Prep',
    ],
    imageUrl: partyGlamImg,
    description:
      'Soft romantic tones with sculpted shimmer designed specifically for engagement ceremonies and pre-wedding functions.',
    specialOffer: 'Includes Hair Accessories Styling',
    durationMinutes: 150,
    active: true,
  },
  {
    id: 'pkg-pre-bridal-ritual',
    name: 'Pre-Bridal Glow Ritual',
    tier: 'Pre-Bridal',
    price: 'On Consultation',
    numericPrice: 0,
    includedServices: [
      'Radiance Bridal Facial & Cleanup',
      'Full Body Rica Waxing',
      'Spa Manicure & Pedicure',
      'Hair Spa & Eyebrow Sculpting',
    ],
    imageUrl: bridalRoyalImg,
    description:
      'A multi-session pre-wedding skin, hair, and body preparation schedule planned 2–3 weeks before your wedding date.',
    specialOffer: 'Customised to Skin Type & Wedding Timeline',
    durationMinutes: 240,
    active: true,
  },
  {
    id: 'pkg-wedding-guest',
    name: 'Bridesmaid & Family Party Package',
    tier: 'Wedding Guest',
    price: '₹1,200 onwards',
    numericPrice: 1200,
    includedServices: [
      'Party Glam Makeup',
      'Hairstyling (Curls / Sleek Bun)',
      'Saree / Suit Dupatta Pinning',
    ],
    imageUrl: hairBridalImg,
    description:
      'Coordinated group styling for sisters, mothers, and wedding guests attending sangeet, haldi, or reception.',
    specialOffer: 'Group Booking Priority Slots Available',
    durationMinutes: 90,
    active: true,
  },
  {
    id: 'pkg-custom-bespoke',
    name: 'Bespoke Multi-Event Bridal Suite',
    tier: 'Custom',
    price: 'On Consultation',
    numericPrice: 0,
    includedServices: [
      'Haldi / Mehndi Fresh Look',
      'Engagement / Sangeet Glam',
      'Wedding Day HD or Airbrush Bridal',
      'Reception Signature Makeover',
    ],
    imageUrl: cosmeticsFlatlayImg,
    description:
      'Tailored multi-ceremony coverage combining pre-bridal care and every wedding function look under one dedicated schedule.',
    specialOffer: 'Direct Consultation with Komal Kumari',
    durationMinutes: 180,
    active: true,
  },
];

export const DEFAULT_ACADEMY_COURSES = [
  {
    id: 'course-makeup',
    title: 'Professional Makeup Artist',
    desc: 'Hands-on training in HD, Airbrush, color theory, and traditional Indian bridal looks.',
    duration: '45 Days',
    image: heroBridalImg,
  },
  {
    id: 'course-hair',
    title: 'Hair Styling Masterclass',
    desc: 'Master traditional bridal buns, textured waves, extensions, and floral hair artistry.',
    duration: '30 Days',
    image: hairBridalImg,
  },
  {
    id: 'course-nails',
    title: 'Professional Nail Art',
    desc: 'Learn nail extensions, builder gel, chrome finishes, and bridal nail artistry from scratch.',
    duration: '15 Days',
    image: cosmeticsFlatlayImg,
  },
  {
    id: 'course-beautician',
    title: 'Professional Beautician',
    desc: 'Comprehensive curriculum covering skin analysis, facials, waxing, and salon hygiene.',
    duration: '60 Days',
    image: bridalRoyalImg,
  },
  {
    id: 'course-custom',
    title: 'Custom Skill Training',
    desc: 'Focused self-grooming or skill-upgrade modules tailored around your schedule.',
    duration: 'Custom',
    image: partyGlamImg,
  },
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'showcase-bridal-1',
    url: heroBridalImg,
    title: 'Crimson Heritage Bridal Look',
    category: 'Bridal Makeup',
    caption: 'Studio Editorial Showcase — HD Bridal Artistry & Kundan Styling',
    isActualClientWork: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'showcase-party-1',
    url: partyGlamImg,
    title: 'Rose-Gold Evening Reception',
    category: 'Reception Makeup',
    caption: 'Studio Editorial Showcase — Soft Luminous Party & Reception Finish',
    isActualClientWork: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'showcase-hair-1',
    url: hairBridalImg,
    title: 'Jasmine Gajra Bridal Bun',
    category: 'Hairstyling',
    caption: 'Studio Editorial Showcase — Traditional Braided Bun with Rose-Gold Pins',
    isActualClientWork: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'showcase-bridal-2',
    url: bridalRoyalImg,
    title: 'Bridal Vanity & Jewellery Prep',
    category: 'Engagement Makeup',
    caption: 'Studio Editorial Showcase — Curated Luxury Bridal Cosmetics & Jewellery',
    isActualClientWork: false,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Ritu Varma',
    rating: 5,
    comment:
      "Komal ma'am is truly the best! She did my bridal makeup and I looked like a dream. Every detail was perfect. The studio in Sant Nagar is very professional.",
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-2',
    name: 'Suman Rawat',
    rating: 5,
    comment:
      'Professional staff and excellent services. Best bridal studio in Burari/Sant Nagar area. Their cosmetics are also of very high quality.',
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-3',
    name: 'Meenakshi Singh',
    rating: 5,
    comment:
      'Highly recommended for party makeup. Very natural finish and lasted the whole night. Thank you KD Makeovers!',
    approved: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'offer-bridal-consult',
    title: 'Bridal Trial & Consultation Offer',
    description:
      'Enjoy a complimentary shade matching & bridal look planning session with Komal Kumari when reserving your wedding date.',
    code: 'KDBRIDE',
    offerType: 'Bridal Special',
    discountLabel: 'Complimentary Trial',
    active: true,
    createdAt: new Date().toISOString(),
  },
];
