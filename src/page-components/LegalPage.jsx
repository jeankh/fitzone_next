'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const legalContent = {
  privacy: {
    title: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    icon: '🔒',
    sections: {
      ar: [
        { heading: 'مقدمة', body: 'نحن في FitZone نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام موقعنا وشراء منتجاتنا.' },
        { heading: 'المعلومات التي نجمعها', body: 'نجمع المعلومات التالية عند إتمام عملية الشراء:\n• الاسم الكامل\n• البريد الإلكتروني\n• رقم الهاتف (واتساب)\n• معلومات الدفع (تتم معالجتها بشكل آمن عبر مزود الدفع ولا نخزنها)' },
        { heading: 'كيف نستخدم معلوماتك', body: '• إرسال البرامج بعد الشراء\n• التواصل معك بخصوص طلبك\n• إرسال تحديثات المنتجات (يمكنك إلغاء الاشتراك في أي وقت)\n• تحسين خدماتنا ومنتجاتنا' },
        { heading: 'حماية البيانات', body: 'نستخدم تقنيات تشفير متقدمة لحماية بياناتك. لا نشارك معلوماتك الشخصية مع أطراف ثالثة إلا لإتمام عملية الدفع أو بموجب القانون.' },
        { heading: 'ملفات تعريف الارتباط', body: 'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة المرور على الموقع. يمكنك إدارة تفضيلات ملفات تعريف الارتباط من إعدادات متصفحك.' },
        { heading: 'حقوقك', body: '• الاطلاع على بياناتك الشخصية\n• طلب تعديل أو حذف بياناتك\n• إلغاء الاشتراك في الرسائل التسويقية\n• تقديم شكوى للجهات المختصة' },
        { heading: 'تواصل معنا', body: 'لأي استفسارات حول سياسة الخصوصية، تواصل معنا عبر واتساب أو البريد الإلكتروني.' },
      ],
      en: [
        { heading: 'Introduction', body: 'At FitZone, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information when using our website and purchasing our products.' },
        { heading: 'Information We Collect', body: 'We collect the following information during purchase:\n• Full name\n• Email address\n• Phone number (WhatsApp)\n• Payment information (processed securely through our payment provider — we do not store it)' },
        { heading: 'How We Use Your Information', body: '• Delivering programs after purchase\n• Communicating with you about your order\n• Sending product updates (you can unsubscribe at any time)\n• Improving our services and products' },
        { heading: 'Data Protection', body: 'We use advanced encryption technologies to protect your data. We do not share your personal information with third parties except to complete payment processing or as required by law.' },
        { heading: 'Cookies', body: 'We use cookies to improve browsing experience and analyze website traffic. You can manage cookie preferences from your browser settings.' },
        { heading: 'Your Rights', body: '• Access your personal data\n• Request modification or deletion of your data\n• Unsubscribe from marketing messages\n• File a complaint with relevant authorities' },
        { heading: 'Contact Us', body: 'For any questions about our privacy policy, contact us via WhatsApp or email.' },
      ],
    },
  },
  terms: {
    title: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
    icon: '📋',
    sections: {
      ar: [
        { heading: 'القبول', body: 'باستخدام موقع FitZone وشراء منتجاتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.' },
        { heading: 'المنتجات', body: 'جميع المنتجات المعروضة هي برامج تدريبية رقمية بصيغة PDF. المحتوى مخصص للأغراض التعليمية والمعلوماتية فقط ولا يعتبر بديلاً عن الاستشارة الطبية المتخصصة.' },
        { heading: 'التسليم', body: 'يتم تسليم البرامج فوراً بعد إتمام الدفع عبر:\n• رابط تحميل على البريد الإلكتروني\n• رسالة واتساب تأكيدية\n\nرابط التحميل متاح مدى الحياة.' },
        { heading: 'الملكية الفكرية', body: 'جميع المحتويات محمية بحقوق الملكية الفكرية. الشراء يمنحك ترخيصاً شخصياً غير قابل للتحويل. يُمنع:\n• إعادة بيع البرامج\n• مشاركتها مع آخرين\n• نسخ أو توزيع المحتوى' },
        { heading: 'الدفع', body: 'نقبل الدفع عبر Stripe Checkout باستخدام البطاقات الائتمانية والوسائل المدعومة مثل Apple Pay عند توفرها. جميع الأسعار بالريال السعودي وتشمل الضريبة.' },
        { heading: 'المسؤولية', body: 'النتائج تختلف من شخص لآخر. نحن لا نضمن نتائج محددة. يُنصح باستشارة طبيب قبل البدء بأي برنامج تمارين أو حمية غذائية جديدة.' },
        { heading: 'التعديلات', body: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية.' },
      ],
      en: [
        { heading: 'Acceptance', body: 'By using the FitZone website and purchasing our products, you agree to be bound by these terms and conditions. If you do not agree to any of these terms, please do not use the website.' },
        { heading: 'Products', body: 'All products offered are digital training programs in PDF format. Content is for educational and informational purposes only and is not a substitute for professional medical advice.' },
        { heading: 'Delivery', body: 'Programs are delivered immediately after payment via:\n• Download link sent to your email\n• WhatsApp confirmation message\n\nDownload link is available for life.' },
        { heading: 'Intellectual Property', body: 'All content is protected by intellectual property rights. Purchase grants you a personal, non-transferable license. You may not:\n• Resell the programs\n• Share them with others\n• Copy or distribute the content' },
        { heading: 'Payment', body: 'We accept payment through Stripe Checkout using credit and debit cards, plus supported wallets such as Apple Pay when available. All prices are in Saudi Riyals (SAR) and include tax.' },
        { heading: 'Liability', body: 'Results vary from person to person. We do not guarantee specific results. It is recommended to consult a doctor before starting any new exercise or diet program.' },
        { heading: 'Modifications', body: 'We reserve the right to modify these terms at any time. Users will be notified of any material changes.' },
      ],
    },
  },
  refund: {
    title: { ar: 'سياسة الاسترداد', en: 'Refund Policy' },
    icon: '💰',
    sections: {
      ar: [
        { heading: 'سياسة المنتجات الرقمية', body: 'جميع منتجاتنا هي برامج تدريبية رقمية (PDF) يتم تسليمها فوراً بعد الدفع. نظراً لطبيعة المنتجات الرقمية التي لا يمكن إرجاعها بعد التحميل، فإن جميع المبيعات نهائية بشكل عام.' },
        { heading: 'متى يمكن طلب الاسترداد', body: 'نقدم استرداداً في الحالات التالية فقط:\n• مشكلة تقنية تمنع فتح الملف أو تحميله ولم نتمكن من حلها\n• تم خصم المبلغ دون استلام رابط التحميل\n• تكرار الدفع عن طريق الخطأ (شراء نفس المنتج مرتين)\n\nيجب تقديم الطلب خلال ٧ أيام من تاريخ الشراء.' },
        { heading: 'كيفية طلب الاسترداد', body: 'لطلب الاسترداد:\n١. تواصل معنا عبر واتساب خلال ٧ أيام من الشراء\n٢. أرسل رقم الطلب أو البريد الإلكتروني المستخدم\n٣. وضّح سبب طلب الاسترداد\n٤. سنراجع طلبك ونرد خلال ٤٨ ساعة عمل' },
        { heading: 'طريقة الاسترداد', body: 'في حال الموافقة، يتم الاسترداد بنفس طريقة الدفع الأصلية:\n• البطاقات الائتمانية: خلال ٥-١٠ أيام عمل\n• Apple Pay: خلال ٣-٥ أيام عمل' },
        { heading: 'حالات عدم الاسترداد', body: 'لا يمكن الاسترداد في الحالات التالية:\n• تم تحميل البرامج بنجاح وفتحها\n• مرور أكثر من ٧ أيام على الشراء\n• عدم الرضا عن المحتوى بعد مراجعته (المنتجات الرقمية لا يمكن إرجاعها)\n• إساءة استخدام سياسة الاسترداد' },
        { heading: 'ضمان الجودة', body: 'نحن واثقون من جودة محتوانا. لذلك نوفر لك:\n• معاينة مجانية لجزء من كل برنامج قبل الشراء\n• دعم فني عبر واتساب لحل أي مشكلة تقنية\n• تحديثات مجانية للبرامج مدى الحياة' },
        { heading: 'تواصل معنا', body: 'لأي استفسارات حول الاسترداد، تواصل معنا مباشرة عبر واتساب. فريقنا متاح للمساعدة.' },
      ],
      en: [
        { heading: 'Digital Products Policy', body: 'All our products are digital training programs (PDF) delivered instantly after payment. Due to the nature of digital products that cannot be returned after download, all sales are generally final.' },
        { heading: 'When You Can Request a Refund', body: 'We offer refunds only in the following cases:\n• A technical issue prevents you from opening or downloading the file and we are unable to resolve it\n• Payment was charged but no download link was received\n• Duplicate payment by mistake (same product purchased twice)\n\nRequests must be submitted within 7 days of purchase.' },
        { heading: 'How to Request a Refund', body: 'To request a refund:\n1. Contact us via WhatsApp within 7 days of purchase\n2. Provide your order number or the email used for purchase\n3. Explain the reason for the refund request\n4. We will review your request and respond within 48 business hours' },
        { heading: 'Refund Method', body: 'If approved, refunds are processed via the original payment method:\n• Credit cards: 5-10 business days\n• Apple Pay: 3-5 business days' },
        { heading: 'Non-Refundable Cases', body: 'Refunds are not available in the following cases:\n• The programs have been successfully downloaded and opened\n• More than 7 days have passed since purchase\n• Dissatisfaction with the content after reviewing (digital products cannot be returned)\n• Abuse of the refund policy' },
        { heading: 'Quality Guarantee', body: 'We are confident in the quality of our content. That is why we offer:\n• Free preview of a portion of each program before purchase\n• Technical support via WhatsApp to resolve any issues\n• Free lifetime updates to all programs' },
        { heading: 'Contact Us', body: 'For any questions about refunds, contact us directly via WhatsApp. Our team is available to help.' },
      ],
    },
  },
}

export default function LegalPage({ type }) {
  const { lang } = useLanguage()
  const page = legalContent[type]

  if (!page) return null

  const sections = page.sections[lang]

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8"
        >
          <ArrowRight size={18} className={lang === 'en' ? 'rotate-180' : ''} />
          <span>{lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl">{page.icon}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{page.title[lang]}</h1>
          </div>

          <p className="text-text-muted text-sm mb-12">
            {lang === 'ar' ? 'آخر تحديث: يناير ٢٠٢٤' : 'Last updated: January 2024'}
          </p>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <h2 className="text-xl font-bold text-white mb-4">{section.heading}</h2>
                <div className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {section.body}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
