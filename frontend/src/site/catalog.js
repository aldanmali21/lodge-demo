// Content + helpers for the demo guest website of "Kingfisher Crater Lodge" (a fictional lodge).
// Prices and availability come from the same (mock) API the lodge management system uses.
export const LODGE = {
  name: 'Kingfisher Crater Lodge',
  short: 'Kingfisher',
  tagline: 'Where the savannah meets the crater lake',
  phone: '+256 700 000 000',
  whatsapp: '256700000000',
  email: 'stay@kingfisherlodge.example',
  place: 'Queen Elizabeth area, Western Uganda',
  kicker: 'Safari Lodge · Western Uganda',
  blurb: 'A small safari lodge on the shore of a quiet crater lake.',
}

// Per-prospect demo: open the site with ?lodge=royal-park to re-brand the same mock-up with another property's name.
// The choice is kept for the browser session so it survives page navigation. Sample data only.
const BRANDS = {
  'royal-park': {
    name: 'Royal Park Hotel',
    short: 'Royal Park',
    tagline: 'Comfortable stays in the heart of Jinja',
    email: 'stay@royalpark.example',
    place: '32 Kutch Rd, Jinja, Uganda',
    phone: '+256 776 501 879',
    whatsapp: '256776501879',
    hotel: true,
    kicker: 'Hotel · Jinja',
    blurb: 'A welcoming hotel in Jinja.',
    sub: 'Book your room online, pay a deposit by Mobile Money, and arrive to a warm welcome.',
    hero: '/site/deck.jpg',
    heroAlt: 'Hotel pool and terrace',
    extraGuest: 30000, // UGX per extra guest per night above 2 (demo assumption)
    welcome: 'Comfortable air-conditioned rooms with breakfast, free Wi-Fi and free parking, a pool, and a front desk that knows Jinja and the Nile inside out. In the centre of town on Kutch Road, close to the market and the river, and easy for business or leisure.',
    stats: [['4.1', 'Google rating'], ['146', 'Guest reviews'], ['24/7', 'Front desk']],
    features: [['pool', 'Pool', 'Relax after the day'], ['food', 'Free breakfast', 'Included with your room'], ['events', 'Free parking', 'On site'], ['wifi', 'Free Wi-Fi', 'In every room']],
    roomsKicker: 'Stay with us', roomsSub: 'Live availability for your dates. Prices per room per night, in Ugandan shillings.',
    roomsHero: 'A double room and a king room, both with breakfast included, in the centre of Jinja.',
    roomNote: 'Every room has crisp linen, a hot-water shower, air conditioning or fan, a work desk and free Wi-Fi, a short walk from the restaurant and bar.',
    expKicker: 'Hotel services', expTitle: 'More than a room', expSub: 'Book with your room, or ask the front desk when you arrive. Prices are per person unless stated.',
    expHero: 'Dining, meetings, transfers and Nile outings, arranged by our front desk.',
    diningTitle: 'Restaurant & bar', diningHead: 'Good food, any time of day', diningText: 'Our restaurant serves a full breakfast, business lunches and dinner, with a bar for evening drinks. Open to in-house guests and visitors from town, and we cater for vegetarian, vegan and gluten-free guests.',
    stories: [['Easy to book online and the deposit by mobile money was simple. The room was clean and the front desk helped with our transfer to Entebbe.', 'Eleanor V.', 'Executive Suite'], ['We held a two-day team workshop in the conference room. Good Wi-Fi, lunch on time and friendly staff throughout.', 'Daniel K.', 'Deluxe Double'], ['Perfect base for a weekend on the Nile. We booked rafting through the front desk and the restaurant was great.', 'The Okello family', 'Family Room']],
    ctaTitle: 'Ready for Jinja?', ctaSub: 'Reserve in minutes. Free cancellation up to 48 hours before arrival.',
    aboutTitle: 'A town hotel with a warm welcome',
    about: 'Royal Park Hotel welcomes guests to Jinja with comfortable rooms, honest food and warm hosting. This page is a free sample mock-up made by Lodgely to show how your own booking website could look, using sample rooms and prices.',
  },
  secrets: {
    name: 'Secrets Guest House',
    short: 'Secrets',
    hotel: true,
    secrets: true,
    tagline: 'Your quiet garden retreat in Entebbe',
    email: 'stay@secretsguesthouse.example',
    place: 'Plot 23 Kyanvubu Road, Entebbe, Uganda',
    phone: '+256 779 273 979',
    whatsapp: '256779273979',
    kicker: 'Guest House · Entebbe',
    blurb: 'A quiet, welcoming garden guest house a short drive from Entebbe International Airport.',
    sub: 'Rest easy before or after your flight. Book your room online, pay a deposit by Mobile Money, and we will be waiting with the gate open.',
    hero: '/site/canopy.jpg',
    heroAlt: 'Guest room with mosquito nets and warm wood floors',
    welcomeTitle: 'A calm place to land in Entebbe',
    welcomeImg: '/site/deluxe-double.jpg',
    welcomeAlt: 'Deluxe guest room',
    servicesTitle: 'Guest services',
    extraGuest: 25000,
    welcome: 'Secrets Guest House is a small, calm place to land. Spotless rooms with comfortable beds, a peaceful garden, home-style breakfast and a team that will arrange your airport pick-up, a late check-in after a delayed flight, or a day out in Entebbe. Guests rate us 4.5 on Google across more than 200 reviews, and most of them tell us the same thing: the staff made the difference.',
    stats: [['4.5', 'Google rating'], ['219', 'Guest reviews'], ['24/7', 'Airport pick-ups']],
    features: [['pool', 'Peaceful garden', 'Quiet residential street'], ['food', 'Home-style breakfast', 'Fresh, local, made to order'], ['events', 'Airport shuttle', 'Pick-up & drop-off on request'], ['wifi', 'Free Wi-Fi', 'In every room']],
    roomsKicker: 'Stay with us', roomsSub: 'Live availability for your dates. Prices per room per night, in Ugandan shillings.',
    roomsHero: 'Clean, comfortable rooms in a quiet garden setting, minutes from the airport.',
    roomNote: 'Every room has crisp linen, mosquito nets, a hot-water shower, free Wi-Fi and daily housekeeping, with breakfast served in the garden dining area.',
    expKicker: 'Guest services', expTitle: 'We take care of the details', expSub: 'Arrange with your booking, or ask the front desk. Prices are per person unless stated.',
    expHero: 'Airport transfers, meals, laundry and day trips around Entebbe, arranged by our team.',
    diningTitle: 'Meals & garden', diningHead: 'Breakfast, lunch and dinner', diningText: 'Home-style Ugandan and international dishes, cooked fresh and served in the garden or in your room. Tell us about any dietary needs when you book.',
    stories: [['The staff were so helpful when our flight changed. They moved our booking without fuss and the breakfast was excellent.', 'Guest review', 'Paraphrased from Google'], ['Very clean, comfortable beds and a peaceful garden. Easy to arrange our airport transfer.', 'Guest review', 'Paraphrased from Google'], ['Friendly people, great local food and a quiet street. Exactly what we needed after a long journey.', 'Guest review', 'Paraphrased from Google']],
    ctaTitle: 'Landing in Entebbe?', ctaSub: 'Reserve in minutes and we will plan your arrival with you.',
    aboutTitle: 'A calm, caring place to stay',
    about: 'Secrets Guest House welcomes travellers to Entebbe with clean rooms, honest food and genuine hospitality. This page is a free sample mock-up made by Lodgely to show how your own booking website could look. Rooms, prices and photos are samples to be replaced with your own.',
  },
}
try {
  const q = new URLSearchParams(window.location.search).get('lodge')
  if (q) sessionStorage.setItem('lodge-brand', q)
  const brand = BRANDS[q || sessionStorage.getItem('lodge-brand')]
  if (brand) Object.assign(LODGE, brand)
} catch { /* no browser storage: keep the default brand */ }

