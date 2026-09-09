'use client'

import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import {supabase} from '../../../lib/supabase'
import '../admin.css'
import './results.css'

type Student = {
  id:number
  student_name:string
  student_id:string|null
  class_name:string|null
  dob:string|null
  father_name:string|null
  student_photo_url:string|null
}

type ResultRow = {
  id:number
  student_profile_id:number
  result_set_id:string|null
  exam_name:string
  session:string|null
  exam_date:string
  subject:string
  max_marks:number
  marks:number
  grade:string|null
  percentage:number|null
  remarks:string|null
}

type Group = {
  key:string
  student:Student
  exam_name:string
  session:string
  exam_date:string
  rows:ResultRow[]
  totalMax:number
  totalMarks:number
  percentage:number
  result:'PASS'|'FAIL'
  roll:number
}

const fmtDate=(d:string)=>d?new Date(`${d}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}):'—'
const pct=(max:number,marks:number)=>max?Math.max(0,Math.min(100,marks/max*100)):0
const overallResult=(rows:ResultRow[])=>rows.length>0&&rows.every(r=>pct(Number(r.max_marks),Number(r.marks))>=30)?'PASS':'FAIL'
const escapeHtml=(v:any)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))
const monthSafe=(v:string)=>v||''

export default function ResultsPage(){
  const [students,setStudents]=useState<Student[]>([])
  const [results,setResults]=useState<ResultRow[]>([])
  const [loading,setLoading]=useState(true)
  const [message,setMessage]=useState('')
  const [examName,setExamName]=useState('')
  const [examDate,setExamDate]=useState('')
  const [className,setClassName]=useState('')
  const [activeDoc,setActiveDoc]=useState<'all'|'marksheet'|'admit'|'notice'>('all')

  useEffect(()=>{load()},[])

  async function load(){
    setLoading(true)
    const {data:auth}=await supabase.auth.getSession()
    if(!auth.session){window.location.href='/admin';return}
    const [{data:s,error:se},{data:r,error:re}]=await Promise.all([
      supabase.from('student_profiles').select('id,student_name,student_id,class_name,dob,father_name,student_photo_url').eq('status','active').order('student_name'),
      supabase.from('student_results').select('id,student_profile_id,result_set_id,exam_name,session,exam_date,subject,max_marks,marks,grade,percentage,remarks').order('exam_date',{ascending:false})
    ])
    if(se)setMessage(se.message)
    if(re)setMessage(re.message)
    setStudents((s||[]) as Student[])
    setResults((r||[]) as ResultRow[])
    const first=r?.[0] as ResultRow|undefined
    if(first){setExamName(first.exam_name||'');setExamDate(first.exam_date||'')}
    setLoading(false)
  }

  const classes=useMemo(()=>Array.from(new Set(students.map(s=>s.class_name).filter(Boolean) as string[])).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})),[students])
  const examNames=useMemo(()=>Array.from(new Set(results.map(r=>r.exam_name).filter(Boolean))).sort(),[results])
  const examDates=useMemo(()=>Array.from(new Set(results.filter(r=>!examName||r.exam_name===examName).map(r=>r.exam_date).filter(Boolean))).sort().reverse(),[results,examName])

  const selectedGroups=useMemo(()=>{
    const map=new Map<string,Group>()
    for(const r of results){
      if(examName&&r.exam_name!==examName)continue
      if(examDate&&r.exam_date!==examDate)continue
      const st=students.find(s=>s.id===Number(r.student_profile_id))
      if(!st)continue
      if(className&&st.class_name!==className)continue
      const key=r.result_set_id||`${r.student_profile_id}|${r.exam_name}|${r.exam_date}|${r.session||''}`
      if(!map.has(key))map.set(key,{key,student:st,exam_name:r.exam_name,session:r.session||'',exam_date:r.exam_date,rows:[],totalMax:0,totalMarks:0,percentage:0,result:'FAIL',roll:0})
      map.get(key)!.rows.push(r)
    }
    const arr=[...map.values()].map(g=>{
      const totalMax=g.rows.reduce((n,r)=>n+Number(r.max_marks||0),0)
      const totalMarks=g.rows.reduce((n,r)=>n+Number(r.marks||0),0)
      return {...g,totalMax,totalMarks,percentage:totalMax?totalMarks/totalMax*100:0,result:overallResult(g.rows)}
    })
    arr.sort((a,b)=>b.totalMarks-a.totalMarks || a.student.student_name.localeCompare(b.student.student_name))
    return arr.map((g,i)=>({...g,roll:i+1}))
  },[results,students,examName,examDate,className])

  const admitStudents=useMemo(()=>{
    const source=className?students.filter(s=>s.class_name===className):students
    const withMarks=new Map<number,number>()
    selectedGroups.forEach(g=>withMarks.set(g.student.id,g.totalMarks))
    return [...source].sort((a,b)=>(withMarks.get(b.id)||-1)-(withMarks.get(a.id)||-1)||a.student_name.localeCompare(b.student_name)).map((s,i)=>({...s,examRoll:withMarks.has(s.id)?(selectedGroups.find(g=>g.student.id===s.id)?.roll||i+1):i+1}))
  },[students,className,selectedGroups])

  const selectedSession=selectedGroups[0]?.session||''
  const titleExam=examName||selectedGroups[0]?.exam_name||'Examination'
  const titleDate=examDate||selectedGroups[0]?.exam_date||''
  const ready=Boolean(examName&&examDate&&className)

  function printHtml(title:string,body:string){
    const win=window.open('','_blank','width=1100,height=900')
    if(!win){setMessage('Please allow pop-ups for printing and PDF.') ;return}
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{size:A4;margin:8mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#17233a;background:white}button{display:none!important}.printPage{page-break-after:always;break-after:page}.printPage:last-child{page-break-after:auto;break-after:auto}.schoolHead{text-align:center;border-bottom:2px solid #173d72;padding-bottom:9px;margin-bottom:10px}.schoolHead h1{margin:0;font-size:22px;letter-spacing:.5px;color:#173d72}.schoolHead p{margin:3px 0;font-size:10px}.docTitle{text-align:center;font-size:17px;font-weight:900;letter-spacing:1px;margin:8px 0}.meta{display:flex;justify-content:space-between;gap:12px;border:1px solid #cbd5e1;border-radius:6px;padding:7px 9px;font-size:10px;margin-bottom:9px}.studentTop{display:grid;grid-template-columns:1fr 76px;gap:10px;border:1px solid #cbd5e1;padding:9px;border-radius:7px}.studentInfo{display:grid;grid-template-columns:1fr 1fr;gap:5px 12px;font-size:10px}.label{font-size:8px;color:#667085;text-transform:uppercase;font-weight:800}.value{font-weight:700;font-size:11px}.photo{width:66px;height:78px;object-fit:cover;border:1px solid #aab5c5;border-radius:4px}.photoFallback{width:66px;height:78px;border:1px solid #aab5c5;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#173d72}.table{width:100%;border-collapse:collapse;font-size:9px}.table th,.table td{border:1px solid #aeb9c8;padding:5px 4px;text-align:center}.table th{background:#edf3fa;color:#173d72;font-weight:900}.table td:nth-child(2){text-align:left;font-weight:700}.total{margin-top:8px;display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #aeb9c8}.total div{padding:7px;text-align:center;border-right:1px solid #aeb9c8}.total div:last-child{border-right:0}.total b{display:block;font-size:12px;margin-top:2px}.pass{color:#16794c;font-weight:900}.fail{color:#b42318;font-weight:900}.signs{display:flex;justify-content:space-between;margin-top:35px;font-size:9px}.admit{border:2px solid #173d72;border-radius:10px;padding:14px}.admit .roll{font-size:20px;font-weight:900;color:#173d72}.noticeTable{width:100%;border-collapse:collapse;font-size:8px}.noticeTable th,.noticeTable td{border:1px solid #9ca9bb;padding:4px 3px;text-align:center}.noticeTable th{background:#173d72;color:#fff}.noticeTable td:nth-child(2){text-align:left;font-weight:700}.rank{font-weight:900;color:#173d72}.foot{text-align:center;margin-top:9px;font-size:8px;color:#667085}</style></head><body>${body}<script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`)
    win.document.close()
  }

  function marksheetBody(groups:Group[]){
    return groups.map(g=>`<section class="printPage"><div class="schoolHead"><h1>NEW SUNRISE PUBLIC SCHOOL</h1><p>Kallyangaon, Bihar – 854317</p></div><div class="docTitle">STATEMENT OF MARKS</div><div class="meta"><span><b>Exam:</b> ${escapeHtml(g.exam_name)}</span><span><b>Date:</b> ${fmtDate(g.exam_date)}</span><span><b>Session:</b> ${escapeHtml(g.session||'—')}</span><span><b>Roll No.:</b> ${g.roll}</span></div><div class="studentTop"><div class="studentInfo"><div><span class="label">Student Name</span><br><span class="value">${escapeHtml(g.student.student_name)}</span></div><div><span class="label">Student ID</span><br><span class="value">${escapeHtml(g.student.student_id||'—')}</span></div><div><span class="label">Father's Name</span><br><span class="value">${escapeHtml(g.student.father_name||'—')}</span></div><div><span class="label">Class</span><br><span class="value">${escapeHtml(g.student.class_name||'—')}</span></div><div><span class="label">Date of Birth</span><br><span class="value">${fmtDate(g.student.dob||'')}</span></div><div><span class="label">Overall Result</span><br><span class="value ${g.result==='PASS'?'pass':'fail'}">${g.result}</span></div></div>${g.student.student_photo_url?`<img class="photo" src="${escapeHtml(g.student.student_photo_url)}">`:`<div class="photoFallback">${escapeHtml((g.student.student_name||'S').slice(0,1).toUpperCase())}</div>`}</div><table class="table"><thead><tr><th>S.No.</th><th>Subject</th><th>Full Marks</th><th>Obtained</th><th>Percentage</th><th>Grade</th><th>Result</th></tr></thead><tbody>${g.rows.map((r,i)=>{const p=pct(Number(r.max_marks),Number(r.marks));const pass=p>=30?'PASS':'FAIL';return `<tr><td>${i+1}</td><td>${escapeHtml(r.subject)}</td><td>${Number(r.max_marks)}</td><td>${Number(r.marks)}</td><td>${p.toFixed(2)}%</td><td>${escapeHtml(r.grade||'—')}</td><td class="${pass==='PASS'?'pass':'fail'}">${pass}</td></tr>`}).join('')}</tbody></table><div class="total"><div><span class="label">Full Marks</span><b>${g.totalMax}</b></div><div><span class="label">Obtained Marks</span><b>${g.totalMarks}</b></div><div><span class="label">Overall %</span><b>${g.percentage.toFixed(2)}%</b></div><div><span class="label">Final Result</span><b class="${g.result==='PASS'?'pass':'fail'}">${g.result}</b></div></div><div class="signs"><span>Class Teacher Signature</span><span>Principal Signature</span><span>School Seal</span></div></section>`).join('')
  }

  function admitBody(){
    return admitStudents.map((s:any)=>`<section class="printPage"><div class="admit"><div class="schoolHead"><h1>NEW SUNRISE PUBLIC SCHOOL</h1><p>Kallyangaon, Bihar – 854317</p></div><div class="docTitle">ADMIT CARD</div><div class="meta"><span><b>Exam:</b> ${escapeHtml(titleExam)}</span><span><b>Date:</b> ${fmtDate(titleDate)}</span><span><b>Session:</b> ${escapeHtml(selectedSession||'—')}</span></div><div class="studentTop"><div class="studentInfo"><div><span class="label">Student Name</span><br><span class="value">${escapeHtml(s.student_name)}</span></div><div><span class="label">Exam Roll No.</span><br><span class="roll">${s.examRoll}</span></div><div><span class="label">Student ID</span><br><span class="value">${escapeHtml(s.student_id||'—')}</span></div><div><span class="label">Class</span><br><span class="value">${escapeHtml(s.class_name||'—')}</span></div><div><span class="label">Father's Name</span><br><span class="value">${escapeHtml(s.father_name||'—')}</span></div><div><span class="label">Date of Birth</span><br><span class="value">${fmtDate(s.dob||'')}</span></div></div>${s.student_photo_url?`<img class="photo" src="${escapeHtml(s.student_photo_url)}">`:`<div class="photoFallback">${escapeHtml((s.student_name||'S').slice(0,1).toUpperCase())}</div>`}</div><div style="margin-top:20px;border:1px dashed #aab5c5;padding:12px;font-size:10px;line-height:1.7"><b>Exam Instructions:</b><br>1. Bring this admit card on every examination day.<br>2. Reach the examination room before the reporting time announced by the school.<br>3. Carry only the materials permitted by the school.</div><div class="signs"><span>Class Teacher Signature</span><span>Principal Signature</span><span>School Seal</span></div></div></section>`).join('')
  }

  function noticeBody(){
    const subjects=Array.from(new Set(selectedGroups.flatMap(g=>g.rows.map(r=>r.subject))))
    return `<section><div class="schoolHead"><h1>NEW SUNRISE PUBLIC SCHOOL</h1><p>Kallyangaon, Bihar – 854317</p></div><div class="docTitle">RESULT NOTICE BOARD</div><div class="meta"><span><b>Exam:</b> ${escapeHtml(titleExam)}</span><span><b>Date:</b> ${fmtDate(titleDate)}</span><span><b>Class:</b> ${escapeHtml(className)}</span><span><b>Session:</b> ${escapeHtml(selectedSession||'—')}</span></div><table class="noticeTable"><thead><tr><th>Roll No.</th><th>Student Name</th>${subjects.map(s=>`<th>${escapeHtml(s)}</th>`).join('')}<th>Total</th><th>Overall %</th><th>Result</th></tr></thead><tbody>${selectedGroups.map(g=>`<tr><td class="rank">${g.roll}</td><td>${escapeHtml(g.student.student_name)}</td>${subjects.map(sub=>{const r=g.rows.find(x=>x.subject===sub);return `<td>${r?`${Number(r.marks)}/${Number(r.max_marks)}`:'—'}</td>`}).join('')}<td>${g.totalMarks}/${g.totalMax}</td><td>${g.percentage.toFixed(2)}%</td><td class="${g.result==='PASS'?'pass':'fail'}">${g.result}</td></tr>`).join('')}</tbody></table><div class="foot">Roll numbers are arranged by overall obtained marks, highest overall marks first.</div></section>`
  }

  function printType(type:'marksheet'|'admit'|'notice',single?:Group){
    if(type==='marksheet')printHtml(`Marksheets - ${titleExam}`,marksheetBody(single?[single]:selectedGroups))
    if(type==='admit')printHtml(`Admit Cards - ${titleExam}`,admitBody())
    if(type==='notice')printHtml(`Result Notice Board - ${titleExam}`,noticeBody())
  }

  if(loading)return <main className="resultsPage"><div className="resultsEmpty">Loading Results Management…</div></main>

  return <main className="resultsPage">
    <header className="resultsHeader"><div><span className="resultsKicker">ACADEMIC MANAGEMENT</span><h1>Results Management</h1><p>Exam select करें, date और class चुनें — उसी selection के अनुसार marksheet, admit card और result notice board तैयार होगा.</p></div><div className="resultsHeaderActions"><Link href="/admin">← Dashboard</Link><Link href="/admin/students">Approved Students</Link></div></header>

    {message&&<div className="resultsMessage">{message}</div>}

    <section className="resultSelector">
      <div className="selectorTitle"><div><span>STEP 1</span><h2>Exam & Class Select करें</h2></div><button className="refreshBtn" onClick={load}>↻ Refresh</button></div>
      <div className="selectorGrid">
        <label>Exam Name<select value={examName} onChange={e=>{setExamName(e.target.value);setExamDate('')}}><option value="">Select Exam</option>{examNames.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
        <label>Exam Date<select value={examDate} onChange={e=>setExamDate(e.target.value)}><option value="">Select Date</option>{examDates.map(x=><option key={x} value={x}>{fmtDate(x)}</option>)}</select></label>
        <label>Class<select value={className} onChange={e=>setClassName(e.target.value)}><option value="">Select Class</option>{classes.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
      </div>
      <div className={`selectionStatus ${ready?'ready':''}`}>{ready?<>✓ Selection ready: <b>{titleExam}</b> • {fmtDate(titleDate)} • <b>{className}</b> • <b>{selectedGroups.length}</b> result students</>:<>ऊपर Exam Name, Exam Date और Class select करें.</>}</div>
    </section>

    <section className="documentGrid">
      <article className={`documentCard marksheet ${activeDoc==='marksheet'?'chosen':''}`}><div className="documentIcon">📄</div><div><span className="docKicker">DOCUMENT 01</span><h2>Marksheet</h2><p>हर selected student की complete marksheet — subject-wise marks, percentage, grade और PASS/FAIL.</p></div><div className="docStats"><b>{selectedGroups.length}</b><span>Marksheets Ready</span></div><div className="docActions"><button disabled={!ready||!selectedGroups.length} onClick={()=>printType('marksheet')}>🖨 Print All</button><button disabled={!ready||!selectedGroups.length} onClick={()=>printType('marksheet')}>⬇ Download PDF</button></div></article>
      <article className={`documentCard admit ${activeDoc==='admit'?'chosen':''}`}><div className="documentIcon">🎫</div><div><span className="docKicker">DOCUMENT 02</span><h2>Admit Card</h2><p>Selected class के सभी active students के admit cards, exam roll number के साथ.</p></div><div className="docStats"><b>{ready?admitStudents.length:0}</b><span>Admit Cards Ready</span></div><div className="docActions"><button disabled={!ready||!admitStudents.length} onClick={()=>printType('admit')}>🖨 Print All</button><button disabled={!ready||!admitStudents.length} onClick={()=>printType('admit')}>⬇ Download PDF</button></div></article>
      <article className={`documentCard notice ${activeDoc==='notice'?'chosen':''}`}><div className="documentIcon">📢</div><div><span className="docKicker">DOCUMENT 03</span><h2>Result Notice Board</h2><p>एक ही table में सभी students, subject-wise marks, total, overall percentage और PASS/FAIL.</p></div><div className="docStats"><b>{selectedGroups.length}</b><span>Students in Board</span></div><div className="docActions"><button disabled={!ready||!selectedGroups.length} onClick={()=>printType('notice')}>🖨 Print</button><button disabled={!ready||!selectedGroups.length} onClick={()=>printType('notice')}>⬇ Download PDF</button></div></article>
    </section>

    <section className="resultPreview">
      <div className="previewHead"><div><span className="resultsKicker">STEP 2</span><h2>Selected Result Preview</h2></div><div className="previewActions"><button disabled={!ready||!selectedGroups.length} onClick={()=>printType('marksheet')}>📄 All Marksheets</button><button disabled={!ready||!admitStudents.length} onClick={()=>printType('admit')}>🎫 All Admit Cards</button><button disabled={!ready||!selectedGroups.length} onClick={()=>printType('notice')}>📢 Notice Board</button></div></div>
      {!ready?<div className="resultsEmpty small">Selection के बाद यहाँ students और उनके overall marks दिखेंगे.</div>:selectedGroups.length===0?<div className="resultsEmpty small"><strong>इस selection के लिए result नहीं मिला.</strong><span>पहले students के Results & Marksheet में उसी exam name और date पर marks save करें.</span></div>:<>
        <div className="rankingNote">🏆 <b>Exam Roll Number:</b> सबसे ज्यादा overall obtained marks वाले student को Roll No. <b>1</b>, फिर उसी क्रम में अगला roll number दिया गया है.</div>
        <div className="rankingTableWrap"><table className="rankingTable"><thead><tr><th>Roll</th><th>Student</th><th>Student ID</th><th>Class</th><th>Full Marks</th><th>Obtained</th><th>Overall %</th><th>Result</th><th>Marksheet</th></tr></thead><tbody>{selectedGroups.map(g=><tr key={g.key}><td className="rollCell">{g.roll}</td><td><b>{g.student.student_name}</b></td><td>{g.student.student_id||'—'}</td><td>{g.student.class_name||'—'}</td><td>{g.totalMax}</td><td><b>{g.totalMarks}</b></td><td>{g.percentage.toFixed(2)}%</td><td className={g.result==='PASS'?'passText':'failText'}>{g.result}</td><td><button className="miniBtn" onClick={()=>printType('marksheet',g)}>🖨 Print</button><button className="miniBtn" onClick={()=>printType('marksheet',g)}>⬇ PDF</button></td></tr>)}</tbody></table></div>
      </>}
    </section>
  </main>
}
