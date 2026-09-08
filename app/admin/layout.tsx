'use client'
import {useEffect} from 'react'
import {usePathname} from 'next/navigation'
import type {ReactNode} from 'react'
import {supabase} from '../../lib/supabase'
import './enquiry-dashboard.css'
import './marksheet-enhance.css'

function DashboardCardLinks(){
 useEffect(()=>{let enquiry:HTMLAnchorElement|null=null;let approved:HTMLElement|null=null;let take:HTMLAnchorElement|null=null;let results:HTMLElement|null=null
  const goStudents=(e:Event)=>{e.preventDefault();e.stopImmediatePropagation();window.location.href='/admin/students'}
  const goResults=(e:Event)=>{e.preventDefault();e.stopImmediatePropagation();window.location.href='/admin/results'}
  const mount=()=>{const grid=document.querySelector<HTMLElement>('.dashboardActionGrid');if(!grid)return
   if(!enquiry){enquiry=document.createElement('a');enquiry.href='/admin/enquiries';enquiry.className='dashboardActionCard enquiryActionCard';enquiry.innerHTML='<span class="actionIcon">✉️</span><span class="actionText"><b>Enquiries</b><small>View, manage and reply to enquiries received from the school website.</small></span><span class="actionCount">School enquiries</span><span class="actionArrow">→</span>';grid.appendChild(enquiry)}
   if(!take){take=document.createElement('a');take.href='/admin/take-admission';take.className='dashboardActionCard takeActionCard';take.innerHTML='<span class="actionIcon">📝</span><span class="actionText"><b>Take Admission</b><small>Directly admit a new student and create portal access.</small></span><span class="actionCount">Direct admission</span><span class="actionArrow">→</span>';grid.appendChild(take)}
   const cards=grid.querySelectorAll<HTMLElement>('.dashboardActionCard')
   const nextApproved=Array.from(cards).find(x=>x.textContent?.includes('Approved Students'))||null;if(approved!==nextApproved){approved?.removeEventListener('click',goStudents,true);approved=nextApproved;if(approved&&!approved.dataset.studentLink){approved.dataset.studentLink='true';approved.addEventListener('click',goStudents,true)}}
   const nextResults=Array.from(cards).find(x=>x.textContent?.trim().startsWith('Results'))||null;if(results!==nextResults){results?.removeEventListener('click',goResults,true);results=nextResults;if(results&&!results.dataset.resultLink){results.dataset.resultLink='true';results.addEventListener('click',goResults,true)}}
  }
  mount();const observer=new MutationObserver(mount);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();enquiry?.remove();take?.remove();approved?.removeEventListener('click',goStudents,true);results?.removeEventListener('click',goResults,true)}
 },[]);return null}

function EnhanceMarksheet(){
 useEffect(()=>{let cancelled=false;let timer:ReturnType<typeof setTimeout>|null=null
  const run=async()=>{const {data}=await supabase.from('site_settings').select('key,value').in('key',['logo_url','school_logo','school_name','school_address']);if(cancelled)return;const settings=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));const logo=settings.logo_url||settings.school_logo||''
   const printOne=(sheet:HTMLElement,download=false)=>{const previousTitle=document.title;const student=document.querySelector('.profileSummary h2')?.textContent?.trim()||'Student';const exam=sheet.querySelector('.boardBadge')?.textContent?.trim()||'Marksheet';document.title=`${student} - ${exam}`;document.querySelectorAll<HTMLElement>('.marksheetPreview').forEach(x=>x.removeAttribute('data-print-target'));sheet.setAttribute('data-print-target','true');if(download)document.body.setAttribute('data-save-pdf','true');window.print();setTimeout(()=>{sheet.removeAttribute('data-print-target');document.body.removeAttribute('data-save-pdf');document.title=previousTitle},800)}
   const addTools=(sheet:HTMLElement)=>{if(sheet.previousElementSibling?.classList.contains('marksheetTools'))return;const tools=document.createElement('div');tools.className='marksheetTools';const print=document.createElement('button');print.type='button';print.className='marksheetToolBtn print';print.textContent='🖨 Print Marksheet';print.onclick=()=>printOne(sheet,false);const download=document.createElement('button');download.type='button';download.className='marksheetToolBtn download';download.textContent='⬇ Download PDF';download.title='Use the browser print dialog and choose Save as PDF';download.onclick=()=>printOne(sheet,true);tools.append(print,download);sheet.parentElement?.insertBefore(tools,sheet)}
   const apply=()=>{if(cancelled||!window.location.pathname.startsWith('/admin/students/'))return false;const sheets=document.querySelectorAll<HTMLElement>('.marksheetPreview.bsebStyle');if(!sheets.length)return false;for(const sheet of Array.from(sheets))addTools(sheet);const sheet=sheets[0];const header=sheet.querySelector('.boardHeader');const summary=sheet.querySelector('.sheetMeta');if(header){const seal=header.querySelector('.boardSeal');if(logo&&seal&&!header.querySelector('.schoolLogo')){const img=document.createElement('img');img.src=logo;img.className='schoolLogo';img.alt='School Logo';seal.replaceWith(img)}const small=header.querySelector('small');if(small&&settings.school_name)small.textContent=settings.school_name;const p=header.querySelector('p');if(p&&settings.school_address)p.textContent=settings.school_address}
    if(summary&&!summary.querySelector('.studentSheetPhoto')){const source=document.querySelector<HTMLElement>('.profilePhoto img') as HTMLImageElement|null;if(source?.src){const img=document.createElement('img');img.src=source.src;img.className='studentSheetPhoto';img.alt='Student Photo';summary.appendChild(img)}}return true}
   let attempts=0;const tick=()=>{if(cancelled)return;const found=apply();if(!found&&attempts<20){attempts++;timer=setTimeout(tick,250)}};tick()
   if(new URLSearchParams(window.location.search).get('tab')==='results'){let tries=0;const open=()=>{if(cancelled)return;const btn=Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent?.includes('Results & Marksheet'));if(btn){btn.click();setTimeout(tick,100);return}if(tries++<20)timer=setTimeout(open,250)};setTimeout(open,250)}
  };run();return()=>{cancelled=true;if(timer)clearTimeout(timer)}
 },[]);return null}

export default function AdminLayout({children}:{children:ReactNode}){const path=usePathname();return <>{children}{path==='/admin'&&<DashboardCardLinks/>}{path.startsWith('/admin/students/')&&<EnhanceMarksheet/>}</>}