const P = '/site/'
const shared = [P + 'deck.jpg', P + 'lodge.jpg']
export const ROOM_INFO = {
  'Standard Double': { photo: P + 'standard-double.jpg', gallery: [P + 'standard-double.jpg', P + 'cabin.jpg', ...shared], beds: '1 double bed', size: '28 m²', blurb: 'A calm, light-filled room with a garden-facing window and everything you need for a restful safari stay.', perks: ['Garden view', 'Free Wi-Fi', 'Breakfast included'] },
  'Standard Twin': { photo: P + 'standard-twin.jpg', gallery: [P + 'standard-twin.jpg', P + 'tent-bed.jpg', ...shared], beds: '2 single beds', size: '28 m²', blurb: 'Two comfortable single beds, ideal for friends or colleagues travelling together.', perks: ['Garden view', 'Free Wi-Fi', 'Breakfast included'] },
  'Deluxe Double': { photo: P + 'deluxe-double.jpg', gallery: [P + 'deluxe-double.jpg', P + 'canopy.jpg', ...shared], beds: '1 king bed', size: '36 m²', blurb: 'Warm timber finishes, a private veranda and a king bed dressed in soft linen.', perks: ['Private veranda', 'Lake glimpse', 'Breakfast included'] },
  'Deluxe Twin': { photo: P + 'deluxe-twin.jpg', gallery: [P + 'deluxe-twin.jpg', P + 'canopy.jpg', ...shared], beds: '2 large single beds', size: '36 m²', blurb: 'Spacious twin room with floor-to-ceiling doors opening onto a shaded veranda.', perks: ['Private veranda', 'Lake glimpse', 'Breakfast included'] },
  'Family Room': { photo: P + 'family.jpg', gallery: [P + 'family.jpg', P + 'tent-int.jpg', ...shared], beds: '1 king + 2 single beds', size: '52 m²', blurb: 'Space for the whole family with a separate sleeping area and a cosy lounge corner.', perks: ['Sleeps 4', 'Lounge area', 'Breakfast included'] },
  'Executive Suite': { photo: P + 'executive.jpg', gallery: [P + 'executive.jpg', P + 'canopy.jpg', ...shared], beds: '1 king bed', size: '64 m²', blurb: 'A light, open-plan suite with a lounge, a deep soaking tub and views over the lake.', perks: ['Lake view', 'Soaking tub', 'Breakfast included'] },
  'Honeymoon Suite': { photo: P + 'honeymoon.jpg', gallery: [P + 'honeymoon.jpg', P + 'tent-int.jpg', ...shared], beds: '1 king bed', size: '72 m²', blurb: 'Our most romantic suite: a private deck above the water, sunset views and champagne on arrival.', perks: ['Private deck', 'Champagne on arrival', 'Breakfast included'] },
}
export const fallbackInfo = { photo: P + 'lodge.jpg', gallery: [P + 'lodge.jpg'], beds: '', size: '', blurb: '', perks: [] }
export const slugOf = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
export const typeFromSlug = (s) => Object.keys(ROOM_INFO).find(t => slugOf(t) === s)

