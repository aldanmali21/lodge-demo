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
const SGP = {
  1: 'gps-cs-s/ANWiy9S6j_HzGHJ3w65TdPva1irr7xOUdHzRlVqGIrNPzobElhyGn5LAQ4ksBzlS9L5W_AT7yVqSAP0PB4lqpeVZrj1n0zYuaZphumsPIw3XtKx7jyOOqMltG9af7YEQKzIn7keW6KXQ',
  2: 'gps-cs-s/ANWiy9RtVIx8s3wh_QY1MoL1dqt3x2Hp8Ef_mwis3QPb1VsI_HRUimbBZ9YOcGRDSs7mLkt-E_GCmRQrAIOOwOEokMozdxKSCvdjG3uIWi-b52CbWs6-xEeofmYkMIdDRhJ6fx4p0JkNXg',
  3: 'gps-cs-s/ANWiy9STTTjB1FT9kHHFGDTHchoGoqH8S7XLECjrkHrK__UegFvcow6eJluRJioHM4EMgdf1cduHvDb3e_qWI_Ke2fGLing-YC1I3a9LVE7lDUZ34hYZoL6zb9QKzOgCMMAb5MJCXtXgHw',
  4: 'gps-cs-s/ANWiy9RCUJASUn7ZOWwZhxyTWIByi-hYVPSEPdL3mRc0KI1ciMPu6oPXjd3SeNkaoOsZ2HupBgsCRO3vC3IVj9BQHQb6jly6ognW3oGRE_e2jLXDnf7GUmYSw1X0usvSHGfZJJExiG0XZg',
  5: 'gps-cs-s/ANWiy9QGe2p9bJo0mB5G2CSgibxG_CdLVQYJd5WbJxg9jYny-_5lRiz_GXPQTEY3i9c3Mv3E7Ltcm6Si1AXOjLK3smxdhcDEXDsfsSmxOKuAXMzkeuL6r1OMHKyC_YkvEQ7J-6cpCI8',
  6: 'gps-cs-s/ANWiy9S5aUopcXjeM3XU5-ONHPQaK8H0CejlSdry_HXy0tYlPhqWRfvKiB-1Wi9r5fUkocn7FSVq9Xv6NOxbAJ9opKsu3HUxSoXnc9pa0VFfLfGT6Q0iblyUbCdwNQyKR-9Z95BKz1uj',
  7: 'gps-proxy/ALd4DhFiQXNBO1gqph2CDTlBlu7SRghvMxRhhJyjThzhnbsaBoRgFoWJWWpShrZzAskcsMnt8VKYgW0yd3JCxly3wj3JIivihUgXefvMsTGNNOHdarNwdVDubpfrhhOrguxxQAhzWwLyv02kZQKYS3CyStFqyUz1Qp_Z2AhgxCKRpgDfnKEtRO9Sa6at',
  8: 'gps-proxy/ALd4DhEBn01lhBc20VXjpcmP7qp5sLoJuW73pGwQP2QsKZH7zp3kG2wt5FpXZA6dl-FCcVC72rr7hnsVsrJp4k9hWbOcvYmhqPm1kCWFxkhlbH2I8aQi_AtlOMRPR9qxy8sYAIbVaO1f3li4YfoTD7nVrkLktWQayQmV_JjlqnTnpI4abutHOI5wpyC9',
  9: 'gps-cs-s/ANWiy9QhbF1f3U7G9zwpJ_61BrIoxSjJOoNmLdcFpLPB6JgvLeVt_Xk-W0Wlc2Frdc31OsOTv2j0YePX23EB2CF6ApdG38ViZR0_WowKQM31WkF5dVLdRnbDcJNkQiUpF49PEyOVZuqm',
  10: 'gps-cs-s/ANWiy9T2icD_BERJBkCyiR5lvShlo-KAvOjHqehgmU3WEFHaKS_Jy4U4cAk4PzfGN3a-7YtJv_FWnj5nTl96HhV4jXo0ZNFRufaqySjtmciIFERfXnb9wUQtQGEsGSbqf9TWzEivbA',
  11: 'gps-cs-s/ANWiy9TJcIF9-iFAyqdYA6YRfOS_gQTVSImG1CHmYGMjOVizkHVwVfmb-kiju7cHnz6yxre4q-50w-ts45h9--XpRyIt_-AB4YDV6Cl8iJK-jLEU6skj9R52tCP31Rb8YN_qpHVSvsU5',
  12: 'gps-proxy/ALd4DhFo_5bgoqgs3kAs78QCUAezV46I1jAY1B9tYXcsPa4usxwrtBoCVxNl3d5qZFY_QE7Ojrk3Wzxr9w7haGI1t_h7z_ncjMV8lJXSdsvpaVXbsekPX1iLfrINHebZIsqewMrhnysocjxntQ4b1TOkR82h3ktVNhHkLil_q2UbgjI51NKd3vV-BRHE',
  13: 'gps-proxy/ALd4DhGKVKZ9kBxIblxyGWQlY4KCgVB2ffKT5ZCRGOKBfXLkxi2WHS4kguegUgo-ppVzA9I87NgtzuLv0XB8LW0bxci5TGdszGdNmXvNKAIa-56QTbDekzW51V2aJ3M-br6-g60hO4GkM-TM_XF1WkAX0TbKu4lvjem9396dL9JJJB_rtJdtFJ5TOxOVnA',
  14: 'gps-proxy/ALd4DhEzcajUeosd2e8G2duF0aonQygsheikU6AgX5jJUDQ4zdXB965hk9zedpm418dpfLCYHWxreJF3zJRJFJprum_LvoGjMepC_4Kv2o06iqCoTXPaXPcLotpZI4nkl3cYYX0TXvl2PoUJ8hTAynbuVHJ0BfTYJBAb04d0xfg1Qv5C5w_YABAxTuCE',
  15: 'gps-proxy/ALd4DhGyey29pha74LYQ4LetkE46qmFUJdssvD1aLfzd9Qgau7qqFVXonijO_jt2_VHQ-8djDzELDA2fF0Xv6LoaLxXVgIx-mO1CHyovob-M-GM1GfrXhx5LiFAqIukL1Rlc3mGnCmeJ084ku7StojpKwVigjmnSbKDsqcSK8JxqpF4GrPeXFZFZpMI',
  16: 'gps-proxy/ALd4DhHDWgXUmC-R4tAm9k1gDy1PhUPVUjvYWwXDEAcTldfpcuPrSdDdpLOU4LUn0anOMWzygdatz0u5nRs_70yAfOD2r5YscS2diIIyVlZP-wBfCeNWZEIJ9x4U_-eFfE9iSRzYpxrFUc6QGwhxxtqYkK0AAk4TnbnNsL6jTaIKrKLPKtrz8zRu3JhZ',
}
const SG = (n) => 'https://lh3.googleusercontent.com/' + SGP[n] + '=w1400-h933-k-no'
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
    tagline: 'A home among the gardens of Entebbe',
    email: 'stay@secretsguesthouse.example',
    place: 'Plot 23 Kyanvubu Road, Entebbe, Uganda',
    phone: '+256 779 273 979',
    whatsapp: '256779273979',
    kicker: 'Family-run Guest House · Entebbe',
    blurb: 'A quiet, welcoming garden guest house a short drive from Entebbe International Airport.',
    sub: 'Rest easy before or after your flight. Book your room online, pay a deposit by Mobile Money, and we will be waiting with the gate open.',
    hero: SG(6),
    heroAlt: 'Thatched garden cottage at Secrets Guest House',
    welcomeTitle: 'Thatched cottages, green lawns and a warm welcome',
    welcomeImg: SG(7),
    welcomeAlt: 'Thatched cottages around the garden courtyard',
    servicesTitle: 'Guest services',
    extraGuest: 25000,
    welcome: 'Secrets is a family-style guest house set in a green garden in Entebbe, with thatched cottages, a shaded terrace and a kitchen that cooks breakfast fresh each morning. Our hosts will meet you on a late arrival, arrange your airport transfer and help you plan the days ahead. Guests rate us 4.5 on Google and 4.8 on Tripadvisor, and most mention the same thing: how well they were looked after.',
    stats: [['4.5', 'Google rating'], ['4.8', 'Tripadvisor'], ['219', 'Google reviews']],
    features: [['pool', 'Garden & terrace', 'Quiet residential street'], ['food', 'Free breakfast', 'Fresh, local, made to order'], ['events', 'Free parking', 'On site, plus airport transfers'], ['wifi', 'Free Wi-Fi', 'In every room']],
    roomsKicker: 'Stay with us', roomsSub: 'Live availability for your dates. Prices per room per night, in Ugandan shillings.',
    roomsHero: 'Garden cottages and rooms with breakfast included, a short drive from the airport.',
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
    const photos = { 'Standard Double': [13, 2, 11], 'Standard Twin': [2, 13, 10], 'Deluxe Double': [9, 10, 2], 'Deluxe Twin': [2, 9, 10], 'Family Room': [6, 10, 11], 'Executive Suite': [6, 10, 2], 'Honeymoon Suite': [9, 14, 2] }
    for (const [k, [a, b, c]] of Object.entries(photos)) Object.assign(ROOM_INFO[k], { photo: SG(a), gallery: [SG(a), SG(b), SG(c)] })
    Object.assign(ROOM_INFO['Standard Double'], { beds: '1 double bed', size: '24 m²', blurb: 'A bright, clean room opening onto the garden, with a comfortable double bed, mosquito net and hot-water shower.', perks: ['Garden view', 'Free Wi-Fi', 'Breakfast included'] })
    Object.assign(ROOM_INFO['Deluxe Double'], { beds: '1 king bed', size: '32 m²', blurb: 'More space and a sitting area, with a king bed and a shaded veranda looking over the lawn.', perks: ['Private veranda', 'Sitting area', 'Breakfast included'] })
    Object.assign(ROOM_INFO['Deluxe Twin'], { beds: '2 single beds', size: '32 m²', blurb: 'Two comfortable single beds under mosquito nets and a veranda on the garden, ideal for friends or colleagues.', perks: ['Private veranda', 'Free Wi-Fi', 'Breakfast included'] })
    Object.assign(ROOM_INFO['Family Room'], { beds: '1 double + 2 single beds', size: '44 m²', blurb: 'Room for the whole family, with a separate sleeping area, a lounge corner and space for luggage.', perks: ['Sleeps 4', 'Lounge corner', 'Breakfast included'] })
    EXPERIENCES.splice(0, EXPERIENCES.length,
      { id: 'airport', img: SG(15), title: 'Airport pick-up & drop-off', time: 'On request', price: 25, text: 'A driver meets you at Entebbe International Airport, including late arrivals and delayed flights. Just share your flight number.' },
      { id: 'breakfast', img: SG(14), title: 'Home-style breakfast', time: 'Every morning', price: 0, text: 'Eggs your way, fresh fruit, local favourites and good Ugandan coffee, served in the garden. Included with your room.' },
      { id: 'meals', img: SG(5), title: 'Lunch & dinner', time: 'On request', price: 0, text: 'Local and international dishes cooked fresh to order. Pay at the table or charge it to your room.' },
      { id: 'laundry', img: SG(2), title: 'Laundry & room service', time: 'Daily', price: 5, text: 'Fresh clothes for the next leg of your journey, and meals brought to your room if you prefer.' },
      { id: 'tour', img: SG(3), title: 'Entebbe day trips', time: 'Half day', price: 35, text: 'The Botanical Gardens, the Wildlife Education Centre, Lake Victoria beaches and a golf course close by, with a driver arranged for you.' },
      { id: 'kampala', img: SG(16), title: 'Kampala & safari transfers', time: 'On request', price: 60, text: 'Onward transfers to Kampala, or to your safari departure, in a comfortable private vehicle.' },
    )
    MENU.splice(0, MENU.length,
      { course: 'Breakfast', items: [['Garden breakfast', 'Eggs to order, fruit, toast, tea or Ugandan coffee', 20000], ['Rolex', 'Chapati, eggs and fresh vegetables', 8000]] },
      { course: 'Lunch & dinner', items: [['Grilled tilapia', 'Matooke, kachumbari and groundnut sauce', 38000], ['Chicken stew', 'With rice, posho or matooke', 28000], ['Club sandwich & chips', 'Chicken, egg, tomato, lettuce', 22000], ['Vegetable curry', 'Seasonal vegetables, coconut sauce, rice', 25000]] },
      { course: 'Drinks & dessert', items: [['Fresh passion juice', 'Pressed to order', 6000], ['Local beer or soda', 'By the bottle', 6000], ['Ugandan coffee', 'Black or with milk', 6000], ['Fruit salad', 'Seasonal fruit', 10000]] },
    )
    GALLERY.splice(0, GALLERY.length,
      { src: SG(6), cat: 'Cottages', alt: 'Thatched garden cottage' },
      { src: SG(16), cat: 'Garden', alt: 'The garden from above' },
      { src: SG(7), cat: 'Cottages', alt: 'Cottages around the courtyard' },
      { src: SG(2), cat: 'Rooms', alt: 'Twin room with mosquito nets' },
      { src: SG(8), cat: 'Garden', alt: 'Shaded dining terrace' },
      { src: SG(5), cat: 'Dining', alt: 'Home-cooked lunch' },
      { src: SG(4), cat: 'Garden', alt: 'Garden pavilion' },
      { src: SG(9), cat: 'Cottages', alt: 'Cottage veranda' },
      { src: SG(10), cat: 'Rooms', alt: 'Sitting room' },
      { src: SG(14), cat: 'Dining', alt: 'Coffee on the lawn' },
      { src: SG(3), cat: 'Garden', alt: 'An ibis on the lawn' },
      { src: SG(1), cat: 'Guest house', alt: 'Welcome to Secrets Guest House' },
      { src: SG(13), cat: 'Rooms', alt: 'Room veranda' },
      { src: SG(12), cat: 'Garden', alt: 'Lawn and rooms' },
    )
  }
} catch { /* keep the default content */ }
