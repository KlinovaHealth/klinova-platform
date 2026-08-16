export const metadata = {
  title: 'Politique de confidentialité | Klinova',
  description: 'Politique de confidentialité de Klinova Health',
  alternates: { languages: { 'en': '/privacy' } },
}

const C = {
  ink: '#15302A', green: '#0E6B4F', deep: '#0A5440',
  soft: '#E3EFE8', ivory: '#F5EFE3', sand: '#EDE4D2',
  line: '#E7DECC', mute: '#6E7F76',
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

export default function PrivacyFrPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* En-tête */}
      <div style={{ borderBottom: `1px solid ${C.line}`, padding: '20px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/klinova-logo-full.png" alt="Klinova" style={{ height: 36, width: 'auto' }} />
          </a>
          <span style={{ width: 1, height: 20, background: C.line }} />
          <span style={{ fontSize: 13, color: C.mute }}>Politique de confidentialité</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <a href="/privacy" style={{ fontSize: 12, fontWeight: 700, color: C.mute, padding: '4px 10px', borderRadius: 6, textDecoration: 'none' }}>EN</a>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.ink, padding: '4px 10px', borderRadius: 6, background: C.soft }}>FR</span>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '64px 32px 96px' }}>
        {/* Bloc titre */}
        <div style={{ marginBottom: 56 }}>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 38, fontWeight: 700, color: C.ink, margin: '0 0 10px', lineHeight: 1.2 }}>
            Politique de confidentialité
          </h1>
          <p style={{ fontSize: 14, color: C.mute, margin: 0 }}>Dernière mise à jour : juin 2026</p>
        </div>

        {/* Introduction */}
        <p style={{ ...body, fontSize: 16, marginBottom: 48 }}>
          Cette politique explique quelles informations Klinova Health collecte, pourquoi nous les collectons et comment nous les protégeons. Notre objectif est d&apos;être clairs et directs : pas de jargon juridique, pas de surprises.
        </p>

        {/* 01 */}
        <Section number={1} title="Qui sommes-nous ?">
          <p style={body}>
            Klinova Health exploite la plateforme de télémédecine Klinova sur klinova.co ainsi que l&apos;application mobile Klinova sur iOS et Android. Nous sommes basés à Lomé, au Togo.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            Des questions sur cette politique ? Contactez-nous à{' '}
            <a href="mailto:contact@klinova.co" style={{ color: C.green, textDecoration: 'none', fontWeight: 500 }}>contact@klinova.co</a>.
          </p>
        </Section>

        {/* 02 */}
        <Section number={2} title="Informations que nous collectons">
          <p style={body}>Nous ne collectons que ce dont nous avons réellement besoin pour fournir des soins.</p>
          <Row>Données de compte : votre nom, adresse e-mail, numéro de téléphone et rôle (patient, médecin ou clinique).</Row>
          <Row>Informations de santé issues de vos consultations : symptômes, niveau d&apos;urgence et notes ajoutées volontairement.</Row>
          <Row>Localisation au niveau du district ou de la région, utilisée pour suggérer des cliniques proches ou des services d&apos;urgence.</Row>
          <Row>Données d&apos;utilisation de base : pages visitées, fonctionnalités utilisées et préférence de langue.</Row>
        </Section>

        {/* 03 */}
        <Section number={3} title="Comment nous utilisons vos informations">
          <Row>Pour vous mettre en relation avec des médecins et assurer vos consultations de télémédecine.</Row>
          <Row>Pour vous orienter vers les cliniques les plus proches ou les services d&apos;urgence en cas de besoin.</Row>
          <Row>Pour produire des statistiques de santé anonymisées et agrégées à destination des autorités sanitaires. Aucune donnée individuelle n&apos;est jamais partagée dans ces rapports.</Row>
          <Row>Pour faire fonctionner votre compte et communiquer avec vous à son sujet.</Row>
        </Section>

        {/* 04 */}
        <Section number={4} title="Partage des données">
          <p style={body}>
            Nous ne vendons pas vos données personnelles. Point final. Les seules situations dans lesquelles nous partageons des informations sont :
          </p>
          <Row>Avec le médecin que vous consultez, afin qu&apos;il puisse vous prodiguer des soins.</Row>
          <Row>Avec les autorités sanitaires gouvernementales, uniquement sous forme de statistiques anonymisées et agrégées, jamais sous forme de dossiers individuels.</Row>
        </Section>

        {/* 05 */}
        <Section number={5} title="Conservation des données">
          <p style={{ ...body, marginBottom: 0 }}>
            Nous conservons les données de votre compte aussi longtemps que celui-ci est actif. Vous pouvez demander la suppression complète de vos données à tout moment en nous écrivant à{' '}
            <a href="mailto:contact@klinova.co" style={{ color: C.green, textDecoration: 'none', fontWeight: 500 }}>contact@klinova.co</a>.
            Les données de santé anonymisées et agrégées peuvent être conservées à des fins de recherche en santé publique, mais elles ne peuvent pas être associées à votre identité.
          </p>
        </Section>

        {/* 06 */}
        <Section number={6} title="Vos droits">
          <p style={{ ...body, marginBottom: 0 }}>
            Vous avez le droit d&apos;accéder à vos données personnelles, de les corriger ou de les supprimer à tout moment. Pour exercer l&apos;un de ces droits, contactez-nous à{' '}
            <a href="mailto:contact@klinova.co" style={{ color: C.green, textDecoration: 'none', fontWeight: 500 }}>contact@klinova.co</a>{' '}
            et nous répondrons dans un délai de 30 jours.
          </p>
        </Section>

        {/* 07 */}
        <Section number={7} title="Conformité réglementaire">
          <p style={body}>
            Klinova est conçu pour respecter les normes les plus strictes en matière de protection des données de santé dans chaque pays où nous opérons.
          </p>
          <Badge
            label="RGPD"
            note="Règlement UE 2016/679, qui régit la manière dont nous collectons, traitons et stockons les données personnelles de nos utilisateurs en Europe et dans le monde."
          />
          <Badge
            label="HIPAA"
            note="45 CFR Parties 160 et 164, régissant le traitement et la protection des informations de santé protégées."
          />
          <Badge
            label="Législations nationales"
            note="Nous respectons les réglementations nationales de protection des données de santé du Togo, du Ghana, du Bénin et de la Côte d'Ivoire, applicables aux services fournis dans chaque pays."
          />
          <Callout>
            Tous les dossiers de santé sont chiffrés de bout en bout. Vous êtes propriétaire de vos données. Nous agissons en tant que sous-traitant, ce qui signifie que nous traitons vos informations uniquement dans le but de vous fournir des soins. Nous ne sommes en aucun cas un courtier en données.
          </Callout>
        </Section>

        {/* 08 */}
        <Section number={8} title="Sécurité">
          <p style={body}>
            Nous appliquons un modèle de sécurité zéro confiance : aucun utilisateur, système ou service n&apos;est considéré comme fiable par défaut, quelle que soit l&apos;origine de la requête. Concrètement, cela signifie :
          </p>
          <Row>Toutes les connexions utilisent HTTPS/TLS. Vos données sont chiffrées en transit, en permanence.</Row>
          <Row>Chaque table de base de données applique une sécurité au niveau des lignes. Vous ne pouvez accéder qu&apos;à vos propres enregistrements.</Row>
          <Row>Les identifiants API et les clés de service sont gérés côté serveur uniquement et ne sont jamais exposés au navigateur.</Row>
          <Row>Les données des patients sont pseudonymisées dès leur collecte.</Row>
          <Row>Nous révisons les autorisations d&apos;accès en continu et appliquons le principe du moindre privilège à chaque rôle interne.</Row>
        </Section>

        {/* 09 */}
        <Section number={9} title="Mineurs">
          <p style={{ ...body, marginBottom: 0 }}>
            Klinova n&apos;est pas destiné aux enfants de moins de 13 ans. Nous ne collectons pas sciemment de données auprès de personnes de moins de 13 ans. Si vous pensez qu&apos;un enfant nous a fourni ses informations, contactez-nous et nous les supprimerons rapidement.
          </p>
        </Section>

        {/* 10 */}
        <Section number={10} title="Modifications de cette politique">
          <p style={{ ...body, marginBottom: 0 }}>
            Nous pouvons mettre à jour cette politique au fil de l&apos;évolution de la plateforme. Pour les changements importants, nous vous en informerons par e-mail ou via une notification dans l&apos;application avant que la modification entre en vigueur.
          </p>
        </Section>

        {/* Pied de page contact */}
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
