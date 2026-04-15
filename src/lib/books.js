export const BOOKS = [
  {
    id: 'transformation',
    image: '/fitzone-workout.jpeg',
    accentColor: 'from-blue-600 to-blue-800',
    accentLight: 'blue',
    title: { ar: 'الدليل الشامل للتنشيف وبناء الجسم', en: 'Complete Shredding & Building Guide' },
    subtitle: { ar: '+ تحدي الـ30 يوم', en: '+ 30-Day Challenge' },
    badges: { ar: ['مناسب للمبتدئين', 'خطة جاهزة'], en: ['Beginner Friendly', 'Ready Plan'] },
    valueProps: {
      ar: ['برنامج تدريبي كامل بالشرح', 'التمارين مع فيديوهات توضيحية', 'الكارديو: متى وكيف وكم؟', 'تحدي 30 يوم للتنشيف السريع', 'السر الذي يخفيه المدربون'],
      en: ['Full training program explained', 'Exercises with tutorial videos', 'Cardio: when, how & how much?', '30-day rapid shredding challenge', "The secret trainers don't share"],
    },
    rating: 4.9,
    downloads: '1500+',
  },
  {
    id: 'nutrition',
    image: '/fitzone-nutrition.jpeg',
    accentColor: 'from-emerald-600 to-emerald-800',
    accentLight: 'green',
    title: { ar: 'الدليل الكامل لخسارة الدهون', en: 'Complete Fat Loss Guide' },
    subtitle: { ar: 'نظام غذائي قابل للتطبيق', en: 'Practical Nutrition System' },
    badges: { ar: ['سهل التطبيق', 'نتائج واقعية'], en: ['Easy to Apply', 'Real Results'] },
    valueProps: {
      ar: ['القاعدة الذهبية لخسارة الدهون', 'خطة وجبات (3، 4، أو 5 وجبات)', 'تنظيم الأسبوع وقائمة التسوق', 'وجبة الشيت: استمتع بدون ما تخرب'],
      en: ['The golden rule of fat loss', 'Meal plan (3, 4, or 5 meals/day)', 'Weekly meal plan & shopping list', 'Cheat meal guide — enjoy without guilt'],
    },
    rating: 4.8,
    downloads: '2000+',
  },
]

export const BUNDLE = {
  id: 'bundle',
  title: { ar: 'الباقة الكاملة', en: 'Complete Bundle' },
  subtitle: { ar: 'تدريب + تغذية + متابعة واتساب شهر كامل', en: 'Training + Nutrition + WhatsApp Support for a Full Month' },
  valueProps: {
    ar: ['كل محتوى دليل التنشيف وبناء الجسم', 'كل محتوى دليل خسارة الدهون', 'تحدي 30 يوم للتنشيف السريع', 'متابعة شخصية عبر الواتساب لمدة شهر', 'خطوات واضحة من البداية للنهاية'],
    en: ['Full shredding & building guide content', 'Full fat loss guide content', '30-day rapid shredding challenge', 'Personal WhatsApp follow-up for 1 month', 'Clear step-by-step roadmap'],
  },
  rating: 4.9,
  downloads: '3000+',
}
