'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {supabase} from '../../../lib/supabase'
import '../admin.css'
import '../dashboard-cards.css'
import './students.css'

export default function ApprovedStudents(){
 const router=useRouter(); const [students,setStudents]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 useEffect(()=>{(async()=>{const {data:s}=await supabase.auth.getSession();if(!s.session){router.replace('/admin');return}const {data,error}=await supabase.from('student_profiles').select('*').eq('status','active').order('student_name');if(error)setError(error.message);setStudents(data||[]);setLoading(false)})()},[router])
 return <div className="studentsPage"><header className="studentsPageHead"><div><span className="adminKicker">STUDENT MANAGEMENT</span><h1>Approved Students</h1><p>Only students whose admission has been approved are shown here.</p></div><Link href="/admin" className="backDashboard">← Back to Dashboard</Link></header><div className="studentListBar"><div><strong>{students.length}</strong><span>Active Students</span></div><div className="studentListNote">Click any student to open the complete profile.</div></div>{loading?<div className="studentEmpty">Loading approved students…</div>:error?<div className="studentEmpty error">{error}</div>:!students.length?<div className="studentEmpty"><strong>No approved students yet</strong><span>Approve an admission from Admissions and the student will appear here.</span></div>:<div className="approvedStudentsGrid">{students.map(s=><button key={s.id} className="approvedStudentCard" onClick={()=>router.push(`/admin/students/${s.id}`)}><div className="approvedStudentPhoto">{s.student_photo_url?<img src={s.student_photo_url} alt=""/>:<span>{(s.student_name||'S').slice(0,1).toUpperCase()}</span>}</div><div className="approvedStudentInfo"><span className="studentStatus">ACTIVE STUDENT</span><h2>{s.student_name}</h2><strong>{s.student_id||'—'}</strong><p>Class {s.class_name||'—'} · Roll {s.roll_number||'Not assigned'}</p><small>Father: {s.father_name||'—'}</small></div><span className="studentOpenArrow">Open Profile →</span></button>)}</div>}</div>
}
