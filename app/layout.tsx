import type { Metadata } from 'next'
import './globals.css'
import StudentPortalButton from './StudentPortalButton'
export const metadata: Metadata={title:'New Sunrise Public School | Kallyangaon',description:'New Sunrise Public School — quality education from Nursery to Class 8.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<StudentPortalButton/></body></html>}
