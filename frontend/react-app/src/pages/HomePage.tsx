import { Link } from 'react-router-dom'
import { SocialLinks } from '../components/SocialLinks'
import { YouTubeVideos } from '../components/YouTubeVideos'
import { booksData } from '../data/books-data'

export function HomePage() {
  return (
    <>
      <section className="hero-section" id="home">
        <aside className="left-col">
          <div className="author-card">
            <img
              src="/assets/images/vivek_anjan.jpg"
              alt="Vivek Anjan Shrivastava"
              className="author-photo"
            />
            <div className="author-meta">
              <h2>Vivek Anjan Shrivastava</h2>
              <p>Writer · Motivator · IT Professional</p>
            </div>
          </div>

          <div className="books-column-heading">
            <h2>My Books</h2>
            <p>Poetry collections, reflections, and published anthologies shaped by lived experience.</p>
          </div>

          {booksData.map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="mini-book-card book-card-link"
            >
              <img
                src={book.coverImage}
                alt={book.title}
                className="mini-book-cover"
              />
              <div className="book-title">{book.title}</div>
              <div className="book-desc">{book.description}</div>
              <div className="btn-buy-sm">View Details</div>
            </Link>
          ))}

          <Link to="/books" className="btn-books-section">Go to books section to discover all the books</Link>
        </aside>

        <article className="center-col hero-card">
          <p className="bio-text">
            अपने बारे में अपनी भावनाओं को व्यक्त करने में हमेशा परेशानी होती है। सलाह अच्छी देता हूं,
            राजदार अच्छा हूं इसलिए कुछ लोगों के अंतरंग का गवाह हूं। <u><b>किताब, क्रिकेट, सिनेमा, नाटक,
            संगीत</b></u> और प्रेम में गहरी दिलचस्पी है।
          </p>

          <p className="bio-text">
            अपने इर्द-गिर्द एक दीवार बनाए हुए हूं जिसमें घुसने की इजाजत कुछ ही लोगों को है।
            अगंभीर किस्म का गंभीर इंसान हूं।
          </p>

          <div className="bio-divider" />

          <section className="bio-section">
            <strong>Experience &amp; Education:</strong>
            <p>
              He has over 18 years of experience in IT leadership. He holds advanced degrees including a B.E.
              (Hons.) in Computer Science, an MBA (HR), MIT and an M.Tech in CS, along with 100+ certifications
              spanning computing, networking, personality development, and professional skills.
            </p>
          </section>

          <section className="bio-section">
            <strong>Thought Leadership:</strong>
            <p>
              He regularly publishes insights on LinkedIn, with recent pieces focusing on topics like sustainable AI,
              leadership transitions, and workplace wellbeing.
            </p>
          </section>

          <section className="bio-section">
            <strong>Writing Endeavours:</strong>
            <p>
              Since 2010, he has been continuously active in Hindi writing, whether for magazines, diaries, or to
              express his thoughts. He is interested in both prose and poetry, mainly satire, short stories, articles
              on contemporary issues, and poetic compositions.
            </p>
          </section>

          <section className="bio-section bio-section-highlight">
            <strong>Creative Interests:</strong>
            <p>
              Outside of writing, he enjoys books, cricket, cinema, theatre, and music. He is fascinated by people,
              conversations, and the subtle ways daily life turns into literature.
            </p>
          </section>

          <div className="bio-divider" />

          <section className="digital-space-inline">
            <h3 style={{ margin: '0 0 12px', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: 'var(--accent)' }}>My Digital Space</h3>
            <p style={{ margin: '0 0 12px', lineHeight: '1.7' }}>
              कागज पर अपने मन की बात और भावों को आकार देकर सुकून का अहसास पाता हूँ और मेरा कोई दूसरा शौक भी नहीं है —
              लेखनी मेरा शौक भी है व् कंप्यूटर जरुरत और दोनों ही पहचान का जरिया भी!
            </p>
            <p style={{ margin: '0 0 12px', lineHeight: '1.7' }}>
              <strong>Motivational lectures, Personality Development activities, कविता पाठ, SAP, Networking</strong>
              और भी बहुत कुछ… तो लिखने, पढने, सीखने, सिखाने, मित्रता और गुफ्तगूं के लिए चले आइये इन वेब जाल पर।
            </p>
            <p style={{ margin: '0 0 12px', lineHeight: '1.7' }}>
              I write to preserve a thought before it slips away, and I use technology to share those thoughts with
              a larger audience. This site brings both sides together.
            </p>
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--line)' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent)' }}>Follow along on social media</p>
              <SocialLinks className="digital-space-social" />
            </div>
          </section>
        </article>

        <aside className="right-col hero-card">
          <h2 className="digital-space-title">Latest Videos</h2>
          <p className="digital-space-text">Click to explore speeches, readings, and conversations.</p>
          <YouTubeVideos />
          
          <div className="newsletter-inline" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid var(--line)' }}>
            <h3 style={{ margin: '0 0 12px', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--accent)' }}>Stay in the loop</h3>
            <p style={{ margin: '0 0 12px', fontSize: '0.95rem', lineHeight: '1.6' }}>Subscribe to receive new poems, articles, and book announcements.</p>
            <div className="newsletter-form" style={{ display: 'grid', gap: '8px' }}>
              <input type="email" placeholder="Your email" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', fontFamily: 'inherit' }} />
              <button type="button" style={{ padding: '10px 16px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }}>Subscribe</button>
            </div>
          </div>
        </aside>
      </section>

      <section className="section-wrapper activities-section" id="activities">
        <h2 className="section-heading">Other Activities</h2>
        <p className="section-sub">Awards, publications, and conversations</p>

        <div className="activities-grid">
          <article className="activity-card">
            <img src="/assets/images/sam1.jpg" alt="सम्मान" className="activity-image" />
            <p>सम्मान</p>
          </article>
          <article className="activity-card">
            <img src="/assets/images/vimochann.jpg" alt="विमोचन" className="activity-image" />
            <p>विमोचन</p>
          </article>
          <article className="activity-card">
            <img src="/assets/images/guftgu.jpg" alt="गुफ्तगूं" className="activity-image" />
            <p>गुफ्तगूं</p>
          </article>
        </div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <div className="newsletter-box hero-card">
          <img src="/assets/images/newsletter.jpg" alt="Newsletter" className="newsletter-art" />
          <div className="newsletter-text">
            <h2>Stay in the loop</h2>
            <p>Subscribe to receive new poems, articles, and book announcements directly in your inbox.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Your email address" />
              <button type="button">Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p className="footer-quote">ये एक पन्ना था अभी तो किताब बाकी हैं…</p>
        <p>Copyright © 2025 Vivek Anjan Shrivastava. All rights reserved.</p>
      </footer>
    </>
  )
}
