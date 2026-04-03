import { SocialLinks } from '../components/SocialLinks'

export function ContactPage() {
  return (
    <section className="panel content-page">
      <h2 className="section-heading">Contact me</h2>
      <p>
        Email me here: <a href="mailto:vivekanjan@gmail.com">vivekanjan@gmail.com</a>
      </p>
      <p>
        Subscribe to the newsletter from the homepage section or use the direct link from the navigation.
      </p>

      <SocialLinks className="about-socials" />
    </section>
  )
}
