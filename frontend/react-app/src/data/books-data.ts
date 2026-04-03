export type BookData = {
  id: string
  title: string
  subtitle?: string
  description: string
  fullDescription: string
  coverImage: string
  price: number
  currency: string
  buyLinks: Array<{ label: string; url: string }>
}

export const booksData: BookData[] = [
  {
    id: 'abhivyukti-anjan-ki-samvedanayen',
    title: 'अभिव्यक्ति - अंजन की संवेदनाएं',
    subtitle: 'भावनात्मक अनुभूतियों का सजीव संग्रह',
    description:
      'यह पुस्तक अभिव्यक्ति - अंजन की संवेदनाएं कवि विवेक अंजन श्रीवास्तव की भावनात्मक अनुभूतियों का सजीव संग्रह है।',
    fullDescription:
      'यह पुस्तक अभिव्यक्ति - अंजन की संवेदनाएं कवि विवेक अंजन श्रीवास्तव की भावनात्मक अनुभूतियों का सजीव संग्रह है। भावनात्मक अनुभूतियों, आत्म-संवाद और जीवन के सूक्ष्म प्रश्नों का सजीव संग्रह जो पाठकों के मन को स्पर्श करता है। काव्य के माध्यम से जीवन की गहराइयों को समझने का एक अलग ही अनुभव।',
    coverImage: '/assets/images/new_release.jpg',
    price: 299,
    currency: 'INR',
    buyLinks: [{ label: 'Buy on Amazon', url: 'https://amzn.in/d/ho2talQ' }],
  },
  {
    id: 'anjan-kuch-dil-se',
    title: 'अंजन... कुछ दिल से',
    subtitle: 'दिल से लिखा, दिल को छूने वाला काव्य संग्रह',
    description:
      'अंजन काजल का समानार्थी शब्द है। इसी शब्द पर आधारित यह काव्य संग्रह पाठकों को संवेदनाओं के करीब ले जाता है।',
    fullDescription:
      'अंजन काजल का समानार्थी शब्द है। इसी शब्द पर आधारित यह काव्य संग्रह पाठकों को संवेदनाओं के करीब ले जाता है। दिल से लिखा, दिल को छूने वाला काव्य संग्रह जिसमें भावनाएं, रिश्ते और समय की परतें हैं। प्रत्येक कविता एक अलग कहानी कहती है, एक अलग अनुभूति देती है।',
    coverImage: '/assets/images/anjan.jpg',
    price: 249,
    currency: 'INR',
    buyLinks: [
      {
        label: 'Buy on Pothi',
        url: 'https://store.pothi.com/book/%E0%A4%B5%E0%A4%BF%E0%A4%B5%E0%A5%87%E0%A4%95-%E0%A4%85%E0%A4%82%E0%A4%9C%E0%A4%A8-%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80%E0%A4%B5%E0%A4%BE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A4%B5-%E0%A4%85%E0%A4%82%E0%A4%9C%E0%A4%A8/',
      },
      {
        label: 'Buy Ebook on Amazon',
        url: 'https://www.amazon.in/%E0%A4%85%E0%A4%82%E0%A4%9C%E0%A4%A8-%E0%A4%95%E0%A5%81%E0%A4%9B-%E0%A4%A6%E0%A4%BF%E0%A4%B2-%E0%A4%B8%E0%A5%87-Hindi-ebook/dp/B0BNDHTJ7Q',
      },
    ],
  },
  {
    id: 'antarmman',
    title: 'अंतर्मन',
    subtitle: 'संयुक्त काव्य संग्रह',
    description:
      'जीवन की समस्याओं और मन की गहराइयों को भारतीय संस्कारों के भीतर पिरोता हुआ एक आत्मीय संग्रह।',
    fullDescription:
      'जीवन की समस्याओं और मन की गहराइयों को भारतीय संस्कारों के भीतर पिरोता हुआ एक आत्मीय संग्रह। अंतर्मन एक संयुक्त काव्य संग्रह है जो विभिन्न कवियों के छंदों को एक ही मंच पर प्रस्तुत करता है। इस संग्रह में आत्म-चिंतन, सामाजिक सरोकार और सांस्कृतिक मूल्यों का सुंदर समन्वय मिलता है।',
    coverImage: '/assets/images/antarman.png',
    price: 279,
    currency: 'INR',
    buyLinks: [
      {
        label: 'Buy on Flipkart',
        url: 'https://www.flipkart.com/vidhwaan-kaviyon-ka-antarman/p/itmdy8m9tgvdbayn?pid=9789384236205&ref=L%3A1156165615059355101&srno=p_15&query=utkarsh+prakashan&otracker=from-search',
      },
    ],
  },
]

export function getBookById(id: string): BookData | undefined {
  return booksData.find((book) => book.id === id)
}

export function getAllBooks(): BookData[] {
  return booksData
}
