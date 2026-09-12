'use client'

import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'

const ADMIN_MARKER='nsps_admin_verified'
const IDLE_LIMIT=30*60*1000

export default function AdminBackToDashboard(){
  const [visible,setVisible]=useState(false)

  useEffect(()=>{
    let active=true
    let idleTimer:ReturnType<typeof setTimeout>|null=null
    let lastActivity=Date.now()

    const signOutAndLeave=async()=>{
      sessionStorage.removeItem(ADMIN_MARKER)
      await supabase.auth.signOut()
      if(active && window.location.pathname.startsWith('/admin')) window.location.replace('/')
    }

    const verify=async(session:any,allowFreshSignIn=false)=>{
      if(!window.location.pathname.startsWith('/admin')) return
      if(!session){if(active)setVisible(false);return}
      const marker=sessionStorage.getItem(ADMIN_MARKER)
      if(!marker && !allowFreshSignIn){await signOutAndLeave();return}
      const {data,error}=await supabase.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle()
      if(error||!data){await signOutAndLeave();return}
      if(active)setVisible(Boolean(document.querySelector('.adminShell')))
    }

    const resetIdle=()=>{
      lastActivity=Date.now()
      if(idleTimer)clearTimeout(idleTimer)
      if(sessionStorage.getItem(ADMIN_MARKER)) idleTimer=setTimeout(()=>{if(Date.now()-lastActivity>=IDLE_LIMIT)signOutAndLeave()},IDLE_LIMIT)
    }

    const boot=async()=>{
      if(!window.location.pathname.startsWith('/admin'))return
      const {data:{session}}=await supabase.auth.getSession()
      await verify(session,false)
      if(sessionStorage.getItem(ADMIN_MARKER))resetIdle()
    }

    boot()
    const {data}=supabase.auth.onAuthStateChange(async(event,session)=>{
      if(event==='SIGNED_IN' && session){
        sessionStorage.setItem(ADMIN_MARKER,'1')
        await verify(session,true)
        resetIdle()
      }else if(event==='SIGNED_OUT'){
        sessionStorage.removeItem(ADMIN_MARKER)
        if(active)setVisible(false)
      }else if(session){
        await verify(session,false)
        resetIdle()
      }
    })

    const activityEvents=['click','keydown','mousemove','touchstart','scroll']
    activityEvents.forEach(name=>window.addEventListener(name,resetIdle,{passive:true}))
    const observer=new MutationObserver(()=>{if(window.location.pathname.startsWith('/admin'))setVisible(Boolean(document.querySelector('.adminShell')))})
    observer.observe(document.body,{childList:true,subtree:true})

    return()=>{active=false;observer.disconnect();data.subscription.unsubscribe();if(idleTimer)clearTimeout(idleTimer);activityEvents.forEach(name=>window.removeEventListener(name,resetIdle))}
  },[])

  if(!visible)return null

  const backToDashboard=()=>{
    const dashboardButton=Array.from(document.querySelectorAll('button')).find(button=>button.textContent?.trim().includes('Dashboard')) as HTMLButtonElement|undefined
    dashboardButton?.click()
    window.scrollTo({top:0,behavior:'smooth'})
  }

  return <button type="button" onClick={backToDashboard} style={{position:'fixed',top:18,right:24,zIndex:1000,border:'1px solid #d9e2e8',borderRadius:8,background:'#fff',color:'#075f35',padding:'10px 15px',fontWeight:800,fontSize:14,cursor:'pointer',boxShadow:'0 4px 14px rgba(0,0,0,.08)'}}>← Back to Dashboard</button>
}
