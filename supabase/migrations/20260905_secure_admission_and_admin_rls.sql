drop policy if exists "public submit admission" on public.admissions;
drop policy if exists "Public can upload admission documents" on storage.objects;

drop policy if exists "admin admissions" on public.admissions;
create policy "admin admissions" on public.admissions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin settings" on public.site_settings;
create policy "admin settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin notices" on public.notices;
create policy "admin notices" on public.notices for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin teachers" on public.teachers;
create policy "admin teachers" on public.teachers for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin gallery" on public.gallery;
create policy "admin gallery" on public.gallery for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can read admission documents" on storage.objects;
create policy "Admins can read admission documents" on storage.objects for select to authenticated using (bucket_id = 'admission-documents' and public.is_admin());

drop policy if exists "Admins can delete admission documents" on storage.objects;
create policy "Admins can delete admission documents" on storage.objects for delete to authenticated using (bucket_id = 'admission-documents' and public.is_admin());
