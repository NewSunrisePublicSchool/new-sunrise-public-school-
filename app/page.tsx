'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const fallback = {
  school_name: 'New Sunrise Public School',
  tagline: 'Learn • Lead • Shine',
  hero_title: 'Building Bright Futures Through Quality Education',
  hero_subtitle: 'A caring, modern school community for Nursery to Class 8 in Kallyangaon.',
  hero_image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=85',
  logo_url: '',
  about_image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=85',
  principal_image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=85',
}

export default function Home() {
  const [settings, setSettings] = useState<Record<string,string>>(fallback)
  const [notices, setNotices] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [s,n,t,g] = await Promise.all([
        supabase.from('site_settings').select('key,value'),
        supabase.from('notices').select('*').order('published_on',{ascending:false}).limit(4),
        supabase.from('teachers').select('*').order('id').limit(6),
        supabase.from('gallery').select('*').order('id',{ascending:false}).limit(8),
      ])
      const mapped = {...fallback} as Record<string,string>
      ;(s.data||[]).forEach((x:any)=> mapped[x.key]=x.value)
      setSettings(mapped); setNotices(n.data||[]); setTeachers(t.data||[]); setGallery(g.data||[]); setLoading(false)
    }
    load()
  }, [])

  return <main>
    <div className="topbar"><div>📍 Kallyangaon, Bihar</div><div>📞 {settings.phone || '+91 XXXXX XXXXX'}</div></div>
    <header className="nav"><div className="brand"><div className="brandmark">{settings.logo_url ? <img src={settings.logo_url} alt="School logo"/> : 'NS'}</div><div><b>{settings.school_name}</b><span>{settings.tagline}</span></div></div><nav><a href="#home">Home</a><a href="#about">About</a><a href="#academics">Academics</a><a href="#faculty">Faculty</a><a href="#gallery">Gallery</a><a href="#notices">Notices</a><Link className="navbtn" href="/admission">Admission</Link><Link href="/admin" className="adminlink">Admin</Link></nav></header>

    <section id="home" className="hero" style={{backgroundImage:`linear-gradient(90deg,rgba(7,36,63,.93),rgba(7,36,63,.56),rgba(7,36,63,.16)),url(${settings.hero_image})`}}>
      <div className="heroContent"><div className="eyebrow">WELCOME TO NEW SUNRISE</div><h1>{settings.hero_title}</h1><p>{settings.hero_subtitle}</p><div className="actions"><Link href="/admission" className="primary">Apply for Admission →</Link><a href="#about" className="secondary">Explore Our School</a></div></div>
    </section>

    <section className="stats"><div><strong>Nursery–8</strong><span>Classes Offered</span></div><div><strong>2026–27</strong><span>Admissions Open</span></div><div><strong>Dedicated</strong><span>Faculty & Staff</span></div><div><strong>Safe</strong><span>Learning Environment</span></div></section>

    <section id="about" className="section about"><div className="imageFrame"><img src={settings.about_image} alt="Students learning"/></div><div><div className="eyebrow dark">ABOUT OUR SCHOOL</div><h2>Education that inspires confidence, character and curiosity.</h2><p>New Sunrise Public School is committed to providing a strong academic foundation alongside values, discipline, creativity and practical learning. We believe every child deserves encouragement, individual attention and a joyful place to learn.</p><div className="checks"><span>✓ Child-centred learning</span><span>✓ Strong academic foundation</span><span>✓ Co-curricular development</span><span>✓ Safe and caring campus</span></div><a href="#academics" className="textlink">Discover our approach →</a></div></section>

    <section id="academics" className="section light"><div className="sectionHead"><div><div className="eyebrow dark">ACADEMICS</div><h2>Learning for every stage</h2></div><p>Age-appropriate teaching, activity-based learning and regular assessment from Nursery to Class 8.</p></div><div className="cards"><div className="card"><div className="icon">01</div><h3>Early Years</h3><p>Nursery, LKG & UKG with play-based foundational learning.</p></div><div className="card"><div className="icon">02</div><h3>Primary School</h3><p>Classes I–V with strong literacy, numeracy, science and social learning.</p></div><div className="card"><div className="icon">03</div><h3>Middle School</h3><p>Classes VI–VIII focused on concepts, problem solving and confidence.</p></div></div></section>

    <section className="featureBand"><div><div className="eyebrow">WHY FAMILIES CHOOSE US</div><h2>A school where every child can shine.</h2></div><div className="featureGrid"><span>🎯 Focused academics</span><span>🧠 Activity-based learning</span><span>🎨 Creativity & arts</span><span>⚽ Sports & wellness</span><span>💻 Digital learning</span><span>🤝 Values & leadership</span></div></section>

    <section id="faculty" className="section"><div className="sectionHead"><div><div className="eyebrow dark">OUR FACULTY</div><h2>Meet the people behind learning</h2></div><p>Dedicated educators who guide students with care and consistency.</p></div><div className="teacherGrid">{teachers.map((t)=><article className="teacher" key={t.id}><img src={t.image_url || 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80'} alt={t.name}/><div><h3>{t.name}</h3><p>{t.subject}</p><small>{t.qualification}</small></div></article>)}{!teachers.length && !loading && <div className="empty">Faculty profiles will appear here.</div>}</div></section>

    <section id="notices" className="section light"><div className="sectionHead"><div><div className="eyebrow dark">NOTICE BOARD</div><h2>Latest school updates</h2></div><Link href="/notices" className="textlink">View all notices →</Link></div><div className="noticeGrid">{notices.map(n=><article className="notice" key={n.id}><div className="date">{new Date(n.published_on).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div><div><h3>{n.title}</h3><p>{n.body}</p>{n.important&&<b className="pill">IMPORTANT</b>}</div></article>)}</div></section>

    <section id="gallery" className="section"><div className="sectionHead"><div><div className="eyebrow dark">SCHOOL LIFE</div><h2>Moments from our campus</h2></div><Link href="/gallery" className="textlink">View gallery →</Link></div><div className="galleryGrid">{gallery.map(g=><img key={g.id} src={g.image_url} alt={g.title}/>)}{!gallery.length && <><img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80" alt="School life"/><img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80" alt="Students"/><img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80" alt="Campus"/></>}</div></section>

    <section className="cta"><div><div className="eyebrow">ADMISSIONS 2026–27</div><h2>Give your child a bright beginning.</h2><p>Admissions are open for Nursery to Class 8.</p></div><Link href="/admission" className="primary">Start Application →</Link></section>

    <footer><div className="footerMain"><div><div className="brand footerBrand"><div className="brandmark">NS</div><div><b>{settings.school_name}</b><span>{settings.tagline}</span></div></div><p>Quality education, strong values and a brighter future for every child.</p></div><div><h4>Quick Links</h4><a href="#about">About</a><a href="#academics">Academics</a><a href="#gallery">Gallery</a><Link href="/admission">Admission</Link></div><div><h4>Contact</h4><p>{settings.address || 'Kallyangaon, Bihar, India'}</p><p>{settings.phone || '+91 XXXXX XXXXX'}</p><p>{settings.email || 'info@newsunrisepublicschool.in'}</p></div></div><div className="copyright">© {new Date().getFullYear()} {settings.school_name}. All rights reserved.</div></footer>
  </main>
}
