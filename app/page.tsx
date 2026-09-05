'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const fallback = {
  school_name: 'New Sunrise Public School',
  tagline: 'Learn • Lead • Shine',
  hero_title: 'Where curiosity becomes confidence.',
  hero_subtitle: 'A joyful, disciplined and future-ready learning environment for Nursery to Class 8 in Kallyangaon.',
  hero_image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2200&q=88',
  logo_url: '',
  about_image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1400&q=88',
  principal_image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=88'
}

const Arrow = () => <span aria-hidden="true">↗</span>

export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>(fallback)
  const [notices, setNotices] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [s, n, t, g] = await Promise.all([
        supabase.from('site_settings').select('key,value'),
        supabase.from('notices').select('*').order('published_on', { ascending: false }).limit(4),
        supabase.from('teachers').select('*').order('id').limit(6),
        supabase.from('gallery').select('*').order('id', { ascending: false }).limit(8)
      ])
      const mapped = { ...fallback } as Record<string, string>
      ;(s.data || []).forEach((x: any) => { mapped[x.key] = x.value })
      setSettings(mapped)
      setNotices(n.data || [])
      setTeachers(t.data || [])
      setGallery(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('.premiumSection, .metricStrip, .campusBand, .galleryPremium, .admissionPremium')
    items.forEach(item => item.classList.add('motionReady'))
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motionVisible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    items.forEach(item => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="site-premium">
      <div className="announcement"><div><span className="liveDot" /> Admissions open for 2026–27 · Nursery to Class 8</div><div className="announcementRight"><span>📍 Kallyangaon, Bihar</span><span>☎ {settings.phone || '+91 XXXXX XXXXX'}</span></div></div>

      <header className="premiumNav">
        <a href="#home" className="premiumBrand"><div className="premiumLogo">{settings.logo_url ? <img src={settings.logo_url} alt="School logo" /> : 'NS'}</div><div><strong>{settings.school_name}</strong><small>{settings.tagline}</small></div></a>
        <nav className="premiumLinks" aria-label="Main navigation"><a href="#home">Home</a><a href="#about">About</a><a href="#academics">Academics</a><a href="#faculty">Faculty</a><a href="#campus">Campus</a><a href="#notices">Updates</a></nav>
        <div className="premiumActions"><Link href="/student" className="studentButton">Student Login</Link><Link href="/admission" className="admissionButton">Admissions <Arrow /></Link></div>
      </header>

      <section id="home" className="premiumHero" style={{ backgroundImage: `linear-gradient(100deg,rgba(5,28,48,.94) 0%,rgba(5,28,48,.72) 43%,rgba(5,28,48,.18) 100%),url(${settings.hero_image})` }}>
        <div className="heroGlow heroGlowOne" /><div className="heroGlow heroGlowTwo" />
        <div className="heroInner">
          <div className="heroCopy"><div className="heroKicker"><span>NEW SUNRISE</span> · ESTABLISHING A BRIGHTER TOMORROW</div><h1>{settings.hero_title}</h1><p>{settings.hero_subtitle}</p><div className="heroButtons"><Link href="/admission" className="heroPrimary">Begin Admission <Arrow /></Link><a href="#about" className="heroGhost">Discover our school <Arrow /></a></div><div className="heroTrust"><span>✓ Nursery–Class 8</span><span>✓ Child-centred learning</span><span>✓ Safe & caring environment</span></div></div>
          <div className="heroSideCard"><span className="sideLabel">A PLACE TO</span><strong>Learn.<br />Lead.<br /><em>Shine.</em></strong><div className="sideLine" /><p>Building strong foundations, confident minds and good character.</p></div>
        </div><a className="scrollCue" href="#about">Scroll to explore <span>↓</span></a>
      </section>

      <section className="metricStrip"><div><strong>Nursery–8</strong><span>Classes offered</span></div><div><strong>2026–27</strong><span>Admissions open</span></div><div><strong>01 Sep</strong><span>School opening</span></div><div><strong>Kallyangaon</strong><span>Bihar · 854317</span></div></section>

      <section id="about" className="premiumSection aboutPremium"><div className="sectionVisual"><div className="visualAccent" /><img src={settings.about_image} alt="Students learning at school" /><div className="visualBadge"><strong>01</strong><span>Our<br />approach</span></div></div><div className="sectionCopy"><div className="sectionEyebrow">ABOUT NEW SUNRISE</div><h2>Education with purpose, warmth and ambition.</h2><p className="lead">We believe a great school does more than teach lessons. It helps children ask better questions, discover their strengths and grow into responsible, confident people.</p><p>New Sunrise Public School brings together a strong academic foundation, values, creativity and practical learning in a caring environment designed for every stage from Nursery to Class 8.</p><div className="valueRows"><div><b>01</b><span>Strong foundations</span><small>Concept-first learning that lasts.</small></div><div><b>02</b><span>Whole-child growth</span><small>Academics, arts, sports and character.</small></div><div><b>03</b><span>Personal attention</span><small>Every child seen, supported and encouraged.</small></div></div><a href="#academics" className="underLink">Explore our learning approach <Arrow /></a></div></section>

      <section id="academics" className="premiumSection academicsPremium"><div className="sectionHeading"><div><div className="sectionEyebrow">ACADEMICS</div><h2>A thoughtful journey through every stage.</h2></div><p>Age-appropriate teaching, active learning and regular assessment help children build knowledge with confidence.</p></div><div className="academicGrid"><article><span className="cardNumber">01</span><div className="cardRule" /><h3>Early Years</h3><p>Nursery · LKG · UKG</p><span>Play, language, numbers, movement and discovery.</span><a href="#admissions">Learn more <Arrow /></a></article><article><span className="cardNumber">02</span><div className="cardRule" /><h3>Primary</h3><p>Classes I–V</p><span>Strong literacy, numeracy, science and social understanding.</span><a href="#admissions">Learn more <Arrow /></a></article><article><span className="cardNumber">03</span><div className="cardRule" /><h3>Middle School</h3><p>Classes VI–VIII</p><span>Concepts, problem-solving, communication and independent thinking.</span><a href="#admissions">Learn more <Arrow /></a></article></div></section>

      <section id="campus" className="campusBand"><div className="campusIntro"><div className="sectionEyebrow lightEyebrow">THE NEW SUNRISE EXPERIENCE</div><h2>More than a classroom.</h2><p>A school day shaped by curiosity, creativity, movement, friendship and responsibility.</p></div><div className="campusFeatures"><div><b>01</b><strong>Focused academics</strong><span>Clear concepts and confident learning.</span></div><div><b>02</b><strong>Creative expression</strong><span>Arts, activities and imagination.</span></div><div><b>03</b><strong>Sports & wellness</strong><span>Healthy habits and team spirit.</span></div><div><b>04</b><strong>Values & leadership</strong><span>Respect, discipline and responsibility.</span></div></div></section>

      <section id="faculty" className="premiumSection facultyPremium"><div className="sectionHeading"><div><div className="sectionEyebrow">OUR FACULTY</div><h2>People who make learning matter.</h2></div><p>Dedicated educators who guide students with care, consistency and high expectations.</p></div><div className="facultyGrid">{teachers.map((t, i) => <article className="facultyCard" key={t.id}><div className="facultyPhoto"><img src={t.image_url || 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=700&q=85'} alt={t.name} /><span>0{i + 1}</span></div><div><h3>{t.name}</h3><p>{t.subject}</p><small>{t.qualification}</small></div></article>)}{!teachers.length && !loading && <div className="emptyPremium">Faculty profiles will appear here.</div>}</div></section>

      <section id="notices" className="premiumSection updatesPremium"><div className="sectionHeading"><div><div className="sectionEyebrow">FROM THE SCHOOL</div><h2>Latest updates.</h2></div><Link href="/notices" className="underLink">View all updates <Arrow /></Link></div><div className="updatesGrid">{notices.map(n => <article className="updateCard" key={n.id}>{n.image_url && <img src={n.image_url} alt="" />}<div className="updateMeta"><span>{new Date(n.published_on).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>{n.important && <b>IMPORTANT</b>}</div><h3>{n.title}</h3><p>{n.body}</p><a href="/notices">Read update <Arrow /></a></article>)}{!notices.length && !loading && <div className="emptyPremium">New school updates will appear here.</div>}</div></section>

      <section className="galleryPremium"><div className="galleryHeading"><div><div className="sectionEyebrow lightEyebrow">SCHOOL LIFE</div><h2>Moments that stay with us.</h2></div><Link href="/gallery" className="lightLink">View gallery <Arrow /></Link></div><div className="premiumGalleryGrid">{gallery.length ? gallery.map(g => <img key={g.id} src={g.image_url} alt={g.title} />) : <><img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=88" alt="School life" /><img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=88" alt="Students learning" /><img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=88" alt="School campus" /></>}</div></section>

      <section id="admissions" className="admissionPremium"><div><div className="sectionEyebrow">ADMISSIONS 2026–27</div><h2>A bright beginning starts here.</h2><p>Applications are open for Nursery to Class 8. Take the first step towards a joyful, purposeful education.</p></div><Link href="/admission" className="heroPrimary">Start Application <Arrow /></Link></section>

      <footer className="premiumFooter"><div className="footerTop"><div className="footerIdentity"><div className="premiumLogo">{settings.logo_url ? <img src={settings.logo_url} alt="School logo" /> : 'NS'}</div><div><strong>{settings.school_name}</strong><small>{settings.tagline}</small></div><p>Quality education, strong values and a brighter future for every child.</p></div><div><h4>Explore</h4><a href="#about">About</a><a href="#academics">Academics</a><a href="#faculty">Faculty</a><Link href="/gallery">Gallery</Link><Link href="/notices">Updates</Link></div><div><h4>Admissions</h4><Link href="/admission">Apply for 2026–27</Link><Link href="/student">Student Login</Link><a href="#notices">School Updates</a></div><div><h4>Visit us</h4><p>{settings.address || 'Kallyangaon, Bihar – 854317'}</p><p>{settings.phone || '+91 XXXXX XXXXX'}</p><p>{settings.email || 'info@newsunrisepublicschool.in'}</p></div></div><div className="footerBottom"><span>© {new Date().getFullYear()} {settings.school_name}. All rights reserved.</span><span>Learn · Lead · Shine</span></div></footer>

      <style dangerouslySetInnerHTML={{__html: `
        .site-premium{--ease:cubic-bezier(.2,.75,.25,1);font-size:16px}
        .premiumHero{overflow:hidden}
        .heroGlow{position:absolute;border-radius:50%;pointer-events:none;filter:blur(2px);opacity:.22;mix-blend-mode:screen}
        .heroGlowOne{width:360px;height:360px;right:12%;top:10%;background:radial-gradient(circle,rgba(226,191,101,.42),transparent 68%);animation:orbFloat 9s ease-in-out infinite}
        .heroGlowTwo{width:260px;height:260px;left:48%;bottom:-90px;background:radial-gradient(circle,rgba(60,180,170,.25),transparent 68%);animation:orbFloat 12s ease-in-out infinite reverse}
        .premiumHero .heroInner{position:relative;z-index:2}
        .heroCopy,.heroSideCard{animation:heroRise .9s var(--ease) both}
        .heroSideCard{animation-delay:.18s;transform-style:preserve-3d}
        .heroCopy h1{text-shadow:0 10px 35px rgba(0,0,0,.2)}
        .heroPrimary,.admissionButton,.studentButton,.heroGhost{transition:transform .28s var(--ease),box-shadow .28s var(--ease),background .28s ease}
        .heroPrimary:hover,.admissionButton:hover,.studentButton:hover,.heroGhost:hover{transform:translateY(-4px);box-shadow:0 18px 35px rgba(0,0,0,.18)}
        .heroPrimary:active,.admissionButton:active,.studentButton:active,.heroGhost:active{transform:translateY(-1px) scale(.98)}
        .metricStrip div{transition:transform .3s var(--ease),background .3s ease}
        .metricStrip div:hover{transform:translateY(-5px);background:#fbfcfa}
        .sectionVisual{transform-style:preserve-3d;perspective:1000px}
        .sectionVisual img{transition:transform .7s var(--ease),filter .7s ease;box-shadow:0 25px 55px rgba(7,37,55,.13)}
        .sectionVisual:hover img{transform:rotateY(-3deg) rotateX(2deg) translateZ(10px) scale(1.015);filter:saturate(1.04)}
        .visualBadge{box-shadow:0 18px 35px rgba(7,37,55,.22);transition:transform .45s var(--ease)}
        .sectionVisual:hover .visualBadge{transform:translateZ(24px) rotate(-2deg)}
        .academicGrid,.facultyGrid,.updatesGrid,.campusFeatures{perspective:1100px}
        .academicGrid article,.facultyCard,.updateCard,.campusFeatures div{transform-style:preserve-3d;transition:transform .4s var(--ease),box-shadow .4s var(--ease),border-color .4s ease}
        .academicGrid article:hover{transform:translateY(-10px) rotateX(2deg) rotateY(-1deg);box-shadow:0 25px 55px rgba(12,49,69,.15);border-color:#c9ad68}
        .facultyCard{overflow:hidden;box-shadow:0 12px 30px rgba(12,49,69,.04)}
        .facultyCard:hover{transform:translateY(-9px) rotateX(1deg);box-shadow:0 25px 55px rgba(12,49,69,.15);border-color:#c9ad68}
        .facultyCard:hover .facultyPhoto img{transform:scale(1.08) rotate(.4deg)}
        .updateCard:hover{transform:translateY(-8px);box-shadow:0 24px 48px rgba(12,49,69,.12);border-color:#c9ad68}
        .premiumGalleryGrid{perspective:1000px}
        .premiumGalleryGrid img{transition:transform .55s var(--ease),filter .55s ease,box-shadow .55s ease}
        .premiumGalleryGrid img:hover{transform:scale(1.035) translateZ(12px);filter:saturate(1.06);box-shadow:0 20px 45px rgba(0,0,0,.25);position:relative;z-index:2}
        .campusFeatures div:hover{transform:translateX(7px);background:rgba(255,255,255,.035)}
        .admissionPremium{position:relative;overflow:hidden}
        .admissionPremium:before{content:'';position:absolute;width:340px;height:340px;border:1px solid rgba(255,255,255,.2);border-radius:50%;right:8%;top:50%;transform:translateY(-50%);animation:ringPulse 5s ease-in-out infinite}
        .admissionPremium>*{position:relative;z-index:1}
        .motionReady{opacity:0;transform:translateY(34px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
        .motionReady.motionVisible{opacity:1;transform:none}
        .motionVisible .sectionEyebrow{animation:fadeSlide .65s .05s both}
        .motionVisible .sectionHeading h2,.motionVisible .sectionCopy h2{animation:fadeSlide .75s .1s both}
        .motionVisible .sectionHeading>p,.motionVisible .sectionCopy>p{animation:fadeSlide .75s .18s both}
        .motionVisible .academicGrid article:nth-child(1),.motionVisible .facultyCard:nth-child(1),.motionVisible .updateCard:nth-child(1),.motionVisible .campusFeatures div:nth-child(1){animation:cardIn .65s .08s both}
        .motionVisible .academicGrid article:nth-child(2),.motionVisible .facultyCard:nth-child(2),.motionVisible .updateCard:nth-child(2),.motionVisible .campusFeatures div:nth-child(2){animation:cardIn .65s .16s both}
        .motionVisible .academicGrid article:nth-child(3),.motionVisible .facultyCard:nth-child(3),.motionVisible .updateCard:nth-child(3),.motionVisible .campusFeatures div:nth-child(3){animation:cardIn .65s .24s both}
        .motionVisible .facultyCard:nth-child(4),.motionVisible .campusFeatures div:nth-child(4){animation:cardIn .65s .32s both}
        @keyframes heroRise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes cardIn{from{opacity:0;transform:translateY(25px) scale(.97)}to{opacity:1;transform:none}}
        @keyframes orbFloat{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-18px,20px,0) scale(1.08)}}
        @keyframes ringPulse{0%,100%{transform:translateY(-50%) scale(.92);opacity:.45}50%{transform:translateY(-50%) scale(1.08);opacity:.9}}
        @media(max-width:850px){.site-premium{font-size:15px}.heroGlow{display:none}.admissionPremium:before{right:-130px}.motionReady{transform:translateY(22px)}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}.motionReady{opacity:1;transform:none}}
      `}} />
    </main>
  )
}
