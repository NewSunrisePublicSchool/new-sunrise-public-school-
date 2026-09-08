'use client'
import {useEffect} from 'react'
import {usePathname} from 'next/navigation'
import type {ReactNode} from 'react'
import {supabase} from '../../lib/supabase'
import './enquiry-dashboard.css'
import './marksheet-enhance.css'
import './marksheet-professional.css'

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

const esc=(value:any)=>String(value??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))
const grade=(p:number)=>p>=90?'A+':p>=80?'A':p>=70?'B+':p>=60?'B':p>=50?'C+':p>=40?'C':p>=30?'D+':p>=20?'D':p>=10?'E+':'E'
const result=(p:number)=>p>=30?'PASS':'FAIL'
const dateText=(value:any)=>{if(!value)return '—';const d=new Date(String(value)+'T00:00:00');if(Number.isNaN(d.getTime()))return String(value);return d.toLocaleDateString('en-GB')}

function EnhanceMarksheet(){
 useEffect(()=>{let cancelled=false;let busy=false;let timer:ReturnType<typeof setInterval>|null=null
  const run=async()=>{
   if(cancelled||busy||!window.location.pathname.startsWith('/admin/students/'))return
   const old=document.querySelector<HTMLElement>('.marksheetPreview.bsebStyle');if(!old)return
   busy=true
   try{
    const sid=window.location.pathname.split('/').pop()||'';if(!sid)return
    const [{data:settingsData},{data:student},{data:resultsData}]=await Promise.all([
     supabase.from('site_settings').select('key,value').in('key',['logo_url','school_logo','school_name','school_address']),
     supabase.from('student_profiles').select('*').eq('id',sid).single(),
     supabase.from('student_results').select('*').eq('student_profile_id',sid).order('exam_date',{ascending:false})
    ])
    if(cancelled||!student)return
    let admission:any=null
    if(student.admission_id){const q=await supabase.from('admissions').select('application_number,student_unique_id,application_no').eq('id',student.admission_id).maybeSingle();admission=q.data}
    if(cancelled)return
    const settings=Object.fromEntries((settingsData||[]).map((x:any)=>[x.key,x.value]))
    const logo=settings.logo_url||settings.school_logo||''
    const schoolName=settings.school_name||'NEW SUNRISE PUBLIC SCHOOL'
    const schoolAddress=settings.school_address||'Kallyangaon, Bihar – 854317'
    const application=student.application_number||student.application_no||admission?.application_number||admission?.application_no||'—'
    const rows=resultsData||[]
    const map=new Map<string,any>()
    for(const x of rows){const key=x.result_set_id||`${x.exam_name||''}|${x.session||''}|${x.exam_date||''}`;if(!map.has(key))map.set(key,{exam_name:x.exam_name||'Examination',session:x.session||'—',exam_date:x.exam_date||'',rows:[]});map.get(key).rows.push(x)}
    const groups=[...map.values()]
    const makeSheet=(g:any,index:number)=>{
     const cleanRows=g.rows||[]
     const full=cleanRows.reduce((n:any,x:any)=>n+Number(x.max_marks||0),0)
     const obtained=cleanRows.reduce((n:any,x:any)=>n+Number(x.marks||0),0)
     const pct=full?obtained/full*100:0
     const overall=grade(pct)
     const failedSubjects=cleanRows.filter((x:any)=>{const m=Number(x.max_marks||0),o=Number(x.marks||0),p=m?Math.max(0,Math.min(100,o/m*100)):0;return result(p)==='FAIL'})
     const final=failedSubjects.length>0?'FAIL':'PASS'
     const badgeClass=final==='PASS'?'pass':'fail'
     const badgeIcon=final==='PASS'?'✓':'×'
     const photo=student.student_photo_url?`<img class="proPhoto" src="${esc(student.student_photo_url)}" alt="Student Photo">`:'<div class="proPhotoPlaceholder">PHOTO</div>'
     const logoHtml=logo?`<img class="proLogo" src="${esc(logo)}" alt="School Logo">`:'<div class="proLogoFallback">NSPS</div>'
     const subjectRows=cleanRows.map((x:any,i:number)=>{const m=Number(x.max_marks||0),o=Number(x.marks||0),p=m?Math.max(0,Math.min(100,o/m*100)):0;const r=result(p);return `<tr class="${r==='FAIL'?'subjectFail':''}"><td>${i+1}</td><td>${esc(x.subject)}</td><td>${m}</td><td>${o}</td><td>${p.toFixed(2)}%</td><td>${grade(p)}</td><td class="${r==='PASS'?'resultPass':'resultFail'}">${r}</td></tr>`}).join('')
     return `<div class="proMarksheet" data-sheet-index="${index}"><div class="proHeader"><div class="proLogoWrap">${logoHtml}</div><div class="proSchool"><p class="proSchoolName">${esc(schoolName)}</p><p class="proSchoolAddress">${esc(schoolAddress)}</p><p class="proSchoolMotto">KNOWLEDGE • CHARACTER • A BRIGHTER FUTURE</p></div><div class="proResultBadge ${badgeClass}"><strong>${final}</strong><span>${badgeIcon}</span></div></div><div class="proStatement">STATEMENT OF MARKS</div><div class="proExamBar"><div class="proExamItem"><b>Exam Name</b><strong>${esc(g.exam_name)}</strong></div><div class="proExamItem"><b>Date of Exam</b><strong>${esc(dateText(g.exam_date))}</strong></div><div class="proExamItem"><b>Session</b><strong>${esc(g.session)}</strong></div><div class="proExamItem"><b>Final Result</b><strong class="${final==='PASS'?'textPass':'textFail'}">${final}</strong></div></div><div class="proDetailsTitle">STUDENT DETAILS</div><div class="proDetails"><div class="proDetailsGrid"><div class="proDetail"><b>Student Name</b>${esc(student.student_name)}</div><div class="proDetail"><b>Student ID</b>${esc(student.student_id||admission?.student_unique_id)}</div><div class="proDetail"><b>Father's Name</b>${esc(student.father_name)}</div><div class="proDetail"><b>Mother's Name</b>${esc(student.mother_name)}</div><div class="proDetail"><b>Class</b>${esc(student.class_name)}</div><div class="proDetail"><b>Roll Number</b>${esc(student.roll_number)}</div><div class="proDetail"><b>Date of Birth</b>${esc(dateText(student.dob))}</div><div class="proDetail"><b>Application No.</b>${esc(application)}</div><div class="proDetail"><b>Admission Date</b>${esc(dateText(student.admission_date))}</div><div class="proDetail"><b>Mobile</b>${esc(student.phone)}</div></div><div class="proPhotoBox">${photo}<span class="proPhotoCaption">STUDENT PHOTO</span></div></div><div class="proSectionTitle">SUBJECT WISE MARKS</div><div class="proMarksWrap"><table class="proMarksTable"><thead><tr><th style="width:6%">S.No.</th><th style="width:28%">Subject</th><th style="width:12%">Full Marks</th><th style="width:13%">Obtained</th><th style="width:13%">Percentage</th><th style="width:11%">Grade</th><th style="width:12%">Result</th></tr></thead><tbody>${subjectRows||'<tr><td colspan="7">No marks entered</td></tr>'}</tbody></table></div><div class="proSummary"><div class="proSummaryCard"><b>Total Full Marks</b><strong>${full}</strong></div><div class="proSummaryCard"><b>Total Obtained</b><strong>${obtained}</strong></div><div class="proSummaryCard"><b>Overall Percentage</b><strong>${pct.toFixed(2)}%</strong></div><div class="proSummaryCard"><b>Overall Grade</b><strong>${overall}</strong></div><div class="proSummaryCard ${badgeClass}"><b>Final Result</b><strong>${final}</strong></div></div><div class="proResultNotice ${badgeClass}"><strong>${final==='PASS'?'Congratulations! Student has passed all subjects.':`Student has failed in ${failedSubjects.length} subject${failedSubjects.length>1?'s':''}.`}</strong></div><div class="proLower"></div><div class="proFooter"><div class="proSign"><div class="proSignLine"></div><b>Class Teacher</b><span>Signature</span></div><div class="proStamp">${esc(schoolName)}<br>OFFICIAL SCHOOL SEAL<br>AUTHORIZED</div><div class="proSign"><div class="proSignLine"></div><b>Principal</b><span>Signature</span></div></div><div class="proFooterBar">BETTER EDUCATION • BRIGHTER TOMORROW</div></div>`
    }
    const parent=old.parentElement;if(!parent)return
    parent.querySelectorAll('.proMarksToolsWrap,.proMarksheet').forEach(x=>x.remove())
    const targetGroups=groups.length?groups:[{exam_name:'Examination',session:'—',exam_date:'',rows:[]}]
    targetGroups.forEach((g,i)=>{const tools=document.createElement('div');tools.className='marksheetTools proMarksToolsWrap';const label=document.createElement('div');label.className='marksheetResultLabel';label.textContent=`${g.exam_name||'Examination'} • ${g.session||'—'}`;const actions=document.createElement('div');actions.className='marksheetToolActions';const print=document.createElement('button');print.type='button';print.className='marksheetToolBtn print';print.textContent='🖨 Print Marksheet';const download=document.createElement('button');download.type='button';download.className='marksheetToolBtn download';download.textContent='⬇ Download PDF';download.title='Choose Save as PDF in the print window';actions.appendChild(print);actions.appendChild(download);tools.appendChild(label);tools.appendChild(actions);const holder=document.createElement('div');holder.innerHTML=makeSheet(g,i);const sheet=holder.firstElementChild as HTMLElement;if(i===targetGroups.length-1)sheet.setAttribute('data-last-sheet','true');
      const printOne=()=>{
        const printWindow=window.open('','_blank','width=1000,height=900');
        if(!printWindow){alert('Please allow pop-ups for this school website to print or save the marksheet as PDF.');return}
        const styleHtml=Array.from(document.querySelectorAll('link[rel="stylesheet"],style')).map((el:any)=>{if(el.tagName.toLowerCase()==='link'){const href=(el as HTMLLinkElement).href;return `<link rel="stylesheet" href="${esc(href)}">`}return el.outerHTML}).join('');
        printWindow.document.open();
        printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><base href="${esc(window.location.origin)}/"><title>${esc(student.student_name||'Student')} - ${esc(g.exam_name||'Marksheet')}</title>${styleHtml}<style>@page{size:A4 portrait;margin:6mm}html,body{margin:0!important;padding:0!important;background:#fff!important}body{font-family:Arial,Helvetica,sans-serif}.printOnlySheet{display:block!important;width:100%!important;margin:0!important;padding:0!important}.proMarksheet{display:block!important;visibility:visible!important;width:100%!important;max-width:none!important;margin:0!important;box-shadow:none!important;page-break-after:avoid!important;break-after:avoid!important}.proMarksheet *{visibility:visible!important}.proDetails{display:grid!important;grid-template-columns:1fr 125px!important;gap:12px!important}.proDetailsGrid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:0 15px!important}.proPhotoBox{display:block!important;align-self:start!important;justify-self:stretch!important;box-sizing:border-box!important}.proPhoto{width:108px!important;height:122px!important;object-fit:cover!important;display:block!important;margin:0 auto!important}.proPhotoPlaceholder{width:108px!important;height:122px!important;display:grid!important;place-items:center!important;margin:0 auto!important}.proPhotoCaption{display:block!important}.proHeader{padding:6mm 2mm 4mm}.proSchoolName{font-size:24px!important}.proSchoolAddress{font-size:10px!important}.proDetail{font-size:11px!important}.proDetail b{font-size:9px!important;min-width:96px!important}.proExamItem{font-size:11px!important}.proExamItem b{font-size:8px!important}.proExamItem strong{font-size:11px!important}.proMarksTable th{font-size:9px!important;padding:2.5mm 1.5mm!important}.proMarksTable td{font-size:10px!important;padding:2.2mm 1.5mm!important}.proSummaryCard b{font-size:8px!important}.proSummaryCard strong{font-size:15px!important}.proResultNotice{font-size:10px!important}.proFooter{margin-top:4mm!important}.proFooterBar{font-size:8px!important}.proMarksheet,.proMarksheet *{box-sizing:border-box!important}img{print-color-adjust:exact;-webkit-print-color-adjust:exact}@media print{html,body{width:100%!important;overflow:hidden!important}.proMarksheet{page-break-after:avoid!important;break-after:avoid!important;overflow:hidden!important}}</style></head><body><div class="printOnlySheet">${sheet.outerHTML}</div></body></html>`);
        printWindow.document.close();
        const prepareAndPrint=async()=>{
          try{
            const images=Array.from(printWindow.document.images);
            await Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise<void>(resolve=>{img.addEventListener('load',()=>resolve(),{once:true});img.addEventListener('error',()=>resolve(),{once:true})})));
            await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
            const printSheet=printWindow.document.querySelector<HTMLElement>('.proMarksheet');
            const wrapper=printWindow.document.querySelector<HTMLElement>('.printOnlySheet');
            if(printSheet&&wrapper){const pageHeightPx=285*96/25.4;const measuredHeight=printSheet.getBoundingClientRect().height;if(measuredHeight>pageHeightPx){const scale=Math.max(0.78,Math.min(1,pageHeightPx/measuredHeight));printSheet.style.transformOrigin='top left';printSheet.style.transform=`scale(${scale})`;wrapper.style.height=`${measuredHeight*scale}px`}}
          }catch(e){}
          setTimeout(()=>{try{printWindow.focus();printWindow.print()}catch(e){}},150);
        };
        if(printWindow.document.readyState==='complete')prepareAndPrint();else printWindow.onload=prepareAndPrint;
      };
      print.onclick=printOne;
      download.onclick=printOne;
      parent.appendChild(tools);parent.appendChild(sheet)
    })
    old.remove()
   }finally{busy=false}
  }
  const tick=()=>{if(document.querySelector('.marksheetPreview.bsebStyle'))run()}
  timer=setInterval(tick,700)
  tick()
  return()=>{cancelled=true;if(timer)clearInterval(timer)}
 },[]);return null}

export default function AdminLayout({children}:{children:ReactNode}){const path=usePathname();return <>{children}{path==='/admin'&&<DashboardCardLinks/>}{path.startsWith('/admin/students/')&&<EnhanceMarksheet/>}</>}