export const ALL_AMENITIES = ['Hot-water rain shower', 'Free fast Wi-Fi', 'Mosquito nets', 'Tea & coffee station', 'Daily housekeeping', 'In-room safe', 'Breakfast included', 'Airport transfer on request']

export const EXPERIENCES = [
  { id: 'drive', img: P + 'safari.jpg', title: 'Guided game drives', time: '2–3 hrs', price: 120, text: 'Dawn and dusk drives with expert guides through open savannah and acacia woodland. Lions, elephants, buffalo and more.' },
  { id: 'boat', img: P + 'elephant.jpg', title: 'Lake boat cruise', time: '2 hrs', price: 85, text: 'Glide along the channel at golden hour past hippos, elephants drinking at the shore and a riot of birdlife.' },
  { id: 'gorilla', img: P + 'gorilla.jpg', title: 'Primate & forest trek', time: 'Full day', price: 180, text: 'A guided trek into the forest to meet our primate neighbours, with a packed lunch from the lodge kitchen.' },
  { id: 'walk', img: P + 'giraffe.jpg', title: 'Nature walk & birding', time: '2 hrs', price: 40, text: 'Gentle early-morning walks around the grounds with a guide who knows every bird by its call.' },
  { id: 'fire', img: P + 'firepit.jpg', title: 'Sundowners & campfire', time: 'Evenings', price: 0, text: 'Every evening: a fire on the shore, cold drinks and the sky doing its thing. Included for all guests.' },
  { id: 'culture', img: P + 'zebra.jpg', title: 'Community & culture visit', time: 'Half day', price: 30, text: 'Meet local craftspeople, taste village cooking and hear the stories of the land. Proceeds support the school.' },
]

