# Klinova — Breach & Incident Response Plan

**Version:** 1.0  
**Owner:** Klinova Platform Operations  
**Review cycle:** Every 6 months or after any incident

---

## 1. What counts as an incident

| Type | Examples |
|---|---|
| Data breach | Unauthorized access to patient records, PHI export, credential leak |
| Service disruption | Platform downtime affecting patient care, WhatsApp gateway failure |
| Security vulnerability | Discovered RLS misconfiguration, API key exposure, injection flaw |
| Clinical risk | Emergency message not delivered, prescription sent to wrong patient |
| Regulatory breach | Unauthorized government data access, consent not recorded before contact |

---

## 2. Severity levels

| Level | Definition | Response time |
|---|---|---|
| **P0 — Critical** | Active breach with PHI exposed, platform down, patient harmed | Immediate (< 1 hour) |
| **P1 — High** | Suspected breach, clinical data at risk, key exposed in code/logs | Same day (< 4 hours) |
| **P2 — Medium** | Access control misconfiguration, non-PHI data exposed | Next business day |
| **P3 — Low** | Minor config drift, anomaly detected, no data at risk | Within 1 week |

---

## 3. Contacts

| Role | Contact |
|---|---|
| Platform owner | donalddaglo@gmail.com |
| Legal / data protection | [Add DPO contact] |
| Supabase support | support@supabase.io |
| Vercel support | support@vercel.com |
| Meta (WhatsApp Business) | business.facebook.com/support |
| West African data authority contacts | [Add per country — see §9] |

---

## 4. Detection

**Sources that may surface an incident:**
- Supabase audit_logs table (query via admin dashboard)
- Vercel deployment logs and function logs
- Meta Business Manager webhook failure alerts
- User-reported anomaly (doctor, patient, partner)
- RLS test suite failure in CI
- Monitoring alert on unusual query volume or failed auth rate

**Run this query to detect anomalous access (Supabase SQL editor):**

```sql
SELECT user_id, action, resource, count(*), min(created_at), max(created_at)
FROM audit_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY user_id, action, resource
HAVING count(*) > 50
ORDER BY count(*) DESC;
```

---

## 5. Response steps

### P0 / P1 — Active breach

1. **Contain immediately**
   - Activate killswitch: `POST /api/admin/killswitch` with `{ active: true }` (admin token required)
   - Rotate all credentials: Supabase service role key, Vercel env vars, WhatsApp token, Mapbox token
   - Revoke Supabase access tokens for affected users via dashboard → Authentication → Users
   - If source is a leaked key in code: force-push a clean commit, contact Supabase/Vercel immediately

2. **Preserve evidence**
   - Export `audit_logs` for the 72-hour window before detection
   - Capture Vercel function logs for the same window
   - Do NOT modify or delete affected records until legal review

3. **Assess scope**
   ```sql
   -- Which patients were potentially exposed?
   SELECT DISTINCT record_id FROM audit_logs
   WHERE user_id = '<suspected_user_id>'
     AND resource IN ('consultations', 'prescriptions', 'whatsapp_triage', 'users')
     AND created_at BETWEEN '<breach_start>' AND '<breach_end>';
   ```

4. **Notify**
   - If PHI confirmed exposed: notify affected patients within 72 hours
   - Notify relevant data protection authority (see §9) within 72 hours of confirmation
   - If breach involved health data of a minor: notify guardian

5. **Restore and verify**
   - Fix the root cause before re-enabling service
   - Re-run `__tests__/rls.test.js` and confirm all tests pass
   - Re-enable killswitch: `{ active: false }`

### P2 / P3 — Lower severity

1. Document the issue in an incident log (create a dated entry in `/docs/incident-log/`)
2. Fix the misconfiguration
3. Re-run RLS tests
4. No external notification required unless PHI was at risk

---

## 6. After any incident

| Action | Timing |
|---|---|
| Post-incident report written | Within 5 business days |
| RLS test suite reviewed and updated | Within 10 business days |
| Breach log updated | Immediately |
| Vendor risk register reviewed | Within 30 days |
| Next scheduled penetration test brought forward if P0/P1 | Within 90 days |

---

## 7. Communication templates

### Patient notification (EN)
> Subject: Important notice about your Klinova account  
> We are writing to inform you that [describe what happened]. Your [types of data] may have been accessed without authorization. We have taken steps to secure the platform. [Describe actions taken.] If you have questions, contact us at contact@klinova.co or call [number].

### Patient notification (FR)
> Objet : Information importante concernant votre compte Klinova  
> Nous vous écrivons pour vous informer que [décrire l'incident]. Vos [types de données] peuvent avoir été consultés sans autorisation. Nous avons pris des mesures pour sécuriser la plateforme. [Décrire les actions.] Pour toute question : contact@klinova.co ou [numéro].

---

## 8. Penetration test checklist (before public launch)

Run these tests with a qualified security professional or automated tool (OWASP ZAP, Burp Suite):

- [ ] SQL injection on all API endpoints
- [ ] Authentication bypass (forged JWT, missing auth checks)
- [ ] Horizontal privilege escalation (Patient A accessing Patient B data)
- [ ] Vertical privilege escalation (patient becoming admin)
- [ ] RLS bypass via Supabase REST API
- [ ] Service role key exposure in browser/logs
- [ ] WhatsApp webhook replay attack (missing signature verification)
- [ ] IDOR in consultation, prescription, and triage endpoints
- [ ] Insecure direct object references in file/document URLs
- [ ] XSS in dashboard inputs
- [ ] CSRF on state-changing API routes
- [ ] Rate limiting on auth and triage endpoints
- [ ] Sensitive data in Vercel logs or preview URLs
- [ ] Environment variable leakage to client bundle (`NEXT_PUBLIC_` prefix check)

---

## 9. Data authority contacts by country

| Country | Authority | Notification deadline |
|---|---|---|
| Togo | HAAC / [Digital data authority TBD] | Consult legal counsel |
| Ghana | Data Protection Commission (DPC) | 72 hours (recommended) |
| Nigeria | National Information Technology Development Agency (NITDA) | 72 hours |
| Benin | CRIET / DPA TBD | Consult legal counsel |
| Côte d'Ivoire | ARTCI | Consult legal counsel |
| Burkina Faso | [No dedicated DPA yet] | Consult legal counsel |
| Senegal | CDP (Commission des Données Personnelles) | 72 hours |

*Always consult a local data protection lawyer before formal regulatory notification.*
