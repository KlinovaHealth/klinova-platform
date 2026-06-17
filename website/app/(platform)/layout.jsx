import './platform.css'
import { AuthProvider } from '@/hooks/useAuth'

export default function PlatformLayout({ children }) {
  return (
    <div className="platform-root" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  )
}
