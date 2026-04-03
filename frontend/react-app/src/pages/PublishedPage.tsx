import { useState } from 'react'

export function PublishedPage() {
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  const images = [
    { src: '/assets/images/sammann.jpg', alt: 'सम्मान', title: 'सम्मान' },
    { src: '/assets/images/vimochan.jpg', alt: 'विमोचन', title: 'विमोचन' },
    { src: '/assets/images/patrika_holi.jpg', alt: 'प्रकाशन', title: 'प्रकाशन' },
  ]

  return (
    <section className="panel content-page">
      <h2 className="section-heading">Published</h2>
      <p>
        This section can list books, magazines, and annual publications from the original site.
      </p>
      <div className="activities-grid published-grid">
        {images.map((image) => (
          <article key={image.src} className="activity-card">
            <img 
              src={image.src} 
              alt={image.alt} 
              className="activity-image expandable-image"
              onClick={() => setExpandedImage(image.src)}
              style={{ cursor: 'pointer' }}
            />
            <p>{image.title}</p>
          </article>
        ))}
      </div>

      {expandedImage && (
        <div className="image-modal-overlay" onClick={() => setExpandedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close" 
              onClick={() => setExpandedImage(null)}
              aria-label="Close"
            >
              ×
            </button>
            <img src={expandedImage} alt="Expanded" className="image-modal-image" />
          </div>
        </div>
      )}
    </section>
  )
}
