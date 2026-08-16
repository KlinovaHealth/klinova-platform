-- Step 1: Enable pgcrypto extension
create extension if not exists pgcrypto;

-- Step 2: Encryption helper functions
-- Call pgp_sym_encrypt(value, current_setting('app.encryption_key')) to encrypt
-- Call pgp_sym_decrypt(value::bytea, current_setting('app.encryption_key')) to decrypt

-- Step 3: Add encrypted columns to whatsapp_triage
alter table whatsapp_triage
  add column if not exists wa_phone_enc bytea,
  add column if not exists patient_name_enc bytea,
  add column if not exists transcription_enc bytea,
  add column if not exists translation_enc bytea,
  add column if not exists summary_enc bytea,
  add column if not exists notes_enc bytea;

-- Step 4: Migrate existing plaintext data to encrypted columns
-- Run this AFTER setting app.encryption_key in Supabase dashboard:
--   Dashboard → Settings → Database → Configuration → add parameter:
--   app.encryption_key = 'your-strong-random-key-min-32-chars'
--
-- UPDATE whatsapp_triage SET
--   wa_phone_enc      = pgp_sym_encrypt(wa_phone, current_setting('app.encryption_key')),
--   patient_name_enc  = pgp_sym_encrypt(patient_name, current_setting('app.encryption_key')),
--   transcription_enc = pgp_sym_encrypt(transcription, current_setting('app.encryption_key')),
--   translation_enc   = pgp_sym_encrypt(translation, current_setting('app.encryption_key')),
--   summary_enc       = pgp_sym_encrypt(summary, current_setting('app.encryption_key')),
--   notes_enc         = pgp_sym_encrypt(notes, current_setting('app.encryption_key'))
-- WHERE wa_phone IS NOT NULL;

-- Step 5: After verifying migration, drop plaintext columns
-- alter table whatsapp_triage
--   drop column wa_phone,
--   drop column patient_name,
--   drop column transcription,
--   drop column translation,
--   drop column summary,
--   drop column notes;
