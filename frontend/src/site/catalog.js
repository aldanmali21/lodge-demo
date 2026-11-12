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
}

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

export const toInputDate = (d) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const fmtDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
export const nightsBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000))
// Same arrival / departure times the lodge uses (check-in 14:00, check-out 10:00)
export const stamp = (s, h) => new Date(`${s}T${String(h).padStart(2, '0')}:00:00`).toISOString()
