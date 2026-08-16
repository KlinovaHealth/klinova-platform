export const metadata = {
  title: 'Privacy Policy | Klinova',
  description: 'Klinova Health privacy policy',
  alternates: { languages: { 'fr': '/privacy/fr' } },
}

const C = {
  ink: '#15302A', green: '#0E6B4F', deep: '#0A5440',
  soft: '#E3EFE8', ivory: '#F5EFE3', sand: '#EDE4D2',
  line: '#E7DECC', mute: '#6E7F76',
}

function Divider() {
  return null
}

function Section({ number, title, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', minWidth: 20 }}>
          {String(number).padStart(2, '0')}
        </span>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 600, color: C.ink, margin: 0 }}>
          {title}
        </h2>
      </div>
      <div style={{ paddingLeft: 32 }}>
        {children}
      </div>
    </section>
  )
}

function Row({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, marginTop: 8, flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: 15, color: '#374151', lineHeight: 1.65 }}>{children}</p>
    </div>
  )
}

function Badge({ label, note }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, background: C.soft, marginBottom: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.green, background: '#fff', borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap', marginTop: 1, border: `1px solid ${C.line}` }}>
        {label}
      </span>
      <p style={{ margin: 0, fontSize: 14, color: C.ink, lineHeight: 1.6 }}>{note}</p>
    </div>
  )
}

function Callout({ children }) {
  return (
    <div style={{ background: C.soft, border: `1.5px solid ${C.green}`, borderRadius: 12, padding: '18px 20px', marginTop: 20 }}>
      <p style={{ margin: 0, fontSize: 15, color: C.ink, lineHeight: 1.7, fontWeight: 500 }}>{children}</p>
    </div>
  )
}

const body = { fontSize: 15, color: '#374151', lineHeight: 1.7, margin: '0 0 14px' }

