'use client'
import {useEffect,useMemo,useState} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {supabase} from '../../../lib/supabase'
import './attendance.css'

type Student={id:number;student_id:string;student_name:string;class_name:string;roll_number?:string|null;father_name?:string|null}
type Status='present'|'absent'|'leave'

const today=()=>new Date().toISOString().slice(0,10)
const pretty=(d:string)=>new Date(`${d}T00:00:00`).toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})

export default function AttendancePage(){
 const router=useRouter()
 const [students,setStudents]=useState<Student[]>([]),[records,setRecords]=useState<Record<number,Status>>({}),[notes,setNotes]=useState<Record<number,string>>({})
 const [date,setDate]=useState(today()),[classFilter,setClassFilter]=useState('All Classes'),[search,setSearch]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState('')
 useEffect(()=>{check()},[])
 useEffect(()=>{if(students.length)loadDate(date)},[date,students.length])
 async function check(){const {data}=await supabase.auth.getSession();if(!data.session){router.replace('/admin');return}await loadStudents()}
 async function loadStudents(){setLoading(true);const {data,error}=await supabase.from('student_profiles').select('id,student_id,student_name,class_name,roll_number,father_name').eq('status','active').order('class_name').order('roll_number').order('student_name');if(error)setMessage(error.message);else setStudents((data||[]) as Student[]);setLoading(false)}
 async function loadDate(d:string){const {data,error}=await supabase.from('student_attendance').select('student_profile_id,status,note').eq('attendance_date',d);if(error){setMessage(error.message);return}const next:Record<number,Status>={},ns:Record<number,string>={};(data||[]).forEach((r:any)=>{next[Number(r.student_profile_id)]=r.status as Status;if(r.note)ns[Number(r.student_profile_id)]=r.note});setRecords(next);setNotes(ns)}
 const classes=useMemo(()=>['All Classes',...Array.from(new Set(students.map(s=>s.class_name).filter(Boolean))).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))],[students])
 const visible=useMemo(()=>students.filter(s=>(classFilter==='All Classes'||s.class_name===classFilter)&&(`${s.student_name} ${s.student_id} ${s.father_name||''}`.toLowerCase().includes(search.toLowerCase()))),[students,classFilter,search])
 const counts=useMemo(()=>{let p=0,a=0,l=0,u=0;visible.forEach(s=>{const x=records[s.id];if(x==='present')p++;else if(x==='absent')a++;else if(x==='leave')l++;else u++});return {p,a,l,u,total:visible.length}},[visible,records])
 function setStatus(id:number,status:Status){setRecords(r=>({...r,[id]:status}))}
 function markAll(status:Status){setRecords(r=>{const n={...r};visible.forEach(s=>n[s.id]=status);return n})}
 async function saveAll(){if(!visible.length)return;setSaving(true);setMessage('');const payload=visible.map(s=>({student_profile_id:s.id,attendance_date:date,status:records[s.id]||'present',note:notes[s.id]||null}));const {error}=await supabase.from('student_attendance').upsert(payload,{onConflict:'student_profile_id,attendance_date'});if(error){setMessage(error.message)}else{setMessage(`Attendance saved for ${visible.length} students ✓`);await loadDate(date)}setSaving(false)}
 async function resetDay(){if(!confirm(`Clear attendance entries for ${pretty(date)}?`))return;const ids=visible.map(s=>s.id);if(!ids.length)return;const {error}=await supabase.from('student_attendance').delete().eq('attendance_date',date).in('student_profile_id',ids);setMessage(error?.message||'Attendance cleared for selected students.');if(!error)loadDate(date)}
 if(loading)return <div className="attendancePage"><div className="attendanceEmpty">Loading attendance…</div></div>
 return <main className="attendancePage">
  <div className="attendanceTop"><div><span className="attendanceKicker">ACADEMIC MANAGEMENT</span><h1>Attendance</h1><p>Mark daily Present, Absent or Leave — simple and fast.</p></div><Link href="/admin" className="backBtn">← Back to Dashboard</Link></div>
  {message&&<div className="attendanceMessage">{message}</div>}
  <section className="attendanceControls">
   <label><span>Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
   <div className="dateText"><b>{pretty(date)}</b><small>Attendance date</small></div>
   <label><span>Class</span><select value={classFilter} onChange={e=>setClassFilter(e.target.value)}>{classes.map(c=><option key={c}>{c}</option>)}</select></label>
   <label className="search"><span>Search</span><input placeholder="Student name / ID" value={search} onChange={e=>setSearch(e.target.value)}/></label>
  </section>
  <section className="attendanceSummary"><div><b>{counts.total}</b><span>Students</span></div><div className="present"><b>{counts.p}</b><span>Present</span></div><div className="absent"><b>{counts.a}</b><span>Absent</span></div><div className="leave"><b>{counts.l}</b><span>Leave</span></div><div className="unmarked"><b>{counts.u}</b><span>Not Marked</span></div></section>
  <section className="attendanceCard">
   <div className="attendanceCardHead"><div><h2>Student List</h2><p>{classFilter==='All Classes'?'All active students':classFilter} · {pretty(date)}</p></div><div className="quick"><span>Quick Mark:</span><button onClick={()=>markAll('present')}>✓ All Present</button><button onClick={()=>markAll('absent')}>All Absent</button></div></div>
   <div className="attendanceTableWrap"><table><thead><tr><th>#</th><th>Student</th><th>Student ID</th><th>Class</th><th>Attendance</th><th>Note</th></tr></thead><tbody>{visible.map((s,i)=>{const st=records[s.id]||'present';return <tr key={s.id}><td>{s.roll_number||i+1}</td><td><b>{s.student_name}</b><small>{s.father_name||''}</small></td><td>{s.student_id}</td><td>{s.class_name}</td><td><div className="statusButtons"><button className={st==='present'?'selected presentBtn':''} onClick={()=>setStatus(s.id,'present')}>Present</button><button className={st==='absent'?'selected absentBtn':''} onClick={()=>setStatus(s.id,'absent')}>Absent</button><button className={st==='leave'?'selected leaveBtn':''} onClick={()=>setStatus(s.id,'leave')}>Leave</button></div></td><td><input value={notes[s.id]||''} onChange={e=>setNotes(n=>({...n,[s.id]:e.target.value}))} placeholder="Optional note"/></td></tr>})}</tbody></table>{!visible.length&&<div className="attendanceEmpty">No active students found.</div>}</div>
   <div className="attendanceFooter"><button className="clearBtn" onClick={resetDay}>Clear Selected Date</button><button className="saveBtn" onClick={saveAll} disabled={saving||!visible.length}>{saving?'Saving…':'Save Attendance ✓'}</button></div>
  </section>
 </main>
}
