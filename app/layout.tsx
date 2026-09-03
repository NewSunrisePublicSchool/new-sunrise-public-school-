import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata={title:'New Sunrise Public School | Kallyangaon',description:'New Sunrise Public School — quality education from Nursery to Class 8.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
