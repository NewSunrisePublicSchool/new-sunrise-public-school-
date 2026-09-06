'use client'
import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {usePathname} from 'next/navigation'
import type {ReactNode} from 'react'
import './enquiry-dashboard.css'

function EnquiryCard(){
 const [target,setTarget]=useState<HTMLElement|null>(null)
 useEffect(()=>{
  if(usePathnameRef()!=='/admin')return
  const find=()=>setTarget(document.querySelector<HTMLElement>('.dashboardActionGrid'))
  find()
  const observer=new MutationObserver(find)
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])
 if(!target)return null
 return createPortal(<a href="/admin/enquiries" className="dashboardActionCard enquiryActionCard"><span className="actionIcon">✉️</span><span className="actionText"><b>Enquiries</b><small>View, manage and reply to enquiries received from the school website.</small></span><span className="actionCount">School enquiries</span><span className="actionArrow">→</span></a>,target)
}

function usePathnameRef(){
 const [path,setPath]=useState('')
 useEffect(()=>setPath(window.location.pathname),[])
 return path
}

export default function AdminLayout({children}:{children:ReactNode}){
 const path=usePathname()
 return <>{children}{path==='/admin'&&<EnquiryCard/>}</>
}
