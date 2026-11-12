import { Routes, Route, Navigate } from 'react-router-dom'
import SiteHome from './SiteHome'
import SiteRooms from './SiteRooms'
import SiteRoom from './SiteRoom'
import SiteBook from './SiteBook'
import SiteExperiences from './SiteExperiences'
import SiteDining from './SiteDining'
import SiteGallery from './SiteGallery'
import SiteAbout from './SiteAbout'

// Public guest-facing website for the demo lodge. It talks to the same in-browser
// mock API as the lodge management system, so a booking made here shows up there.
export default function SiteApp() {
  return (
    <Routes>
      <Route index element={<SiteHome />} />
      <Route path="rooms" element={<SiteRooms />} />
      <Route path="rooms/:slug" element={<SiteRoom />} />
      <Route path="book" element={<SiteBook />} />
      <Route path="experiences" element={<SiteExperiences />} />
      <Route path="dining" element={<SiteDining />} />
      <Route path="gallery" element={<SiteGallery />} />
      <Route path="about" element={<SiteAbout />} />
      <Route path="*" element={<Navigate to="/site" replace />} />
    </Routes>
  )
}
