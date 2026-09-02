'use client'
import './admission.css'
import {useState} from 'react'
import Link from 'next/link'
import {supabase} from '../../lib/supabase'

const classes=['Nursery','LKG','UKG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8']

async function upload(file:File, folder:string){
 if(!file) return ''
 const allowed=['image/jpeg','image/png','image/webp','application/pdf']
 if(!allowed.includes(file.type)) throw new Error('Please upload JPG, PNG, WEBP or PDF.')
 if(file.size>5*1024*1024) throw new Error('File must be 5 MB or smaller.')
 const ext=(file.name.split('.').pop()||'file').toLowerCase().replace(/[^a-z0-9]/g,'')
 const path=`admissions/${folder}/${crypto.randomUUID()}.${ext}`
 const {error}=await supabase.storage.from('school-images').upload(path,file,{contentType:file.type,cacheControl:'3600',upsert:false})
 if(error) throw error
 return supabase.storage.from('school-images').getPublicUrl(path).data.publicUrl
}

function makeIds(name:string,dob:string){
 const clean=name.replace(/[^a-zA-Z]/g,'').toUpperCase()
 const first3=(clean+'XXX').slice(0,3)
 const d=new Date(dob+'T00:00:00')
 const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0'), yy=String(d.getFullYear()).slice(-2)
 return {student_unique_id:`NSPS${first3}${dd}${mm}${yy}`}
}

export default function Admission(){
 const [f,setF]=useState<any>({}),[done,setDone]=useState<any>(null),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
 const set=(k:string,v:string)=>setF((x:any)=>({...x,[k]:v}))
 async function submit(e:any){
  e.preventDefault();setBusy(true);setErr('')
  try{
   if(!f.dob) throw new Error('Date of birth is required.')
   if(!f.student_photo||!f.identity_proof) throw new Error('Student photo and identity proof are required.')
   const photo=await upload(f.student_photo,'student-photos'), proof=await upload(f.identity_proof,'identity-proofs')
   const {student_unique_id}=makeIds(f.student_name,f.dob)
   const application_number=`NSPS-APP-${Date.now().toString().slice(-8)}`
   const {data,error}=await supabase.from('admissions').insert({application_number,student_unique_id,student_name:f.student_name,dob:f.dob,class_applied:f.class_applied,father_name:f.father_name,mother_name:f.mother_name,phone:f.phone,email:f.email,address:f.address,message:f.message,student_photo_url:photo,identity_proof_url:proof,status:'pending'}).select('application_number,student_unique_id').single()
   if(error) throw error
   setDone(data)
  }catch(e:any){setErr(e?.message||'Unable to submit application. Please try again.')}finally{setBusy(false)}
 }
 return <div className="formPage"><div className="formHeader"><Link href="/">← New Sunrise Public School</Link><div><span>ADMISSIONS 2026–27</span><h1>Online Admission Application</h1><p>Nursery to Class 8 · Kallyangaon, Bihar</p></div></div>
 {done?<div className="success"><div className="successIcon">✓</div><span className="successKicker">APPLICATION RECEIVED</span><h2>Admission application submitted successfully!</h2><p>Your application has been received by the school office. It will be reviewed by the office team and you will be informed whether your application is <b>verified or rejected</b>.</p><div className="idCards"><div><small>APPLICATION NUMBER</small><strong>{done.application_number}</strong></div><div><small>STUDENT ID</small><strong>{done.student_unique_id}</strong></div></div><p className="saveNote">Please keep these numbers safely for future communication with the school.</p><Link href="/" className="primary">Back to School Website</Link></div>
 :<form className="application" onSubmit={submit}><div className="formIntro"><span>OFFICIAL ADMISSION FORM</span><h2>Student & Parent Information</h2><p>Please enter accurate information. Required documents are uploaded securely with your application.</p></div><section><h3>1. Student Details</h3><div className="formGrid"><label>Student full name *<input required placeholder="Enter student's full name" onChange={e=>set('student_name',e.target.value)}/></label><label>Date of birth *<input required type="date" onChange={e=>set('dob',e.target.value)}/></label><label>Class applying for *<select required defaultValue="" onChange={e=>set('class_applied',e.target.value)}><option value="" disabled>Select class</option>{classes.map(x=><option key={x}>{x}</option>)}</select></label></div></section><section><h3>2. Parent / Guardian Details</h3><div className="formGrid"><label>Father's / Guardian's name *<input required placeholder="Full name" onChange={e=>set('father_name',e.target.value)}/></label><label>Mother's name<input placeholder="Full name" onChange={e=>set('mother_name',e.target.value)}/></label><label>Mobile number *<input required type="tel" inputMode="numeric" placeholder="10-digit mobile number" onChange={e=>set('phone',e.target.value)}/></label><label>Email address<input type="email" placeholder="Optional" onChange={e=>set('email',e.target.value)}/></label></div><label>Complete address *<textarea required placeholder="House / Village / Post / District / State / PIN" onChange={e=>set('address',e.target.value)}/></label></section><section><h3>3. Required Documents</h3><div className="uploadGrid"><label className="uploadCard">Student Photograph *<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>set('student_photo',e.target.files?.[0])}/><small>JPG, PNG or WEBP · Max 5 MB</small></label><label className="uploadCard">Identity Proof *<input required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>set('identity_proof',e.target.files?.[0])}/><small>JPG, PNG, WEBP or PDF · Max 5 MB</small></label></div></section><section><h3>4. Additional Information</h3><textarea placeholder="Any information you would like the school office to know (optional)" onChange={e=>set('message',e.target.value)}/></section>{err&&<p className="error">{err}</p>}<div className="submitArea"><p>By submitting, you confirm that the information provided is accurate to the best of your knowledge.</p><button className="primary" disabled={busy}>{busy?'Submitting application…':'Submit Admission Application →'}</button></div></form>}</div>
}
