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

  return <button type="button" onClick={backToDashboard} style={{position:'fixed',top:18,right:24,zIndex:1000,border:'1px solid #d9e2e8',borderRadius:8,background:'#fff',color:'#075f35',padding:'10px 15px',fontWeight:800,fontSize:14,cursor:'pointer',boxShadow:'0 4px 14px rgba(0,0,0,.08)'}}>← Back to Dashboard</button>
}
