import { SocialLinks } from '../components/SocialLinks'

export function AboutPage() {
  return (
    <section className="panel content-page">
      <h2 className="section-heading">परिचय</h2>
      <p className="about-intro">
        अपने बारे में अपनी भावनाओं को व्यक्त करने में हमेशा परेशानी होती है। सलाह अच्छी देता हूं, राजदार अच्छा हूं
        इसलिए कुछ लोगों के अंतरंग का गवाह हूं। किताब, क्रिकेट, सिनेमा, नाटक, संगीत और प्रेम में गहरी दिलचस्पी है।
        अपने इर्द-गिर्द एक दीवार बनाए हुए हूं जिसमें घुसने की इजाजत कुछ ही लोगों को है। अगंभीर किस्म का गंभीर
        इंसान हूं।
      </p>
      <div className="info-table">
        <div className="info-row">
          <strong>शैक्षणिक योग्यता :</strong>
          <span>B.E.(Hons.) Computer Science, MBA (HR), MIT, M.Tech.</span>
        </div>
        <div className="info-row">
          <strong>विधा :</strong>
          <span>गद्य पद्य दोनों में रुचि, मुख्यतः व्यंग, लघुकथा, समसामयिक विषयों पर लेख, काव्य रचना, और विचारधारा से जुड़ी लेखनी।</span>
        </div>
        <div className="info-row">
          <strong>रूचि :</strong>
          <span>कविता के अतिरिक्त संगीत से प्रेम। जन-संपर्क, इंटरनेट, ब्लॉगिंग, मंच संचालन और विचार-विमर्श में रुचि।</span>
        </div>
        <div className="info-row">
          <strong>प्रकाशित कृतियाँ :</strong>
          <span>अंजन... कुछ दिल से (2012), अन्तर्मन (2013), और प्रकाशन में काव्य संग्रह अभिव्यक्ति।</span>
        </div>
        <div className="info-row">
          <strong>सम्मान एवं पुरस्कार:</strong>
          <span>‘कायस्थ समाज’ सतना द्वारा नव लेखन के लिए सम्मानित, तथा शब्द शिल्पी साहित्य सम्मान 2019.</span>
        </div>
        <div className="info-row">
          <strong>सदस्य :</strong>
          <span>प्रयास-मंच साहित्यिक संस्था, मैहर; रसरंग साहित्यिक संस्था, सतना; और स्थानीय साहित्यिक गतिविधियों से जुड़े रहे हैं.</span>
        </div>
        <div className="info-row">
          <strong>अन्य उपलब्धियां :</strong>
          <span>विभिन्न सामाजिक और सांस्कृतिक कार्यक्रमों में मंच संचालन, कवि सम्मेलनों में काव्यपाठ, तथा कई समाचार पत्रों और साहित्यिक वेब पेजों में लेख व कविताओं का प्रकाशन.</span>
        </div>
      </div>

      <h2 className="section-heading">My Digital Space</h2>
      <p className="about-note">
        लेखनी, कंप्यूटर, मित्रता और गुफ्तगूं के लिए यह डिजिटल स्थान बनाया गया है।
      </p>
      <SocialLinks className="about-socials" />
    </section>
  )
}
