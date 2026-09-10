'use client'
import {useEffect} from 'react'
import {usePathname,useRouter} from 'next/navigation'
import {supabase} from '../../lib/supabase'

export default function StudentProfileDeleteButton(){
 const pathname=usePathname();const router=useRouter()
 useEffect(()=>{const m=pathname.match(/^\/admin\/students\/([^/]+)$/);if(!m)return;const id=m[1];const btn=document.createElement('button');btn.type='button';btn.textContent='🗑 Delete Student';btn.style.cssText='position:fixed;right:24px;bottom:24px;z-index:9999;border:0;border-radius:10px;padding:12px 18px;background:#b42318;color:#fff;font-weight:800;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.18)';const click=async()=>{if(!confirm('Are you sure you want to remove this student from Approved Students? Fees, results and attendance records will also be deleted.'))return;btn.disabled=true;btn.textContent='Deleting…';const{error}=await supabase.from('student_profiles').delete().eq('id',id);if(error){alert(error.message);btn.disabled=false;btn.textContent='🗑 Delete Student';return}router.replace('/admin/students')};btn.addEventListener('click',click);document.body.appendChild(btn);return()=>{btn.removeEventListener('click',click);btn.remove()}},[pathname,router]);return null
}
