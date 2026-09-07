'use client'
import {useEffect} from 'react'
import {usePathname} from 'next/navigation'
import type {ReactNode} from 'react'
import {supabase} from '../../lib/supabase'
import './enquiry-dashboard.css'
import './marksheet-enhance.css'

function DashboardCardLinks(){
 useEffect(()=>{let enquiry:HTMLAnchorElement|null=null;let approved:HTMLElement|null=null;let take:HTMLAnchorElement|null=null
  const go=(e:Event)=>{e.preventDefault();e.stopImmediatePropagation();window.location.href='/admin/students'}
  const mount=()=>{const grid=document.querySelector<HTMLElement>('.dashboardActionGrid');if(!grid)return
   if(!enquiry){enquiry=document.createElement('a');enquiry.href='/admin/enquiries';enquiry.className='dashboardActionCard enquiryActionCard';enquiry.innerHTML='<span class="actionIcon">✉️</span><span class="actionText"><b>Enquiries</b><small>View, manage and reply to enquiries received from the school website.</small></span><span class="actionCount">School enquiries</span><span class="actionArrow">→</span>';grid.appendChild(enquiry)}
   if(!take){take=document.createElement('a');take.href='/admin/take-admission';take.className='dashboardActionCard takeActionCard';take.innerHTML='<span class="actionIcon">📝</span><span class="actionText"><b>Take Admission</b><small>Directly admit a new student and create portal access.</small></span><span class="actionCount">Direct admission</span><span class="actionArrow">→</span>';grid.appendChild(take)}
   const cards=grid.querySelectorAll<HTMLElement>('.dashboardActionCard');const next=Array.from(cards).find(x=>x.textContent?.includes('Approved Students'))||null;if(approved!==next){approved?.removeEventListener('click',go,true);approved=next;if(approved&&!approved.dataset.studentLink){approved.dataset.studentLink='true';approved.addEventListener('click',go,true)}}
  };mount();const observer=new MutationObserver(mount);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();enquiry?.remove();take?.remove();approved?.removeEventListener('click',go,true)}},[]);return null}

function EnhanceMarksheet(){
 useEffect(()=>{let active=true
  const run=async()=>{const {data}=await supabase.from('site_settings').select('key,value').in('key',['logo_url','school_logo','school_name','school_address']);if(!active)return;const settings=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));const logo=settings.logo_url||settings.school_logo||''
   const apply=()=>{const sheet=document.querySelector<HTMLElement>('.marksheetPreview.bsebStyle');if(!sheet)return;const header=sheet.querySelector('.boardHeader');const summary=sheet.querySelector('.sheetMeta');if(header){const seal=header.querySelector('.boardSeal');if(logo&&seal&&!header.querySelector('.schoolLogo')){const img=document.createElement('img');img.src=logo;img.className='schoolLogo';img.alt='School Logo';seal.replaceWith(img)}const small=header.querySelector('small');if(small&&settings.school_name)small.textContent=settings.school_name;const p=header.querySelector('p');if(p&&settings.school_address)p.textContent=settings.school_address}
    if(summary&&!summary.querySelector('.studentSheetPhoto')){const source=document.querySelector<HTMLElement>('.profilePhoto img') as HTMLImageElement|null;if(source?.src){const img=document.createElement('img');img.src=source.src;img.className='studentSheetPhoto';img.alt='Student Photo';summary.appendChild(img)}}}
   apply();const observer=new MutationObserver(apply);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect()};let cleanup:undefined|(()=>void);run().then(x=>{cleanup=x});return()=>{active=false;cleanup?.()}},[]);return null}

export default function AdminLayout({children}:{children:ReactNode}){const path=usePathname();return <>{children}{path==='/admin'&&<DashboardCardLinks/>}{path.startsWith('/admin/students/')&&<EnhanceMarksheet/>}</>}
