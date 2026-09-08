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
     return `<div class="proMarksheet" data-sheet-index="${index}"><div class="proHeader"><div class="proLogoWrap">${logoHtml}</div><div class="proSchool"><p class="proSchoolName">${esc(schoolName)}</p><p class="proSchoolAddress">${esc(schoolAddress)}</p><p class="proSchoolMotto">KNOWLEDGE • CHARACTER • A BRIGHTER FUTURE</p></div><div class="proResultBadge ${badgeClass}"><strong>${final}</strong><span>${badgeIcon}</span></div></div><div class="proStatement">STATEMENT OF MARKS</div><div class="proExamBar"><div class="proExamItem"><b>Exam Name</b><strong>${esc(g.exam_name)}</strong></div><div class="proExamItem"><b>Date of Exam</b><strong>${esc(dateText(g.exam_date))}</strong></div><div class="proExamItem"><b>Session</b><strong>${esc(g.session)}</strong></div><div class="proExamItem"><b>Final Result</b><strong class="${final==='PASS'?'textPass':'textFail'}">${final}</strong></div></div><div class="proDetailsTitle">STUDENT DETAILS</div><div class="proDetails"><div class="proDetailsGrid"><div class="proDetail"><b>Student Name</b>${esc(student.student_name)}</div><div class="proDetail"><b>Student ID</b>${esc(student.student_id||admission?.student_unique_id)}</div><div class="proDetail"><b>Father's Name</b>${esc(student.father_name)}</div><div class="proDetail"><b>Mother's Name</b>${esc(student.mother_name)}</div><div class="proDetail"><b>Class</b>${esc(student.class_name)}</div><div class="proDetail"><b>Roll Number</b>${esc(student.roll_number)}</div><div class="proDetail"><b>Date of Birth</b>${esc(dateText(student.dob))}</div><div class="proDetail"><b>Application No.</b>${esc(application)}</div><div class="proDetail"><b>Admission Date</b>${esc(dateText(student.admission_date))}</div><div class="proDetail"><b>Mobile</b>${esc(student.phone)}</div></div><div class="proPhotoBox">${photo}<span class="proPhotoCaption">STUDENT PHOTO</span></div></div><div class="proSectionTitle">SUBJECT WISE MARKS</div><div class="proMarksWrap"><table class="proMarksTable"><thead><tr><th style="width:6%">S.No.</th><th style="width:28%">Subject</th><th style="width:12%">Full Marks</th><th style="width:13%">Obtained</th><th style="width:13%">Percentage</th><th style="width:11%">Grade</th><th style="width:12%">Result</th></tr></thead><tbody>${subjectRows||'<tr><td colspan="7">No marks entered</td></tr>'}</tbody></table></div><div class="proSummary"><div class="proSummaryCard"><b>Total Full Marks</b><strong>${full}</strong></div><div class="proSummaryCard"><b>Total Obtained</b><strong>${obtained}</strong></div><div class="proSummaryCard"><b>Overall Percentage</b><strong>${pct.toFixed(2)}%</strong></div><div class="proSummaryCard"><b>Overall Grade</b><strong>${overall}</strong></div><div class="proSummaryCard ${badgeClass}"><b>Final Result</b><strong>${final}</strong></div></div><div class="proResultNotice ${badgeClass}"><strong>${final==='PASS'?'Congratulations! Student has passed all subjects.':`Student has failed in ${failedSubjects.length} subject${failedSubjects.length>1?'s':''}.`}</strong></div><div class="proLower"><div class="proBox"><div class="proBoxTitle">GRADE SCALE</div><div class="proGradeGrid"><div class="proGradeCell">90–100 <b>A+</b></div><div class="proGradeCell">80–89 <b>A</b></div><div class="proGradeCell">70–79 <b>B+</b></div><div class="proGradeCell">60–69 <b>B</b></div><div class="proGradeCell">50–59 <b>C+</b></div><div class="proGradeCell">40–49 <b>C</b></div><div class="proGradeCell">30–39 <b>D+</b></div><div class="proGradeCell">20–29 <b>D</b></div><div class="proGradeCell">10–19 <b>E+</b></div><div class="proGradeCell">0–9 <b>E</b></div></div></div><div class="proBox"><div class="proBoxTitle">IMPORTANT NOTE</div><div class="proNotes"><ul><li>Student must pass every subject to receive PASS.</li><li>Subject below 30% is treated as FAIL.</li><li>Overall percentage and grade are calculated from total marks.</li><li>This marksheet is generated from the school's academic record.</li></ul></div></div></div><div class="proFooter"><div class="proSign"><div class="proSignLine"></div><b>Class Teacher</b><span>Signature</span></div><div class="proStamp">${esc(schoolName)}<br>OFFICIAL SCHOOL SEAL<br>AUTHORIZED</div><div class="proSign"><div class="proSignLine"></div><b>Principal</b><span>Signature</span></div></div><div class="proFooterBar">BETTER EDUCATION • BRIGHTER TOMORROW</div></div>`
    }
    const parent=old.parentElement;if(!parent)return
    parent.querySelectorAll('.proMarksToolsWrap,.proMarksheet').forEach(x=>x.remove())
    const targetGroups=groups.length?groups:[{exam_name:'Examination',session:'—',exam_date:'',rows:[]}]
    targetGroups.forEach((g,i)=>{const tools=document.createElement('div');tools.className='marksheetTools proMarksToolsWrap';const label=document.createElement('div');label.className='marksheetResultLabel';label.textContent=`${g.exam_name||'Examination'} • ${g.session||'—'}`;const actions=document.createElement('div');actions.className='marksheetToolActions';const print=document.createElement('button');print.type='button';print.className='marksheetToolBtn print';print.textContent='🖨 Print Marksheet';const download=document.createElement('button');download.type='button';download.className='marksheetToolBtn download';download.textContent='⬇ Download PDF';download.title='Choose Save as PDF in the print window';actions.appendChild(print);actions.appendChild(download);tools.appendChild(label);tools.appendChild(actions);const holder=document.createElement('div');holder.innerHTML=makeSheet(g,i);const sheet=holder.firstElementChild as HTMLElement;const printOne=(savePdf:boolean)=>{const title=document.title;document.title=`${student.student_name||'Student'} - ${g.exam_name||'Marksheet'}`;document.querySelectorAll<HTMLElement>('.proMarksheet').forEach(x=>x.removeAttribute('data-print-target'));sheet.setAttribute('data-print-target','true');if(savePdf)document.body.setAttribute('data-save-pdf','true');window.print();setTimeout(()=>{sheet.removeAttribute('data-print-target');document.body.removeAttribute('data-save-pdf');document.title=title},1200)};print.onclick=()=>printOne(false);download.onclick=()=>printOne(true);parent.appendChild(tools);parent.appendChild(sheet)})
    old.remove()
   }finally{busy=false}
  }
  const tick=()=>{if(document.querySelector('.marksheetPreview.bsebStyle'))run()}
  timer=setInterval(tick,700)
  tick()
  return()=>{cancelled=true;if(timer)clearInterval(timer)}
 },[]);return null}

export default function AdminLayout({children}:{children:ReactNode}){const path=usePathname();return <>{children}{path==='/admin'&&<DashboardCardLinks/>}{path.startsWith('/admin/students/')&&<EnhanceMarksheet/>}</>}
