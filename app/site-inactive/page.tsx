export default function SiteInactive(){
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'linear-gradient(135deg,#07111f,#102a43)',color:'#fff',fontFamily:'Arial,sans-serif'}}>
    <section style={{width:'min(620px,100%)',textAlign:'center',padding:'48px 32px',borderRadius:24,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',boxShadow:'0 24px 80px rgba(0,0,0,.3)'}}>
      <div style={{fontSize:48,marginBottom:14}}>🔒</div>
      <h1 style={{margin:'0 0 12px',fontSize:'clamp(28px,5vw,42px)'}}>Website Temporarily Unavailable</h1>
      <p style={{margin:0,color:'rgba(255,255,255,.78)',fontSize:17,lineHeight:1.7}}>This website is temporarily unavailable. Please contact the school office for further information.</p>
    </section>
  </main>
}
