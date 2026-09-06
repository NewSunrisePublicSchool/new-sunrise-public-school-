'use client'

import {FormEvent, useState} from 'react'
import Link from 'next/link'
import {supabase} from '../../lib/supabase'
import './enquiry.css'

export default function EnquiryPage(){
  const [form,setForm]=useState({name:'',phone:'',email:'',subject:'',message:''})
  const [busy,setBusy]=useState(false)
  const [done,setDone]=useState(false)
  const [error,setError]=useState('')
  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setError('')
    const {error}=await supabase.from('enquiries').insert({name:form.name.trim(),phone:form.phone.trim(),email:form.email.trim()||null,subject:form.subject.trim()||null,message:form.message.trim()})
    if(error)setError(error.message)
    else {setDone(true);setForm({name:'',phone:'',email:'',subject:'',message:''})}
    setBusy(false)
  }
  return <main className="enquiryPage">
    <header className="enquiryTop"><Link href="/" className="enquiryBrand"><span>NS</span><div><strong>New Sunrise Public School</strong><small>Learn · Lead · Shine</small></div></Link><Link href="/" className="backLink">← Back to website</Link></header>
    <section className="enquiryHero"><div><span className="eyebrow">CONTACT THE SCHOOL</span><h1>Have a question? We’re here to help.</h1><p>Send your enquiry and the school office can review it and respond by phone, email or WhatsApp.</p></div><div className="contactPromise"><span>✦</span><b>School Enquiry Desk</b><small>Usually reviewed by the administration team</small></div></section>
    <section className="enquiryLayout">
      <div className="enquiryInfo"><span className="eyebrow">WHAT CAN YOU ASK?</span><h2>Admissions, classes, fees, transport or anything about school.</h2><p>Tell us what you need to know. Please avoid sending passwords, identity documents or other sensitive information in this form.</p><div className="infoRows"><div><b>01</b><span>Admissions</span><small>Ask about 2026–27 admission availability.</small></div><div><b>02</b><span>School information</span><small>Classes, academics, activities and facilities.</small></div><div><b>03</b><span>Contact the office</span><small>Leave your preferred contact details for a reply.</small></div></div></div>
      <form className="enquiryCard" onSubmit={submit}><div className="formTitle"><span className="eyebrow">SEND AN ENQUIRY</span><h2>We’ll get back to you.</h2></div><div className="fieldGrid"><label>Name<input required maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"/></label><label>Phone<input required maxLength={20} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Mobile number"/></label><label>Email <span>(optional)</span><input type="email" maxLength={160} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Subject <span>(optional)</span><input maxLength={160} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="What is your enquiry about?"/></label></div><label className="messageField">Message<textarea required minLength={5} maxLength={2000} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Write your question here…"/></label>{error&&<div className="formError">{error}</div>}{done?<div className="successBox"><strong>✓ Enquiry submitted successfully</strong><span>Thank you. The school administration has received your enquiry and can contact you using the details you provided.</span><button type="button" onClick={()=>setDone(false)}>Send another enquiry</button></div>:<button className="submitEnquiry" disabled={busy}>{busy?'Submitting…':'Submit Enquiry →'}</button>}</form>
    </section>
  </main>
}