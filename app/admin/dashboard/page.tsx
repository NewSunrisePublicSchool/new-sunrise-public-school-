'use client'

import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '../../../lib/supabase'
import './dashboard.css'

export default function AdminDashboard(){
  const router=useRouter()
  const [loading,setLoading]=useState(true)
  const [email,setEmail]=useState('')
  const [admissionCount,setAdmissionCount]=useState(0)
  const [historyCount,setHistoryCount]=useState(0)
  const [studentCount,setStudentCount]=useState(0)
  const [teacherCount,setTeacherCount]=useState(0)
  const [noticeCount,setNoticeCount]=useState(0)
  const [galleryCount,setGalleryCount]=useState(0)

  useEffect(()=>{
    let cancelled=false
    async function load(){
      const {data:{user}}=await supabase.auth.getUser()
      if(!user){router.replace('/admin');return}
      const {data:isAdmin,error:adminError}=await supabase.rpc('is_admin')
      if(adminError||isAdmin!==true){await supabase.auth.signOut();router.replace('/admin');return}
      if(cancelled)return
      setEmail(user.email||'')
      const [{data:admissions},{data:students},{data:teachers},{data:notices},{data:gallery}]=await Promise.all([
        supabase.from('admissions').select('id,status'),
        supabase.from('student_profiles').select('id,status'),
        supabase.from('teachers').select('id'),
        supabase.from('notices').select('id'),
        supabase.from('gallery').select('id'),
      ])
      if(cancelled)return
      const a=admissions||[]
      setAdmissionCount(a.filter(x=>(x.status||'pending')==='pending').length)
      setHistoryCount(a.filter(x=>['rejected','reviewed'].includes(x.status||'')).length)
      setStudentCount((students||[]).filter(x=>x.status==='active').length)
      setTeacherCount((teachers||[]).length)
      setNoticeCount((notices||[]).length)
      setGalleryCount((gallery||[]).length)
      setLoading(false)
    }
    load().catch(()=>{if(!cancelled)setLoading(false)})
    return()=>{cancelled=true}
  },[router])

  async function logout(){await supabase.auth.signOut();router.replace('/admin');router.refresh()}
  function open(tab:string){router.push('/admin?tab='+tab)}

  if(loading)return <main className="dashLoading"><div className="spinner"/><p>Loading admin panel...</p></main>

  const cards=[
    {icon:'🎓',title:'Admissions',text:'Review applications, verify documents and take admission decisions.',count:admissionCount,label:'Pending',featured:true,tab:'admissions'},
    {icon:'👨‍🎓',title:'Approved Students',text:'Open active student profiles, IDs, fees, results and attendance.',count:studentCount,label:'Active Students',tab:'admissions'},
    {icon:'🗂️',title:'Application History',text:'Review previously processed, rejected and inactive applications.',count:historyCount,label:'Records',tab:'admissions'},
    {icon:'💰',title:'Fees Management',text:'Manage monthly or term-wise fee records for every student.',count:'Manage',label:'Student Fees',tab:'admissions'},
    {icon:'📊',title:'Results',text:'Add examination marks, grades, remarks and academic records.',count:'Manage',label:'Academic',tab:'admissions'},
    {icon:'📅',title:'Attendance',text:'Record daily present, absent and leave entries for students.',count:'Manage',label:'Daily Records',tab:'admissions'},
    {icon:'👨‍🏫',title:'Faculty',text:'Add, edit and remove teachers with subject and qualification.',count:teacherCount,label:'Teachers',tab:'teachers'},
    {icon:'📢',title:'Notices',text:'Publish announcements and manage notice images.',count:noticeCount,label:'Notices',tab:'notices'},
    {icon:'🖼️',title:'Gallery',text:'Upload and manage school photographs shown on the website.',count:galleryCount,label:'Photos',tab:'gallery'},
    {icon:'⚙️',title:'Site & Images',text:'Manage school information, homepage content and website images.',count:'Manage',label:'Settings',tab:'settings'},
  ]

  return <main className="dashboardPage">
    <header className="dashboardHeader">
      <div className="dashboardHeaderInner">
        <div className="dashBrand">
          <div className="dashLogo">NS</div>
          <div><p>New Sunrise Public School</p><h1>Admin Dashboard</h1></div>
        </div>
        <button className="dashLogout" onClick={logout}>Logout</button>
      </div>
    </header>

    <section className="dashboardContent">
      <div className="dashboardWelcome">
        <div><span>WELCOME BACK</span><h2>New Sunrise Public School — Management Center</h2><p>Everything you need to manage admissions, students, academics, faculty and website content.</p><small>Logged in as: {email}</small></div>
        <button onClick={()=>router.push('/')}>View Website →</button>
      </div>

      <div className="dashStats">
        <div><strong>{admissionCount}</strong><span>Under Review</span></div>
        <div><strong>{studentCount}</strong><span>Approved Students</span></div>
        <div><strong>{teacherCount}</strong><span>Faculty</span></div>
        <div><strong>{noticeCount}</strong><span>Published Notices</span></div>
      </div>

      <div className="actionHeading"><div><span>QUICK MANAGEMENT</span><h3>Everything you can manage</h3><p>Open any section directly from the dashboard.</p></div><b>10 MANAGEMENT AREAS</b></div>
      <div className="dashboardActionGrid">
        {cards.map(card=><button key={card.title} className={'dashboardActionCard'+(card.featured?' featured':'')} onClick={()=>open(card.tab)}>
          <span className="actionIcon">{card.icon}</span>
          <span className="actionText"><b>{card.title}</b><small>{card.text}</small></span>
          <span className="actionCount">{card.count} <em>{card.label}</em></span>
          <span className="actionArrow">→</span>
        </button>)}
      </div>

      <div className="managementRules"><h3>Management Center</h3><div><article><b>Admissions</b><p>Review applications, verify documents and approve or reject admissions.</p></article><article><b>Students</b><p>Manage approved profiles, fees, results and attendance from the student profile.</p></article><article><b>Website</b><p>Keep faculty, notices, gallery and school information updated.</p></article></div></div>
    </section>
  </main>
}
