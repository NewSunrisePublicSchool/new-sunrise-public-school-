import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
function makeStudentId(name: string, dob: string) { const clean = name.replace(/[^a-zA-Z]/g, "").toUpperCase(); const first3 = (clean + "XXX").slice(0, 3); const [year, month, day] = dob.split("-"); return `NSPS${first3}${day}${month}${year.slice(-2)}`; }
function validFile(file: File | null, allowed: string[]) { if (!file) throw new Error("Required document is missing."); if (!allowed.includes(file.type)) throw new Error("Unsupported file type."); if (file.size > 5 * 1024 * 1024) throw new Error("File must be 5 MB or smaller."); }
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const form = await req.formData();
    const studentName = String(form.get("student_name") || "").trim(); const dob = String(form.get("dob") || "").trim(); const classApplied = String(form.get("class_applied") || "").trim(); const fatherName = String(form.get("father_name") || "").trim(); const motherName = String(form.get("mother_name") || "").trim(); const phone = String(form.get("phone") || "").trim(); const email = String(form.get("email") || "").trim(); const address = String(form.get("address") || "").trim(); const message = String(form.get("message") || "").trim();
    const photo = form.get("student_photo"); const proof = form.get("identity_proof");
    if (!studentName || !dob || !classApplied || !fatherName || !phone || !address) return json({ error: "Please complete all required fields." }, 400);
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) return json({ error: "Please enter a valid 10-digit mobile number." }, 400);
    if (!(photo instanceof File) || !(proof instanceof File)) return json({ error: "Student photo and identity proof are required." }, 400);
    validFile(photo, ["image/jpeg", "image/png", "image/webp"]); validFile(proof, ["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"); const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if (!secretKey) throw new Error("Server storage configuration is missing.");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const applicationNumber = `NSPS-APP-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`; const studentUniqueId = makeStudentId(studentName, dob);
    const photoExt = (photo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"; const proofExt = (proof.name.split(".").pop() || "file").toLowerCase().replace(/[^a-z0-9]/g, "") || "file";
    const photoPath = `admissions/student-photos/${crypto.randomUUID()}.${photoExt}`; const proofPath = `admissions/identity-proofs/${crypto.randomUUID()}.${proofExt}`;
    const photoUpload = await supabase.storage.from("school-images").upload(photoPath, photo, { contentType: photo.type, cacheControl: "3600", upsert: false }); if (photoUpload.error) throw photoUpload.error;
    const proofUpload = await supabase.storage.from("admission-documents").upload(proofPath, proof, { contentType: proof.type, cacheControl: "3600", upsert: false }); if (proofUpload.error) { await supabase.storage.from("school-images").remove([photoPath]); throw proofUpload.error; }
    const { data, error } = await supabase.from("admissions").insert({ application_number: applicationNumber, student_unique_id: studentUniqueId, student_name: studentName, dob, class_applied: classApplied, father_name: fatherName, mother_name: motherName || null, phone, email: email || null, address, message: message || null, student_photo_url: supabase.storage.from("school-images").getPublicUrl(photoPath).data.publicUrl, identity_proof_url: proofPath, status: "pending" }).select("application_number,student_unique_id").single();
    if (error) { await supabase.storage.from("school-images").remove([photoPath]); await supabase.storage.from("admission-documents").remove([proofPath]); throw error; }
    return json({ data });
  } catch (error) { console.error("submit-admission error", error); return json({ error: error instanceof Error ? error.message : "Unable to submit application." }, 400); }
});