export const MENU = [
  { course: 'Breakfast', items: [['Lakeside breakfast buffet', 'Tropical fruit, eggs to order, fresh pastries, rolex & local coffee', 35000], ['Sunrise rolex', 'Chapati, eggs and garden vegetables', 12000]] },
  { course: 'Lunch & dinner', items: [['Grilled Nile perch', 'Lemon butter, matoke mash, kachumbari', 52000], ['Kingfisher nyama choma', 'Slow-grilled goat or beef, posho, groundnut sauce', 48000], ['Luwombo of chicken', 'Steamed in banana leaf, the traditional way', 45000], ['Vegetable tagine', 'Roasted seasonal vegetables, couscous, herbs', 36000]] },
  { course: 'Drinks & dessert', items: [['Passion fruit sundowner', 'Fresh passion juice, local gin, lime', 22000], ['Ugandan coffee flight', 'Three single-origin pours', 15000], ['Chocolate safari tart', 'Dark chocolate, vanilla bean cream', 18000]] },
]

export const GALLERY = [
  { src: P + 'hero.jpg', cat: 'Landscape', alt: 'Acacia tree at sunset' },
  { src: P + 'lodge.jpg', cat: 'Lodge', alt: 'Pool and deck' },
  { src: P + 'giraffe.jpg', cat: 'Wildlife', alt: 'Giraffe in the savannah' },
  { src: P + 'canopy.jpg', cat: 'Rooms', alt: 'Canopy bed suite' },
  { src: P + 'elephant.jpg', cat: 'Wildlife', alt: 'Elephant' },
  { src: P + 'food-meat.jpg', cat: 'Dining', alt: 'Roasted meat' },
  { src: P + 'glamp.jpg', cat: 'Lodge', alt: 'Tented suite' },
  { src: P + 'lioness.jpg', cat: 'Wildlife', alt: 'Lioness resting' },
  { src: P + 'deluxe-double.jpg', cat: 'Rooms', alt: 'Deluxe room' },
  { src: P + 'gorilla.jpg', cat: 'Wildlife', alt: 'Mountain gorilla' },
  { src: P + 'food-grill.jpg', cat: 'Dining', alt: 'Grilled skewers' },
  { src: P + 'safari.jpg', cat: 'Landscape', alt: 'Game drive at sunset' },
  { src: P + 'tent-int.jpg', cat: 'Rooms', alt: 'Tent interior' },
  { src: P + 'zebra.jpg', cat: 'Wildlife', alt: 'Zebras' },
  { src: P + 'firepit.jpg', cat: 'Lodge', alt: 'Campfire area' },
  { src: P + 'food-rice.jpg', cat: 'Dining', alt: 'Spiced rice and plantain' },
  { src: P + 'honeymoon.jpg', cat: 'Rooms', alt: 'Honeymoon deck' },
  { src: P + 'buffalo.jpg', cat: 'Wildlife', alt: 'Buffalo herd' },
]

export const TAX_RATE = 0.23 // 5% tourism levy + 18% VAT — same as the lodge system
export const UGX_RATE = 3700 // system stores USD; the website shows UGX

