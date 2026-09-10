'use client'
import {useState} from 'react'
import Link from 'next/link'
import {supabase} from '../../../lib/supabase'
import '../admin.css'
import './take-admission.css'

const slug=(v:string)=>v.toUpperCase().replace(/[^A-Z]/g,'').slice(0,3)
const makeStudentId=(name:string,dob:string)=>`NSPS${slug(name)}${dob?dob.slice(8,10)+dob.slice(5,7)+dob.slice(2,4):''}`

export default function TakeAdmissionPage(){
 const [form,setForm]=useState({student_name:'',dob:'',class_name:'',roll_number:'',father_name:'',mother_name:'',phone:'',email:'',address:'',monthly_fee:''})
 const [saving,setSaving]=useState(false),[message,setMessage]=useState(''),[created,setCreated]=useState<any>(null)
 const set=(k:string,v:string)=>setForm(x=>({...x,[k]:v}))
 async function submit(e:React.FormEvent){e.preventDefault();setMessage('');setCreated(null);if(!form.student_name||!form.dob||!form.class_name||!form.father_name||!form.phone)return setMessage('Please fill all required fields.');setSaving(true)
  const studentId=makeStudentId(form.student_name,form.dob)
  const application=`NSPS-ADM-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Date.now().toString().slice(-5)}`
  const {data:admission,error:aerr}=await supabase.from('admissions').insert({student_name:form.student_name,dob:form.dob,class_applied:form.class_name,father_name:form.father_name,mother_name:form.mother_name||null,phone:form.phone,email:form.email||null,address:form.address||null,message:'Admission created directly by admin.',status:'verified',application_number:application,student_unique_id:studentId,reviewed_at:new Date().toISOString()}).select('id').single()
  if(aerr||!admission){setMessage(aerr?.message||'Admission could not be created.');setSaving(false);return}
  const {data:profile,error:perr}=await supabase.from('student_profiles').insert({admission_id:admission.id,student_id:studentId,student_name:form.student_name,dob:form.dob,class_name:form.class_name,father_name:form.father_name,mother_name:form.mother_name||null,phone:form.phone,email:form.email||null,address:form.address||null,roll_number:form.roll_number||null,admission_date:new Date().toISOString().slice(0,10),status:'active',monthly_fee:Number(form.monthly_fee||0),must_change_password:true}).select('id').single()
  if(perr||!profile){await supabase.from('admissions').delete().eq('id',admission.id);setMessage(perr?.message||'Student profile could not be created.');setSaving(false);return}
  const {data:sessionData}=await supabase.auth.getSession()
  const accessToken=sessionData.session?.access_token
  if(!accessToken){setMessage('Admission created, but admin session expired. Please login again and open Approved Students.');setCreated({application,studentId,portalReady:false});setSaving(false);return}
  const {data:provision,error:provErr}=await supabase.functions.invoke('student-portal-v3',{body:{action:'provision',admission_id:admission.id},headers:{Authorization:`Bearer ${accessToken}`}})
  if(provErr||provision?.error){setMessage(`Admission created, but portal login could not be provisioned: ${provErr?.message||provision?.error||'unknown error'}`);setCreated({application,studentId,portalReady:false});setSaving(false);return}
  setCreated({application,studentId,temporaryPassword:provision.temporary_password,portalReady:true});setMessage('Admission completed successfully ✓');setForm({student_name:'',dob:'',class_name:'',roll_number:'',father_name:'',mother_name:'',phone:'',email:'',address:'',monthly_fee:''});setSaving(false)
 }
 return <div className="takeAdmissionPage"><header className="takeTop"><div><span className="adminKicker">ADMIN ADMISSION</span><h1>Take Admission</h1><p>Create an approved student directly from the admin panel.</p></div><div className="takeActions"><Link href="/admin">← Dashboard</Link><Link href="/admin/students">Approved Students</Link></div></header>
  {message&&<div className={created?.portalReady?'successBox':'messageBox'}>{message}</div>}
  {created&&<div className="admissionResult"><div><span>APPLICATION NUMBER</span><b>{created.application}</b></div><div><span>STUDENT ID</span><b>{created.studentId}</b></div>{created.portalReady&&<div><span>FIRST LOGIN PASSWORD</span><b>{created.temporaryPassword}</b><small>Student must change this password after first login.</small></div>}<Link href="/admin/students">Open Approved Students →</Link></div>}
  <form onSubmit={submit} className="takeForm"><div className="formTitle"><span>DIRECT ADMISSION</span><h2>Student Information</h2><p>Student is approved immediately and added to the active student list.</p></div><div className="takeGrid">{[['student_name','Student Name *'],['dob','Date of Birth *'],['class_name','Class *'],['roll_number','Roll Number']].map(([k,l])=><label key={k}>{l}<input type={k==='dob'?'date':'text'} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} required={k!=='roll_number'} /></label>)}{[['father_name',"Father's Name *"],['mother_name',"Mother's Name"] ,['phone','Mobile Number *'],['email','Email Address']].map(([k,l])=><label key={k}>{l}<input type="text" value={(form as any)[k]} onChange={e=>set(k,e.target.value)} required={k==='father_name'||k==='phone'} /></label>)}<label>Monthly Fee (₹)<input type="number" min="0" value={form.monthly_fee} onChange={e=>set('monthly_fee',e.target.value)} placeholder="Optional" /></label><label className="wide">Full Address<textarea value={form.address} onChange={e=>set('address',e.target.value)} /></label></div><div className="takeFooter"><div><b>✓ Approved instantly</b><span>✓ Student portal account created</span><span>✓ DOB becomes temporary password</span></div><button type="submit" disabled={saving}>{saving?'Creating Admission…':'✓ Take Admission'}</button></div></form>
 </div>
}
