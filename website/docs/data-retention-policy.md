# Klinova — Data Retention & Deletion Policy

**Version:** 1.0  
**Owner:** Klinova Platform Operations  
**Review cycle:** Annually or when entering a new country

---

## 1. Retention periods by data class

| Data class | Examples | Retention | Basis | Action at end |
|---|---|---|---|---|
| Clinical records — identifiable | Name, phone, symptoms, consultation notes, diagnoses | 10 years from last clinical contact | Medical record law (West Africa standard) | Anonymise (cannot delete — clinician has rights to records) |
| Prescriptions | Medications, dosage, prescribing doctor | 10 years | Pharmacy/medical law | Anonymise patient fields |
| WhatsApp triage — PHI | wa_phone, patient_name, transcription, location | 7 years | Clinical record | Run `anonymise_aged_triage()` — keep urgency/language/country |
| Consent records — active | Given consent with version + timestamp | Indefinitely | Proof of lawful basis | Never delete while active |
| Consent records — withdrawn | Withdrawn consent | 7 years after withdrawal | Legal/regulatory | `purge_aged_consent()` |
| Audit logs | All access and change events | 5 years | Regulatory compliance | `purge_aged_audit_logs()` |
| Authentication logs | Login events, MFA events | 1 year | Security monitoring | Auto-purge via Supabase |
| Analytics data — aggregated | District-level counts, urgency breakdowns | 2 years | Business intelligence | Purge |
| Breach/incident records | Incident log, post-incident reports | 5 years | Legal + regulatory | Archive, do not delete |

---

## 2. Anonymisation vs deletion

We **anonymise** rather than delete clinical records because:
- Prescribing doctors retain a legal interest in their prescribing history
- Regulatory bodies may audit historical records
- Epidemiological value is preserved without PHI

Anonymisation = null out all direct identifiers (name, phone, transcription, notes, GPS)  
while retaining: urgency, language, country, date bucket, intent category.

**Patient right to erasure:** A patient may request deletion of their personal data. We execute `delete_patient_data(patient_id)` which anonymises their records and disables their account. We cannot erase records where a third party (doctor, pharmacy) has a legal interest.

---

## 3. Country-specific notes

| Country | Notes |
|---|---|
| **Togo** | No comprehensive health-data law yet. Apply WHO guidelines + French RGPD standards (Togo aligned with ECOWAS framework) |
| **Ghana** | Data Protection Act 2012. Health records: 10-year minimum. Right to access and correction |
| **Nigeria** | NDPR 2019 + NDPR Implementation Framework 2020. Health data = sensitive, requires explicit consent. 72-hour breach notification |
| **Senegal** | Loi n°2008-12 sur la protection des données. CDP oversight |
| **Côte d'Ivoire** | Loi n°2013-450. ARTCI oversight |
| **Burkina Faso** | No dedicated DPA. Apply regional ECOWAS standards |
| **Benin** | Loi n°2017-20 |

*Legal review required before operations in each country.*

---

## 4. Scheduled jobs

Run these monthly via pg_cron or a Vercel cron job:

```sql
-- Enable pg_cron in Supabase (Extensions tab)

SELECT cron.schedule(
  'klinova-monthly-retention',
  '0 2 1 * *',  -- 2am UTC on the 1st of every month
  $$
    SELECT anonymise_aged_triage();
    SELECT purge_aged_audit_logs();
    SELECT purge_aged_consent();
  $$
);
```

Vercel cron alternative (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/data-retention",
    "schedule": "0 2 1 * *"
  }]
}
```

---

## 5. Backup policy

| Item | Requirement | Supabase default |
|---|---|---|
| Database backups | Daily encrypted backups | ✅ Included on Pro/Team plans |
| Backup retention | 30 days (7 days on Free plan) | Upgrade to Pro for 30 days |
| Point-in-time recovery | Available on Pro+ | Enable on Pro plan |
| Restore testing | Monthly test restore to staging | Manual — schedule this |
| Backup encryption | AES-256 at rest | ✅ Supabase default |
| Off-site copy | Supabase manages multi-region | ✅ |

**Recovery objectives:**
- RTO (Recovery Time Objective): < 4 hours for critical data loss
- RPO (Recovery Point Objective): < 24 hours (daily backup cadence)

**Monthly restore test procedure:**
1. Supabase dashboard → Database → Backups
2. Select most recent backup → Restore to staging project
3. Verify `whatsapp_triage`, `consultations`, `prescriptions` row counts match production approximation
4. Run `SELECT count(*) FROM users` to verify user records intact
5. Log the test result in `/docs/incident-log/backup-test-YYYY-MM.md`

---

## 6. Secrets management checklist

These keys must NEVER appear in:
- Source code or git history
- Browser bundles (`NEXT_PUBLIC_` prefix is public — only put non-sensitive values there)
- Vercel function logs
- Error messages returned to clients
- Analytics tools (Vercel Analytics, Sentry, etc.)
- Screenshots or documentation

| Secret | Where it lives | Rotation |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env var (server-side only) | On any suspected exposure |
| `WHATSAPP_ACCESS_TOKEN` | Vercel env var | Every 90 days + on exposure |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Vercel env var (public — scope it to your domain in Mapbox dashboard) | Every 6 months |
| `app.encryption_key` (pgcrypto) | Supabase DB config → not in code | On any suspected exposure; requires re-encryption |
| `OPENAI_API_KEY` | Vercel env var (server-side only) | Every 90 days |
| `PAYPAL_*` keys | Vercel env var (server-side only) | Per PayPal schedule |

**Key rotation procedure:**
1. Generate new key in the relevant provider console
2. Add new key to Vercel as a new env var
3. Deploy and verify functionality
4. Remove old key from Vercel
5. Revoke old key in provider console
6. Log rotation in `/docs/incident-log/key-rotation-YYYY-MM.md`
