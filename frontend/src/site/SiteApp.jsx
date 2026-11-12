import { Routes, Route, Navigate } from 'react-router-dom'
import SiteHome from './SiteHome'
import SiteBook from './SiteBook'

// Public guest-facing website for the demo lodge. It talks to the same in-browser
// mock API as the lodge management system, so a booking made here shows up there.
export default function SiteApp() {
  return (
    <Routes>
      <Route index element={<SiteHome />} />
      <Route path="book" element={<SiteBook />} />
      <Route path="*" element={<Navigate to="/site" replace />} />
    </Routes>
  )
}
