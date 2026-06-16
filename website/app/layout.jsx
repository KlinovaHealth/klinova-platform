import './globals.css'

export const metadata = {
  metadataBase: new URL('https://klinova.co'),
  title: 'Klinova — Healthcare that speaks your language',
  description:
    'Telemedicine and digital health for West Africa. See a trusted doctor from your phone, get your prescription, and find medicine nearby — across Togo, Ghana, Benin, and Côte d\'Ivoire.',
  keywords: [
    'telemedicine', 'Togo', 'Ghana', 'Benin', "Côte d'Ivoire",
    'West Africa', 'digital health', 'mobile money', 'e-prescription', 'Klinova',
  ],
  authors: [{ name: 'Klinova' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon-256.png',
  },
  openGraph: {
    title: 'Klinova — Healthcare that speaks your language',
    description:
      'Telemedicine and digital health for West Africa. See a doctor, get your prescription, find medicine nearby — by app, web, or WhatsApp.',
    url: 'https://klinova.co',
    siteName: 'Klinova',
    images: [{ url: '/klinova-logo-full.png', width: 1920, height: 1920, alt: 'Klinova' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Klinova — Healthcare that speaks your language',
    description: 'Telemedicine and digital health for West Africa.',
    images: ['/klinova-logo-full.png'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0E6B4F',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
