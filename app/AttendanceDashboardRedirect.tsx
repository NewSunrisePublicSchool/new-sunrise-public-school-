'use client'

import {useEffect} from 'react'

export default function AttendanceDashboardRedirect(){
  useEffect(()=>{
    const redirect=()=>{
      const cards=document.querySelectorAll<HTMLElement>('.dashboardActionGrid .dashboardActionCard')
      const card=Array.from(cards).find(el=>el.textContent?.replace(/\s+/g,' ').includes('Attendance'))
      if(!card || card.dataset.attendanceRedirect==='true') return
      card.dataset.attendanceRedirect='true'
      card.addEventListener('click',(event)=>{
        event.preventDefault()
        event.stopImmediatePropagation()
        window.location.assign('/admin/attendance')
      },true)
    }
    redirect()
    const observer=new MutationObserver(redirect)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])
  return null
}
