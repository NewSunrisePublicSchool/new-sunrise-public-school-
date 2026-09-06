'use client'
import {useEffect} from 'react'
import {usePathname} from 'next/navigation'
import type {ReactNode} from 'react'
import './enquiry-dashboard.css'

function EnquiryCard(){
 useEffect(()=>{
  let card:HTMLAnchorElement|null=null
  const mount=()=>{
   const grid=document.querySelector<HTMLElement>('.dashboardActionGrid')
   if(!grid){if(card){card.remove();card=null}return}
   if(card&&card.parentElement===grid)return
   if(card)card.remove()
   card=document.createElement('a')
   card.href='/admin/enquiries'
   card.className='dashboardActionCard enquiryActionCard'
   card.innerHTML='<span class="actionIcon">✉️</span><span class="actionText"><b>Enquiries</b><small>View, manage and reply to enquiries received from the school website.</small></span><span class="actionCount">School enquiries</span><span class="actionArrow">→</span>'
   grid.appendChild(card)
  }
  mount()
  const observer=new MutationObserver(mount)
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>{observer.disconnect();card?.remove()}
 },[])
 return null
}

export default function AdminLayout({children}:{children:ReactNode}){
 const path=usePathname()
 return <>{children}{path==='/admin'&&<EnquiryCard/>}</>
}
