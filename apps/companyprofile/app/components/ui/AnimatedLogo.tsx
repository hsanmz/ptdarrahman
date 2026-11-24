interface Props {
  src: string
  alt: string
  isTransparent?: boolean
  className?: string
}

const FALLBACK_LOGO =
  'https://res.cloudinary.com/dunynusuh/image/upload/v1771353749/82ed87dd-4f99-46ca-b481-775f19b6b7c9.png'

export default function AnimatedLogo({ src, alt, isTransparent, className = '' }: Props) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span
        className="absolute inset-0 rounded-full opacity-0"
        style={{
          background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)',
          animation: 'logoPulse 3s ease-in-out infinite',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || FALLBACK_LOGO}
        alt={alt}
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_LOGO) {
            e.currentTarget.src = FALLBACK_LOGO
          }
        }}
        className={`h-8 sm:h-10 w-auto object-contain transition-all duration-300 relative ${
          isTransparent ? 'brightness-0 invert' : ''
        }`}
        style={{ animation: 'logoFloat 4s ease-in-out infinite' }}
      />
    </span>
  )
}
