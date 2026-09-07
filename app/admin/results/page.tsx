'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {supabase} from '../../../lib/supabase'
import '../admin.css'
import '../students/students.css'

export default function ResultsPage(){
 const [students,setStudents]=useState<any[]>([]),[loading,setLoading]=useState(true),[message,setMessage]=useState('')
 useEffect(()=>{(async()=>{const {data:s}=await supabase.auth.getSession();if(!s.session){window.location.href='/admin';return}const {data,error}=await supabase.from('student_profiles').select('id,student_name,student_id,class_name,roll_number,student_photo_url').eq('status','active').order('student_name');if(error)setMessage(error.message);setStudents(data||[]);setLoading(false)})()},[])
 return <main className="studentsPage"><header className="studentsHeader"><div><span className="adminKicker">ACADEMIC MANAGEMENT</span><h1>Results & Marksheet</h1><p>Select an approved student to enter results, view history and print the professional marksheet.</p></div><div className="studentsHeaderActions"><Link href="/admin">← Dashboard</Link><Link href="/admin/students">Approved Students</Link></div></header>{message&&<div className="studentMessage">{message}</div>}{loading?<div className="studentEmpty">Loading students…</div>:students.length===0?<div className="studentEmpty"><strong>No approved students</strong><span>Approve a student first to manage results.</span></div>:<section className="studentsGrid">{students.map(s=><article className="studentCard" key={s.id}><div className="studentCardPhoto">{s.student_photo_url?<img src={s.student_photo_url} alt=""/>:<span>{(s.student_name||'S').slice(0,1)}</span>}</div><div className="studentCardBody"><span className="studentStatus">ACTIVE</span><h3>{s.student_name}</h3><p>{s.student_id||'—'} • Class {s.class_name||'—'} • Roll {s.roll_number||'—'}</p><Link className="studentOpenBtn" href={`/admin/students/${s.id}?tab=results`}>📊 Open Results & Marksheet →</Link></div></article>)}</section>}</main>
}
