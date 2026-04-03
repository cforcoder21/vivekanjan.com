type SocialLinksProps = {
  className?: string
}

const socialLinks = [
  { href: 'http://www.vivekanjan.blogspot.in/', label: 'Blog', icon: 'fa-blogger-b' },
  { href: 'https://www.facebook.com/profile.php?id=100000817695075', label: 'Facebook', icon: 'fa-facebook-f' },
  { href: 'http://in.linkedin.com/in/vivekanjan', label: 'LinkedIn', icon: 'fa-linkedin-in' },
  { href: 'https://twitter.com/vivekanjan', label: 'X / Twitter', icon: 'fa-x-twitter' },
  { href: 'https://www.youtube.com/user/vivekanjan', label: 'YouTube', icon: 'fa-youtube' },
]

export function SocialLinks({ className }: SocialLinksProps) {
  return (
    <div className={className ? `social-row ${className}` : 'social-row'}>
      {socialLinks.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="social-icon-link" aria-label={link.label} title={link.label}>
          <i className={`fa-brands ${link.icon}`} aria-hidden="true" />
        </a>
      ))}
    </div>
  )
}