export default function PrivacyPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.line}`, padding: '20px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/klinova-logo-full.png" alt="Klinova" style={{ height: 36, width: 'auto' }} />
          </a>
          <span style={{ width: 1, height: 20, background: C.line }} />
          <span style={{ fontSize: 13, color: C.mute }}>Privacy Policy</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.ink, padding: '4px 10px', borderRadius: 6, background: C.soft }}>EN</span>
            <a href="/privacy/fr" style={{ fontSize: 12, fontWeight: 700, color: C.mute, padding: '4px 10px', borderRadius: 6, textDecoration: 'none' }}>FR</a>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '64px 32px 96px' }}>
        {/* Title block */}
        <div style={{ marginBottom: 56 }}>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 38, fontWeight: 700, color: C.ink, margin: '0 0 10px', lineHeight: 1.2 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: C.mute, margin: 0 }}>Last updated June 2026</p>
        </div>

        {/* Intro */}
        <p style={{ ...body, fontSize: 16, marginBottom: 48 }}>
          This policy explains what information Klinova Health collects, why we collect it, and how we protect it. We aim to be straightforward, no legal walls of text, no surprises.
        </p>

        <Divider />

        {/* 01 */}
        <Section number={1} title="Who we are">
          <p style={body}>
            Klinova Health operates the Klinova telemedicine platform at klinova.co and the Klinova mobile application on iOS and Android. We are based in Lomé, Togo.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            Questions about this policy? Reach us at{' '}
            <a href="mailto:contact@klinova.co" style={{ color: C.green, textDecoration: 'none', fontWeight: 500 }}>contact@klinova.co</a>.
          </p>
        </Section>

        {/* 02 */}
        <Section number={2} title="Information we collect">
          <p style={body}>We only collect what we actually need to provide care.</p>
          <Row>Account details: your name, email address, phone number, and account role (patient, doctor, or clinic).</Row>
          <Row>Health information from your consultations: symptoms, urgency level, and any notes you add voluntarily.</Row>
          <Row>Location at the district or region level, used to suggest nearby clinics or emergency services.</Row>
          <Row>Basic usage data: pages visited, features used, and language preference.</Row>
        </Section>

        {/* 03 */}
        <Section number={3} title="How we use your information">
          <Row>To connect you with doctors and deliver telemedicine consultations.</Row>
          <Row>To route you to nearby clinics or emergency services when urgency requires it.</Row>
          <Row>To generate anonymized, aggregate health statistics for public health authorities. No individual data is ever shared in these reports.</Row>
          <Row>To keep your account running and communicate with you about it.</Row>
        </Section>

        {/* 04 */}
        <Section number={4} title="Data sharing">
          <p style={body}>
            We do not sell your personal data. Full stop. The only situations where we share information are:
          </p>
          <Row>With the doctor you book a consultation with, so they can provide care.</Row>
          <Row>With government health authorities, shared only as anonymized aggregate statistics, never as individual records.</Row>
        </Section>

        {/* 05 */}
        <Section number={5} title="Data retention">
          <p style={{ ...body, marginBottom: 0 }}>
            We keep your account data for as long as your account is active. You can request full deletion at any time by emailing{' '}
            <a href="mailto:contact@klinova.co" style={{ color: C.green, textDecoration: 'none', fontWeight: 500 }}>contact@klinova.co</a>.
            Anonymized, aggregate health data may be retained for public health research, but it cannot be traced back to you.
          </p>
        </Section>

        {/* 06 */}
        <Section number={6} title="Your rights">
          <p style={{ ...body, marginBottom: 0 }}>
            You have the right to access, correct, or delete your personal data at any time. To exercise any of these rights, contact us at{' '}
            <a href="mailto:contact@klinova.co" style={{ color: C.green, textDecoration: 'none', fontWeight: 500 }}>contact@klinova.co</a>{' '}
            and we will respond within 30 days.
          </p>
        </Section>

        {/* 07 */}
        <Section number={7} title="Compliance">
          <p style={body}>
            Klinova is built to meet the most rigorous standards in health data protection across every country we operate in.
          </p>
          <Badge
            label="GDPR"
            note="EU Regulation 2016/679, which governs how we collect, process, and store personal data for users in the EU and globally."
          />
          <Badge
            label="HIPAA"
            note="45 CFR Parts 160 and 164, governing the handling and safeguarding of protected health information."
          />
          <Badge
            label="National laws"
            note="We adhere to the health data protection regulations of Togo, Ghana, Benin, and Côte d'Ivoire as applicable to services in each country."
          />
          <Callout>
            All health records are end-to-end encrypted. You own your data. We act as a data processor, meaning we handle your information solely to deliver care. We are never a data broker.
          </Callout>
        </Section>

        {/* 08 */}
        <Section number={8} title="Security">
          <p style={body}>
            We operate under a zero-trust security model: no user, system, or service is trusted by default, regardless of where the request originates. In practice, this means:
          </p>
          <Row>All connections use HTTPS/TLS. Your data is encrypted in transit, always.</Row>
          <Row>Every database table enforces row-level security. You can only ever access your own records.</Row>
          <Row>API credentials and service keys are managed server-side only and are never exposed to the browser.</Row>
          <Row>Patient data is pseudonymized at the point of collection.</Row>
          <Row>We review access permissions continuously and apply least-privilege principles to every internal role.</Row>
        </Section>

        {/* 09 */}
        <Section number={9} title="Children">
          <p style={{ ...body, marginBottom: 0 }}>
            Klinova is not directed at children under 13. We do not knowingly collect data from anyone under 13. If you believe a child has provided us with their information, contact us and we will delete it promptly.
          </p>
        </Section>

        {/* 10 */}
        <Section number={10} title="Changes to this policy">
          <p style={{ ...body, marginBottom: 0 }}>
            We may update this policy as the platform evolves. For significant changes, we will notify you by email or through an in-app notice before the change takes effect.
          </p>
        </Section>

        {/* Contact footer */}
        <div style={{ marginTop: 8, padding: '32px', background: C.ivory, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: C.ink }}>Klinova Health</p>
            <p style={{ margin: 0, fontSize: 13, color: C.mute }}>Lomé, Togo</p>
          </div>
          <a href="mailto:contact@klinova.co" style={{ fontSize: 14, color: C.green, fontWeight: 600, textDecoration: 'none', padding: '10px 18px', border: `1.5px solid ${C.green}`, borderRadius: 8 }}>
            contact@klinova.co
          </a>
        </div>
      </main>
    </div>
  )
}
