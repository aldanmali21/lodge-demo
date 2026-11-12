// Marketing copy + photos for each room type on the demo guest website.
// Prices and availability come from the same (mock) API the lodge system uses.
export const ROOM_INFO = {
  'Standard Double': { photo: '/site/standard-double.jpg', beds: '1 double bed', size: '28 m²', blurb: 'A calm, light-filled room with a garden-facing window and everything you need for a restful safari stay.', perks: ['Garden view', 'Free Wi-Fi', 'Breakfast included'] },
  'Standard Twin': { photo: '/site/standard-twin.jpg', beds: '2 single beds', size: '28 m²', blurb: 'Two comfortable single beds, ideal for friends or colleagues travelling together.', perks: ['Garden view', 'Free Wi-Fi', 'Breakfast included'] },
  'Deluxe Double': { photo: '/site/deluxe-double.jpg', beds: '1 king bed', size: '36 m²', blurb: 'Warm timber finishes, a private veranda and a king bed dressed in soft linen.', perks: ['Private veranda', 'Lake glimpse', 'Breakfast included'] },
  'Deluxe Twin': { photo: '/site/deluxe-twin.jpg', beds: '2 large single beds', size: '36 m²', blurb: 'Spacious twin room with floor-to-ceiling doors opening onto a shaded veranda.', perks: ['Private veranda', 'Lake glimpse', 'Breakfast included'] },
  'Family Room': { photo: '/site/family.jpg', beds: '1 king + 2 single beds', size: '52 m²', blurb: 'Space for the whole family with a separate sleeping area and a cosy lounge corner.', perks: ['Sleeps 4', 'Lounge area', 'Breakfast included'] },
  'Executive Suite': { photo: '/site/executive.jpg', beds: '1 king bed', size: '64 m²', blurb: 'A light, open-plan suite with a lounge, a deep soaking tub and views over the lake.', perks: ['Lake view', 'Soaking tub', 'Breakfast included'] },
  'Honeymoon Suite': { photo: '/site/honeymoon.jpg', beds: '1 king bed', size: '72 m²', blurb: 'Our most romantic suite: a private deck above the water, sunset views and champagne on arrival.', perks: ['Private deck', 'Champagne on arrival', 'Breakfast included'] },
}
export const fallbackInfo = { photo: '/site/lodge.jpg', beds: '', size: '', blurb: '', perks: [] }

export const TAX_RATE = 0.23 // 5% tourism levy + 18% VAT — same as the lodge system
export const UGX_RATE = 3700

export const money = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
export const ugx = (n) => `UGX ${Math.round(n * UGX_RATE).toLocaleString('en-US')}`

export const toInputDate = (d) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const fmtDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
export const nightsBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000))
// Same arrival / departure times the lodge uses (check-in 14:00, check-out 10:00)
export const stamp = (s, h) => new Date(`${s}T${String(h).padStart(2, '0')}:00:00`).toISOString()
