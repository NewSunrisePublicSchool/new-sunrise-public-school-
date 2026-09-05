import type { Metadata } from 'next'
import './globals.css'
import './premium-overrides.css'
import AdminBackToDashboard from './AdminBackToDashboard'
export const metadata: Metadata={title:'New Sunrise Public School | Kallyangaon',description:'New Sunrise Public School — quality education from Nursery to Class 8.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<AdminBackToDashboard/></body></html>}
