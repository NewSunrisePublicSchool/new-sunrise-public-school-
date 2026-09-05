'use client'

import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'

export default function AdminBackToDashboard(){
  const [visible,setVisible]=useState(false)

  useEffect(()=>{
    let active=true
    const checkAdminRoute=async()=>{
      if(!window.location.pathname.startsWith('/admin')) return
      const {data:{session}}=await supabase.auth.getSession()
      if(!session){if(active)setVisible(false);return}
      const {data,error}=await supabase.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle()
      if(error||!data){await supabase.auth.signOut();if(active)window.location.replace('/');return}
      if(active)setVisible(Boolean(document.querySelector('.adminShell')))
    }
    checkAdminRoute()
    const observer=new MutationObserver(()=>{if(window.location.pathname.startsWith('/admin'))setVisible(Boolean(document.querySelector('.adminShell')))})
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>{active=false;observer.disconnect()}
  },[])

  if(!visible)return null

  const backToDashboard=()=>{
    const dashboardButton=Array.from(document.querySelectorAll('button')).find(button=>button.textContent?.trim().includes('Dashboard')) as HTMLButtonElement|undefined
    dashboardButton?.click()
    window.scrollTo({top:0,behavior:'smooth'})
  }

  return <button type="button" onClick={backToDashboard} style={{position:'fixed',top:18,right:24,zIndex:1000,border:'1px solid #d9e2e8',borderRadius:8,background:'#fff',color:'#075f35',padding:'10px 15px',fontWeight:800,fontSize:14,cursor:'pointer',boxShadow:'0 4px 14px rgba(0,0,0,.08)'}}>← Back to Dashboard</button>
}
