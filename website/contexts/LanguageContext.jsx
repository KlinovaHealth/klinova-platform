'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '@/lib/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const stored = localStorage.getItem('klinova-lang')
    if (stored === 'en' || stored === 'fr') setLang(stored)
  }, [])

  function toggleLang() {
    const next = lang === 'en' ? 'fr' : 'en'
    setLang(next)
    localStorage.setItem('klinova-lang', next)
  }

  function t(key, params = {}) {
    const keys = key.split('.')
    let val = translations[lang]
    for (const k of keys) {
      if (val == null) break
      val = val[k]
    }
    if (typeof val !== 'string') return key
    return val.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`)
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
