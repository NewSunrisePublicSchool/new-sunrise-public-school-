import type { Metadata } from 'next'
import './globals.css'
import './premium-overrides.css'
import AdminBackToDashboard from './AdminBackToDashboard'
import AttendanceDashboardRedirect from './AttendanceDashboardRedirect'
import AdminDashboardRoutingFix from './AdminDashboardRoutingFix'
import StudentProfileDeleteButton from './admin/StudentProfileDeleteButton'
export const metadata: Metadata={title:'New Sunrise Public School | Kalyangaon',description:'New Sunrise Public School — quality education from Nursery to Class 8.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<AdminBackToDashboard/><AttendanceDashboardRedirect/><AdminDashboardRoutingFix/><StudentProfileDeleteButton/></body></html>}