const grp = (n) => Math.round(n).toLocaleString('en-US')
export const ugx = (usd) => `UGX ${grp(usd * UGX_RATE)}`      // from a USD amount
export const ugxRaw = (n) => `UGX ${grp(n)}`                   // already UGX
export const money = ugx
// USD per night added for guests beyond 2 (only when the brand sets an extra-guest charge)
export const extraGuestUsd = (guests) => (LODGE.extraGuest ? Math.max(0, Number(guests) - 2) * LODGE.extraGuest / UGX_RATE : 0)

export const toInputDate = (d) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const fmtDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
export const nightsBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000))
// Same arrival / departure times the lodge uses (check-in 14:00, check-out 10:00)
export const stamp = (s, h) => new Date(`${s}T${String(h).padStart(2, '0')}:00:00`).toISOString()

// Royal Park is a town hotel in Jinja, not a safari lodge: swap lodge-style content for hotel content.
try {
  if (LODGE.hotel) {
    EXPERIENCES.splice(0, EXPERIENCES.length,
      { id: 'dining', img: P + 'food-grill.jpg', title: 'Restaurant & bar', time: 'Daily', price: 0, text: 'Breakfast, business lunch and dinner, plus evening drinks at the bar. Charge it to your room or pay at the table.' },
      { id: 'events', img: P + 'deck.jpg', title: 'Meetings & events', time: 'Half or full day', price: 25, text: 'A bright conference room for workshops, trainings and celebrations, with projector, Wi-Fi and catering on request.' },
      { id: 'transfer', img: P + 'lodge.jpg', title: 'Airport & town transfers', time: 'On request', price: 40, text: 'Pick-ups from Entebbe Airport and Kampala, and rides around Jinja arranged by the front desk.' },
      { id: 'nile', img: P + 'elephant.jpg', title: 'Source of the Nile boat trip', time: '2 hrs', price: 35, text: 'A relaxed boat trip to the source of the Nile with a guide, with birdlife and views along the river.' },
      { id: 'rafting', img: P + 'safari.jpg', title: 'White-water rafting & adventure', time: 'Full day', price: 120, text: 'Rafting, kayaking and quad biking booked for you with trusted operators just outside town.' },
      { id: 'tour', img: P + 'zebra.jpg', title: 'Jinja town & culture tour', time: 'Half day', price: 30, text: 'Markets, crafts, street food and the history of the town with a local guide.' },
    )
    MENU.splice(0, MENU.length,
      { course: 'Breakfast', items: [['Full hotel breakfast', 'Eggs to order, sausage, toast, fruit, tea or coffee', 28000], ['Sunrise rolex', 'Chapati, eggs and fresh vegetables', 10000]] },
      { course: 'Lunch & dinner', items: [['Grilled Nile perch', 'Lemon butter, rice or chips, kachumbari', 45000], ['Chicken or beef stew', 'Served with matoke, posho or rice', 32000], ['Club sandwich & chips', 'Chicken, egg, tomato, lettuce', 25000], ['Vegetable curry', 'Seasonal vegetables, coconut sauce, rice', 28000]] },
      { course: 'Bar & dessert', items: [['Passion fruit juice or soda', 'Fresh or bottled', 6000], ['Local beer or house wine', 'By the bottle or glass', 8000], ['Ugandan coffee', 'Black or with milk', 7000], ['Chocolate cake', 'Slice with cream', 14000]] },
    )
    GALLERY.splice(0, GALLERY.length,
      { src: P + 'deck.jpg', cat: 'Hotel', alt: 'Pool and terrace' },
      { src: P + 'lodge.jpg', cat: 'Hotel', alt: 'Hotel exterior' },
      { src: P + 'standard-double.jpg', cat: 'Rooms', alt: 'Standard double room' },
      { src: P + 'deluxe-double.jpg', cat: 'Rooms', alt: 'Deluxe room' },
      { src: P + 'executive.jpg', cat: 'Rooms', alt: 'Executive suite' },
      { src: P + 'canopy.jpg', cat: 'Rooms', alt: 'Suite bedroom' },
      { src: P + 'food-grill.jpg', cat: 'Dining', alt: 'Grilled skewers' },
      { src: P + 'food-meat.jpg', cat: 'Dining', alt: 'Roasted meat' },
      { src: P + 'food-rice.jpg', cat: 'Dining', alt: 'Spiced rice' },
      { src: P + 'family.jpg', cat: 'Rooms', alt: 'Family room' },
      { src: P + 'honeymoon.jpg', cat: 'Rooms', alt: 'Honeymoon suite' },
      { src: P + 'standard-twin.jpg', cat: 'Rooms', alt: 'Twin room' },
    )
    ALL_AMENITIES.splice(0, ALL_AMENITIES.length, 'Hot-water shower', 'Free fast Wi-Fi', 'Air conditioning or fan', 'Work desk', 'Tea & coffee station', 'Daily housekeeping', 'In-room safe', 'Breakfast included', 'Airport transfer on request')
    const hotel = {
      'Standard Double': ['A comfortable, quiet room with a work desk, ideal for business trips and short stays.', ['Work desk', 'Free Wi-Fi', 'Breakfast included']],
      'Standard Twin': ['Two single beds, ideal for colleagues or friends travelling together.', ['Work desk', 'Free Wi-Fi', 'Breakfast included']],
      'Deluxe Double': ['More space and a sitting area, with a king bed and a balcony.', ['Balcony', 'Sitting area', 'Breakfast included']],
      'Deluxe Twin': ['A spacious twin room with a sitting area and a balcony over the hotel grounds.', ['Balcony', 'Sitting area', 'Breakfast included']],
      'Family Room': ['Space for the whole family with a separate sleeping area and a lounge corner.', ['Sleeps 4', 'Lounge area', 'Breakfast included']],
      'Executive Suite': ['A suite with a lounge and a work area, ideal for longer stays and business guests.', ['Separate lounge', 'Work area', 'Breakfast included']],
      'Honeymoon Suite': ['Our most romantic suite: a king bed, a private terrace and a welcome treat on arrival.', ['Private terrace', 'Welcome treat', 'Breakfast included']],
    }
    if (LODGE.name === 'Royal Park Hotel') {
      const G = (k) => 'https://lh3.googleusercontent.com/' + k + '=w1400-h933-k-no'
      const RP = {court: G('gps-cs-s/ANWiy9RaSTRFJuYVqJT8_JZLJuq2r2LZFIQeNUlh_OQwO-11d3v5Tdzh8zrCmiol3RRlOhrcB67GP-4u3LKHI-zPT8cbuFv1lzKXFO_zZ9HLZc4KlL9Kdl5PECFHPwtQQb2ssAgj2slsQw'),twin: G('gps-cs-s/ANWiy9TfP3wrVPcHk9C7s9Z8QEKE0J1KEmHQ65wsZh_oJ_otq3iLLFXZENnVwQLct9iczgmy8wZUnu4e54M0B75aSrAdHN4DnfwOOARAlNyBP8TGyZJQpWJ-OrcbtsI7IDiRRLgORqZCMBy1xOat'),bath: G('gps-cs-s/ANWiy9TDgTGxwApamXYFIZhjd_0H1uj6Bo5G9AwuI538k0zo6hOh5BhZ3M_M7JiOyA_ECvvuJsSOxFbIsD9txubZacfbraO45SzjWVWLblmUjcPZ11Ws3N3nyIKILBBVduNDhPmHupJKTw'),bed: G('gps-cs-s/ANWiy9SyVNAvh_hfuBmrTBTJCBaGnel281s8yFbC_txjMFIQ2S1-PTIQS721Led3ZOf4Unpt2svCfKSBSo_tb5GW3xMVZCFHN63fPke2S99rEXWZ0V9xIw8ZXZL6Y1x9ELZ4j7fNrP0'),food: G('gps-cs-s/ANWiy9RmTbp7FqdlNDqCHFiu-cI8fsUMc81Ip1cZ9reukk09V_rU3sHWnBfcY3-MrlwezIYmTacTruvXjZL8w2_qlPy7o2f3xx_jsdQiwl63qmTpN39ocZQtGS3Q4vscvJ-zc_U-fCA'),x6: G('gps-cs-s/ANWiy9SfmmlnJIO7oCGnBLVV2uPN7Os7EegDOykKgsXz4uEm1uAnJz9TPDkk6Q0ovT0OuDXs3ewoBh62N2504TP8niauFzH3XgrGzSd0qoCLmGK8FPV7GwvR0UA0gKA6JS8xWx3ELZxhKw')}
      LODGE.hero = RP.court
      // Real photos of the hotel, from its Google Maps listing
      const rp = { 'Standard Double': RP.bed, 'Standard Twin': RP.twin, 'Deluxe Double': RP.x6, 'Deluxe Twin': RP.twin, 'Family Room': RP.x6, 'Executive Suite': RP.bed, 'Honeymoon Suite': RP.x6 }
      for (const [k, p] of Object.entries(rp)) Object.assign(ROOM_INFO[k], { photo: p, gallery: [p, RP.bath, RP.court] })
      EXPERIENCES.forEach(e => { e.img = ({ dining: RP.food, events: RP.court, transfer: RP.court, nile: RP.court, rafting: RP.court, tour: RP.court })[e.id] })
      GALLERY.splice(0, GALLERY.length,
        { src: RP.court, cat: 'Hotel', alt: 'Hotel courtyard and reception' },
        { src: RP.twin, cat: 'Rooms', alt: 'Twin room' },
        { src: RP.bed, cat: 'Rooms', alt: 'Double room' },
        { src: RP.x6, cat: 'Rooms', alt: 'Room' },
        { src: RP.bath, cat: 'Rooms', alt: 'Bathroom' },
        { src: RP.food, cat: 'Dining', alt: 'Restaurant dishes' },
      )
    }
    for (const [k, [blurb, perks]] of Object.entries(hotel)) Object.assign(ROOM_INFO[k], { blurb, perks })
  }
} catch { /* keep the default content */ }

