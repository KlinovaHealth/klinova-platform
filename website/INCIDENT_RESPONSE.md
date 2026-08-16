# Klinova Incident Response Playbook

**Owner:** Donald Daglo (donalddaglo@gmail.com / 813-570-2398)  
**Last updated:** 2026-08-15

---

## Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P1 | Active breach, data exfiltration, system down | Immediate |
| P2 | Suspicious activity, failed breach attempt | Within 1 hour |
| P3 | Policy violation, anomalous behavior | Within 24 hours |

---

## P1 — Active Breach Response

### 1. Contain (first 15 minutes)
```bash
# Activate kill switch — signs out all users + blocks all sessions
curl -X POST https://klinova.co/api/admin/killswitch \
  -H "Authorization: Bearer $KILLSWITCH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"activate": true}'
```
- Rotate `SUPABASE_SERVICE_ROLE_KEY` in Vercel dashboard immediately
- Rotate `KILLSWITCH_SECRET` in Vercel dashboard
- Pause Supabase project if DB is actively being exfiltrated:
  Supabase Dashboard → Settings → General → Pause project

### 2. Assess (15–60 minutes)
- Check audit logs: Supabase → Table Editor → audit_logs → sort by created_at DESC
- Identify: which user_id, what action, what IP address
- Determine: what data was accessed (PHI? PII? payment data?)

### 3. Notify
- **If PHI accessed:** HIPAA requires notification within 60 days
  - Notify affected users by email
  - File breach report with HHS: hhs.gov/hipaa/for-professionals/breach-notification
- **If payment data accessed:** Notify PayPal and affected users immediately

### 4. Remediate
- Patch the vulnerability before reactivating
- Deactivate kill switch once safe:
```bash
curl -X POST https://klinova.co/api/admin/killswitch \
  -H "Authorization: Bearer $KILLSWITCH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"activate": false}'
```
- Force all users to reset passwords via Supabase Auth dashboard

### 5. Post-mortem
- Document: what happened, how long, what was exposed, how fixed
- Update RLS policies and audit logging if gaps found

---

## P2 — Suspicious Activity

Signs: repeated failed logins, bulk data reads, unusual export patterns

- Check Supabase Auth logs: Dashboard → Logs → Auth
- Check audit_logs for bulk_read or data_export actions
- If confirmed malicious: disable the specific user account via Supabase Auth dashboard
- Do NOT activate full kill switch unless breach is confirmed

---

## Key Contacts & Resources

| Resource | Location |
|----------|----------|
| Supabase dashboard | supabase.com/dashboard/project/kcgchwwfqjvbqtzotbiu |
| Vercel dashboard (env vars) | vercel.com/dashboard |
| Kill switch API | POST /api/admin/killswitch |
| Audit logs table | public.audit_logs |
| HIPAA breach portal | hhs.gov/hipaa/for-professionals/breach-notification |
| Apple App Store Connect | appstoreconnect.apple.com |
| Google Play Console | play.google.com/console |
