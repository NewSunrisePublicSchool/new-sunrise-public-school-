'use client'
import {useEffect} from 'react'

const routes:[string,string][]=[
 ['Admissions','/admin/admissions'],
 ['Approved Students','/admin/students'],
 ['Application History','/admin/admissions'],
 ['Fees Management','/admin/fees'],
 ['Results','/admin/results'],
 ['Attendance','/admin/attendance']
]

export default function AdminDashboardRoutingFix(){
 useEffect(()=>{
  const apply=()=>{
   if(!location.pathname.startsWith('/admin')||location.pathname!='/admin') return
   const cards=document.querySelectorAll<HTMLElement>('.dashboardActionGrid .dashboardActionCard')
   cards.forEach(card=>{
    const title=Array.from(card.querySelectorAll('b')).map(x=>x.textContent?.trim()||'').join(' ')
    const match=routes.find(([name])=>title===name)
    if(!match)return
    const [,href]=match
    card.dataset.realRoute=href
    card.onclick=(e)=>{e.preventDefault();e.stopImmediatePropagation();location.href=href}
    card.style.cursor='pointer'
   })
  }
  apply()
  const observer=new MutationObserver(apply)
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])
 return null
}