// Secrets Guest House (Entebbe): a quiet garden guest house by the airport. Sample photos and prices until the owner supplies their own.
try {
  if (LODGE.secrets) {
    const r = document.documentElement.style
    const pal = { 'forest-950': '9 24 28', 'forest-900': '15 47 51', 'forest-800': '22 66 71', 'forest-700': '29 90 96', 'forest-600': '38 119 126', 'forest-500': '47 144 153',
      'sage-50': '250 246 239', 'sage-100': '243 236 224', 'sage-200': '231 220 199', 'sage-300': '214 196 163', 'cream': '252 250 246' }
    Object.entries(pal).forEach(([k, v]) => r.setProperty(`--c-${k}`, v))
    const gal = (a, ...b) => [a, ...b]
    const photos = { 'Standard Double': ['standard-double.jpg', 'deluxe-double.jpg'], 'Standard Twin': ['canopy.jpg', 'standard-double.jpg'], 'Deluxe Double': ['deluxe-double.jpg', 'standard-double.jpg'], 'Deluxe Twin': ['canopy.jpg', 'deluxe-double.jpg'], 'Family Room': ['family.jpg', 'standard-twin.jpg'], 'Executive Suite': ['executive.jpg', 'family.jpg'], 'Honeymoon Suite': ['honeymoon.jpg', 'executive.jpg'] }
    for (const [k, [a, b]] of Object.entries(photos)) Object.assign(ROOM_INFO[k], { photo: P + a, gallery: gal(P + a, P + b, P + 'glamp.jpg') })
    Object.assign(ROOM_INFO['Standard Double'], { beds: '1 double bed', size: '24 m²', blurb: 'A clean, quiet room with a comfortable double bed, mosquito net and a hot-water shower. A restful stop before or after your flight.', perks: ['Garden side', 'Free Wi-Fi', 'Breakfast included'] })
    Object.assign(ROOM_INFO['Deluxe Double'], { beds: '1 king bed', size: '32 m²', blurb: 'More space, a sitting area and a balcony over the garden, with a king bed and a quiet outlook.', perks: ['Garden balcony', 'Sitting area', 'Breakfast included'] })
    Object.assign(ROOM_INFO['Deluxe Twin'], { beds: '2 single beds', size: '32 m²', blurb: 'Two comfortable single beds and a garden balcony, ideal for friends or colleagues travelling together.', perks: ['Garden balcony', 'Free Wi-Fi', 'Breakfast included'] })
    Object.assign(ROOM_INFO['Family Room'], { beds: '1 double + 2 single beds', size: '44 m²', blurb: 'Room for the whole family, with a separate sleeping area, a lounge corner and space for luggage.', perks: ['Sleeps 4', 'Lounge corner', 'Breakfast included'] })
    EXPERIENCES.splice(0, EXPERIENCES.length,
      { id: 'airport', img: P + 'lodge.jpg', title: 'Airport pick-up & drop-off', time: 'On request', price: 25, text: 'A driver meets you at Entebbe International Airport, including late arrivals and delayed flights. Just share your flight number.' },
      { id: 'breakfast', img: P + 'food-rice.jpg', title: 'Home-style breakfast', time: 'Every morning', price: 0, text: 'Eggs your way, fresh fruit, local favourites and good Ugandan coffee, served in the garden. Included with your room.' },
      { id: 'meals', img: P + 'food-grill.jpg', title: 'Lunch & dinner', time: 'On request', price: 0, text: 'Local and international dishes cooked fresh to order. Pay at the table or charge it to your room.' },
      { id: 'laundry', img: P + 'standard-twin.jpg', title: 'Laundry & room service', time: 'Daily', price: 5, text: 'Fresh clothes for the next leg of your journey, and meals brought to your room if you prefer.' },
      { id: 'tour', img: P + 'zebra.jpg', title: 'Entebbe day trips', time: 'Half day', price: 35, text: 'The Botanical Gardens, the Wildlife Education Centre, Lake Victoria beaches and a golf course close by, with a driver arranged for you.' },
      { id: 'kampala', img: P + 'safari.jpg', title: 'Kampala & safari transfers', time: 'On request', price: 60, text: 'Onward transfers to Kampala, or to your safari departure, in a comfortable private vehicle.' },
    )
    MENU.splice(0, MENU.length,
      { course: 'Breakfast', items: [['Garden breakfast', 'Eggs to order, fruit, toast, tea or Ugandan coffee', 20000], ['Rolex', 'Chapati, eggs and fresh vegetables', 8000]] },
      { course: 'Lunch & dinner', items: [['Grilled tilapia', 'Matooke, kachumbari and groundnut sauce', 38000], ['Chicken stew', 'With rice, posho or matooke', 28000], ['Club sandwich & chips', 'Chicken, egg, tomato, lettuce', 22000], ['Vegetable curry', 'Seasonal vegetables, coconut sauce, rice', 25000]] },
      { course: 'Drinks & dessert', items: [['Fresh passion juice', 'Pressed to order', 6000], ['Local beer or soda', 'By the bottle', 6000], ['Ugandan coffee', 'Black or with milk', 6000], ['Fruit salad', 'Seasonal fruit', 10000]] },
    )
    GALLERY.splice(0, GALLERY.length,
      { src: P + 'standard-double.jpg', cat: 'Rooms', alt: 'Double room' },
      { src: P + 'canopy.jpg', cat: 'Rooms', alt: 'Twin room with mosquito nets' },
      { src: P + 'deluxe-double.jpg', cat: 'Rooms', alt: 'Deluxe room' },
      { src: P + 'family.jpg', cat: 'Rooms', alt: 'Family room' },
      { src: P + 'food-rice.jpg', cat: 'Dining', alt: 'Local dish' },
      { src: P + 'food-grill.jpg', cat: 'Dining', alt: 'Grilled meat' },
      { src: P + 'glamp.jpg', cat: 'Garden', alt: 'Garden seating' },
      { src: P + 'firepit.jpg', cat: 'Garden', alt: 'Garden lawn' },
    )
  }
} catch { /* keep the default content */ }
