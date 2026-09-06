'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import type {ReactNode} from 'react'
import './enquiry-dashboard.css'
export default function AdminLayout({children}:{children:ReactNode}){const path=usePathname();return <>{children}{path!=='/admin/enquiries'&&<Link href="/admin/enquiries" className="adminEnquiryQuickCard"><span>✉️</span><div><b>Enquiries</b><small>View & reply to enquiries</small></div><em>→</em></Link>}</>}
