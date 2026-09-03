'use client'

import {useEffect,useState} from 'react'

export default function AdminBackToDashboard(){
  const [visible,setVisible]=useState(false)

  useEffect(()=>{
    const check=()=>setVisible(Boolean(document.querySelector('.adminShell')))
    check()
    const observer=new MutationObserver(check)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])

  if(!visible)return null

  const backToDashboard=()=>{
    const dashboardButton=Array.from(document.querySelectorAll('button')).find(button=>button.textContent?.trim().includes('Dashboard')) as HTMLButtonElement|undefined
    dashboardButton?.click()
    window.scrollTo({top:0,behavior:'smooth'})
  }

  return <button type="button" className="adminBackDashboard" onClick={backToDashboard}>← Back to Dashboard</button>
}
