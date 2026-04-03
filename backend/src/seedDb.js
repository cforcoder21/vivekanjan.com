import bcrypt from 'bcryptjs'
import { pool, query } from './db.js'

const books = [
  {
    slug: 'abhivyakti',
    title: 'अभिव्यक्ति - अंजन की संवेदनाएं',
    subtitle: 'भावनात्मक अनुभूतियों का सजीव संग्रह',
    description: 'यह पुस्तक कवि विवेक अंजन श्रीवास्तव की भावनात्मक अनुभूतियों का सजीव संग्रह है।',
    cover_image: '/frontend/assets/images/new_release.jpg',
    price_inr: 299,
    stock_quantity: 50,
    buy_links: [{ label: 'Amazon', url: 'https://amzn.in/d/ho2talQ' }],
  },
  {
    slug: 'anjan',
    title: 'अंजन... कुछ दिल से',
    subtitle: 'दिल से लिखा, दिल को छूने वाला काव्य संग्रह',
    description: 'दिल से लिखा, दिल को छूने वाला काव्य संग्रह।',
    cover_image: '/frontend/assets/images/anjan.jpg',
    price_inr: 249,
    stock_quantity: 75,
    buy_links: [
      {
        label: 'Pothi',
        url: 'https://store.pothi.com/book/%E0%A4%B5%E0%A4%BF%E0%A4%B5%E0%A5%87%E0%A4%95-%E0%A4%85%E0%A4%82%E0%A4%9C%E0%A4%A8-%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80%E0%A4%B5%E0%A4%BE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A4%B5-%E0%A4%85%E0%A4%82%E0%A4%9C%E0%A4%A8/',
      },
    ],
  },
  {
    slug: 'antarman',
    title: 'अंतर्मन',
    subtitle: 'दार्शनिक सोच और आत्मीय स्वर',
    description: 'दार्शनिक सोच और आत्मीय स्वर वाली रचनाएं।',
    cover_image: '/frontend/assets/images/antarman.png',
    price_inr: 199,
    stock_quantity: 100,
    buy_links: [
      {
        label: 'Flipkart',
        url: 'https://www.flipkart.com/vidhwaan-kaviyon-ka-antarman/p/itmdy8m9tgvdbayn?pid=9789384236205&ref=L%3A1156165615059355101&srno=p_15&query=utkarsh+prakashan&otracker=from-search',
      },
    ],
  },
]

const anthologies = [
  ['विरासत', 'साझा काव्य संकलन', 'Shabd Shilpi Satna', 'May-19'],
  ['युवा हस्ताक्षर', 'साझा काव्य संकलन', 'Shabd Shilpi Satna', 'Jul-19'],
  ['काव्य वीथिका', 'साझा काव्य संकलन', 'Shabd Shilpi Satna', 'Jun-20'],
  ['वो मोहब्बत थी या कारवां', 'साझा काव्य संकलन', 'Shabd Shilpi Satna', 'Jan-22'],
  ['वर दे वीणा वादिनी', 'साझा काव्य संकलन', 'Shabd Shilpi Satna', 'Feb-22'],
  ['पड़ाव', 'साझा काव्य संकलन', 'Shabd Shilpi Satna', 'Feb-25'],
]

async function main() {
  const adminHash = await bcrypt.hash('Admin@12345', 10)
  const customerHash = await bcrypt.hash('Customer@12345', 10)

  await query(
    `INSERT INTO users(name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['Site Admin', 'admin@vivekanjan.com', adminHash, 'admin'],
  )

  await query(
    `INSERT INTO users(name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['Sample Customer', 'customer@vivekanjan.com', customerHash, 'customer'],
  )

  for (const book of books) {
    await query(
      `INSERT INTO books(slug, title, subtitle, description, cover_image, price_inr, buy_links, stock_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
       ON CONFLICT (slug) DO NOTHING`,
      [book.slug, book.title, book.subtitle, book.description, book.cover_image, book.price_inr, JSON.stringify(book.buy_links), book.stock_quantity],
    )
  }

  for (const item of anthologies) {
    await query(
      `INSERT INTO anthologies(title, publication_type, organization, published_on, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [item[0], item[1], item[2], item[3], 'Shared anthology publication.', '/frontend/assets/images/samiksha.jpg'],
    )
  }

  console.log('PostgreSQL seed data inserted')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
