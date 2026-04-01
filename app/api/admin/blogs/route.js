import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = Redis.fromEnv()
const KV_KEY = 'fitzone_blogs'

const SEED_POSTS = [
  {
    id: '1',
    title: { ar: '١٠ أخطاء شائعة في التغذية تمنعك من خسارة الوزن', en: '10 Common Nutrition Mistakes Preventing Weight Loss' },
    excerpt: { ar: 'اكتشف الأخطاء التي يرتكبها معظم الناس عند محاولة إنقاص الوزن وكيف تتجنبها للحصول على نتائج أفضل.', en: 'Discover the mistakes most people make when trying to lose weight and how to avoid them for better results.' },
    category: 'nutrition', readTime: { ar: '٥ دقائق', en: '5 min read' }, date: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop', featured: true,
    content: {
      ar: `هل تبذل جهداً كبيراً في حميتك الغذائية ولكن لا ترى النتائج المرجوة؟ قد تكون ترتكب أحد هذه الأخطاء الشائعة التي تمنعك من تحقيق أهدافك.\n\n## ١. تخطي وجبة الإفطار\nيعتقد الكثيرون أن تخطي الإفطار يساعد في خسارة الوزن، لكن العكس صحيح. تخطي الإفطار يبطئ عملية الأيض ويزيد من احتمال الإفراط في الأكل لاحقاً.\n\n## ٢. عدم شرب كمية كافية من الماء\nالماء ضروري لعملية الأيض وحرق الدهون. اشرب على الأقل ٨ أكواب يومياً.\n\n## ٣. الاعتماد على الأطعمة "قليلة الدهون"\nكثير من الأطعمة المصنفة "قليلة الدهون" تحتوي على سكر مضاف لتعويض النكهة.\n\n## ٤. عدم حساب السعرات الحرارية\nحتى الأطعمة الصحية تحتوي على سعرات. تتبع ما تأكله لتفهم استهلاكك الفعلي.\n\n## ٥. تناول الطعام بسرعة\nالأكل ببطء يمنح دماغك الوقت الكافي لإرسال إشارات الشبع.\n\n## ٦. إهمال البروتين\nالبروتين يزيد الشعور بالشبع ويساعد في بناء العضلات وحرق الدهون.\n\n## ٧. الحرمان الشديد\nالحميات القاسية تؤدي لنتائج عكسية. التوازن هو المفتاح.\n\n## ٨. عدم تحضير الوجبات مسبقاً\nالتحضير المسبق يمنعك من اللجوء للوجبات السريعة.\n\n## ٩. تجاهل حجم الحصص\nحتى الأطعمة الصحية يجب تناولها بكميات مناسبة.\n\n## ١٠. عدم النوم الكافي\nقلة النوم تزيد هرمون الجوع وتقلل هرمون الشبع.\n\n---\n\n**الخلاصة:** التغذية السليمة ليست عن الحرمان بل عن الاختيارات الذكية. ابدأ بتصحيح هذه الأخطاء وستلاحظ الفرق خلال أسابيع.`,
      en: `Are you putting in effort with your diet but not seeing the results you want? You might be making one of these common mistakes.\n\n## 1. Skipping Breakfast\nMany believe skipping breakfast helps with weight loss, but the opposite is true. Skipping breakfast slows your metabolism and increases the likelihood of overeating later.\n\n## 2. Not Drinking Enough Water\nWater is essential for metabolism and fat burning. Drink at least 8 glasses daily.\n\n## 3. Relying on "Low-Fat" Foods\nMany "low-fat" foods contain added sugar to compensate for flavor.\n\n## 4. Not Counting Calories\nEven healthy foods contain calories. Track what you eat to understand your actual consumption.\n\n## 5. Eating Too Fast\nEating slowly gives your brain enough time to send satiety signals.\n\n## 6. Neglecting Protein\nProtein increases feelings of fullness and helps build muscle and burn fat.\n\n## 7. Extreme Deprivation\nCrash diets lead to opposite results. Balance is key.\n\n## 8. Not Meal Prepping\nPreparing meals in advance prevents you from resorting to fast food.\n\n## 9. Ignoring Portion Sizes\nEven healthy foods should be eaten in appropriate amounts.\n\n## 10. Not Getting Enough Sleep\nLack of sleep increases hunger hormones and decreases satiety hormones.\n\n---\n\n**Conclusion:** Proper nutrition isn't about deprivation — it's about smart choices. Start correcting these mistakes and you'll notice the difference within weeks.`,
    },
  },
  {
    id: '2',
    title: { ar: 'أفضل ٥ تمارين لحرق الدهون في المنزل', en: 'Top 5 Fat-Burning Home Exercises' },
    excerpt: { ar: 'تمارين فعالة يمكنك ممارستها في المنزل بدون معدات لحرق الدهون وبناء اللياقة البدنية.', en: 'Effective exercises you can do at home without equipment to burn fat and build fitness.' },
    category: 'workout', readTime: { ar: '٧ دقائق', en: '7 min read' }, date: '2024-03-12',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop', featured: true,
    content: {
      ar: `لا تحتاج للذهاب للجيم لحرق الدهون. إليك ٥ تمارين فعالة يمكنك ممارستها في المنزل.\n\n## ١. تمرين Burpees\nمن أفضل التمارين لحرق السعرات. يعمل على كامل الجسم ويرفع معدل ضربات القلب بسرعة. ابدأ بـ ٣ مجموعات، كل مجموعة ١٠ تكرارات.\n\n## ٢. تمرين القرفصاء القفزي (Jump Squats)\nيستهدف الأرجل والمؤخرة ويحرق سعرات عالية. ٤ مجموعات × ١٥ تكرار.\n\n## ٣. تمرين المتسلق (Mountain Climbers)\nتمرين ممتاز للكور وحرق الدهون. ٣ مجموعات × ٣٠ ثانية.\n\n## ٤. تمرين البلانك المتحرك\nيقوي عضلات البطن والذراعين. ٣ مجموعات × ٤٥ ثانية.\n\n## ٥. تمرين الضغط (Push-ups)\nيبني عضلات الصدر والكتف والذراع. ٤ مجموعات × ١٢ تكرار.\n\n---\n\n**نصيحة:** مارس هذه التمارين ٣-٤ مرات أسبوعياً مع فترات راحة قصيرة بين المجموعات للحصول على أفضل النتائج.`,
      en: `You don't need a gym to burn fat. Here are 5 effective exercises you can do at home.\n\n## 1. Burpees\nOne of the best calorie-burning exercises. Works the entire body and raises heart rate quickly. Start with 3 sets of 10 reps.\n\n## 2. Jump Squats\nTargets legs and glutes while burning high calories. 4 sets × 15 reps.\n\n## 3. Mountain Climbers\nExcellent for core and fat burning. 3 sets × 30 seconds.\n\n## 4. Moving Plank\nStrengthens abs and arms. 3 sets × 45 seconds.\n\n## 5. Push-ups\nBuilds chest, shoulder, and arm muscles. 4 sets × 12 reps.\n\n---\n\n**Tip:** Practice these exercises 3-4 times weekly with short rest periods between sets for best results.`,
    },
  },
  {
    id: '3',
    title: { ar: 'كيف تبني عادات صحية تدوم مدى الحياة', en: 'How to Build Healthy Habits That Last a Lifetime' },
    excerpt: { ar: 'دليل عملي لبناء عادات صحية مستدامة تصبح جزءاً من حياتك اليومية بدون مجهود.', en: 'A practical guide to building sustainable healthy habits that become part of your daily life effortlessly.' },
    category: 'lifestyle', readTime: { ar: '٦ دقائق', en: '6 min read' }, date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=500&fit=crop', featured: true,
    content: {
      ar: `بناء عادات صحية مستدامة هو المفتاح الحقيقي للتغيير الدائم. إليك كيف تفعل ذلك.\n\n## ابدأ صغيراً\nلا تحاول تغيير كل شيء دفعة واحدة. ابدأ بعادة واحدة صغيرة وطوّرها تدريجياً.\n\n## اربط العادة الجديدة بعادة موجودة\nمثال: "بعد أن أشرب قهوتي الصباحية، سأمشي ١٠ دقائق."\n\n## تتبع تقدمك\nاستخدم تطبيقاً أو دفتراً لتسجيل التزامك اليومي. رؤية التقدم تحفزك على الاستمرار.\n\n## لا تسعَ للكمال\nالهدف هو الاستمرارية وليس الكمال. إذا فاتك يوم، عُد في اليوم التالي بدون لوم.\n\n## كافئ نفسك\nضع مكافآت صغيرة عند تحقيق أهداف معينة لتعزيز الدافع.\n\n---\n\n**تذكر:** العادات تستغرق في المتوسط ٦٦ يوماً لتصبح تلقائية. كن صبوراً مع نفسك.`,
      en: `Building sustainable healthy habits is the real key to lasting change. Here's how to do it.\n\n## Start Small\nDon't try to change everything at once. Start with one small habit and develop it gradually.\n\n## Link New Habits to Existing Ones\nExample: "After I drink my morning coffee, I'll walk for 10 minutes."\n\n## Track Your Progress\nUse an app or notebook to record your daily commitment. Seeing progress motivates you to continue.\n\n## Don't Aim for Perfection\nThe goal is consistency, not perfection. If you miss a day, come back the next day without guilt.\n\n## Reward Yourself\nSet small rewards when you achieve certain goals to boost motivation.\n\n---\n\n**Remember:** Habits take an average of 66 days to become automatic. Be patient with yourself.`,
    },
  },
  {
    id: '4',
    title: { ar: 'البروتين: كم تحتاج يومياً لبناء العضلات؟', en: 'Protein: How Much Do You Need Daily to Build Muscle?' },
    excerpt: { ar: 'حساب احتياجك اليومي من البروتين بناءً على وزنك وأهدافك الرياضية.', en: 'Calculate your daily protein needs based on your weight and fitness goals.' },
    category: 'nutrition', readTime: { ar: '٤ دقائق', en: '4 min read' }, date: '2024-03-08',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=500&fit=crop',
    content: {
      ar: `البروتين هو اللبنة الأساسية لبناء العضلات. لكن كم تحتاج فعلاً؟ دعنا نوضح الأمر بالأرقام.\n\n## لماذا البروتين مهم؟\nالبروتين يساعد في إصلاح الألياف العضلية بعد التمرين وبناء أنسجة عضلية جديدة. بدون كمية كافية من البروتين، لن تحقق نتائج ملموسة مهما كانت شدة تمارينك.\n\n## كم تحتاج يومياً؟\nالقاعدة العامة هي ١.٦ - ٢.٢ غرام لكل كيلوغرام من وزن الجسم يومياً. مثال: إذا كان وزنك ٧٠ كجم، تحتاج بين ١١٢ - ١٥٤ غرام بروتين يومياً.\n\n## أفضل مصادر البروتين\n• صدور الدجاج: ٣١ غرام لكل ١٠٠ غرام\n• البيض: ٦ غرام لكل بيضة\n• السمك (التونا): ٢٦ غرام لكل ١٠٠ غرام\n• اللحم البقري: ٢٦ غرام لكل ١٠٠ غرام\n• الزبادي اليوناني: ١٠ غرام لكل ١٠٠ غرام\n\n## توزيع البروتين على الوجبات\nلا تأكل كل البروتين في وجبة واحدة. وزّعه على ٤-٥ وجبات للاستفادة القصوى.\n\n---\n\n**النصيحة:** ابدأ بحساب احتياجك اليومي، ثم خطط وجباتك لتغطية هذا الاحتياج من مصادر متنوعة.`,
      en: `Protein is the fundamental building block for muscle growth. But how much do you really need?\n\n## Why Is Protein Important?\nProtein helps repair muscle fibers after exercise and build new muscle tissue. Without adequate protein, you won't see meaningful results no matter how intense your workouts are.\n\n## How Much Do You Need Daily?\nThe general rule is 1.6 - 2.2 grams per kilogram of body weight daily. Example: if you weigh 70 kg, you need between 112 - 154 grams of protein daily.\n\n## Best Protein Sources\n• Chicken breast: 31g per 100g\n• Eggs: 6g per egg\n• Fish (tuna): 26g per 100g\n• Beef: 26g per 100g\n• Greek yogurt: 10g per 100g\n\n## Distributing Protein Across Meals\nDon't eat all your protein in one meal. Spread it across 4-5 meals for maximum benefit.\n\n---\n\n**Tip:** Start by calculating your daily requirement, then plan your meals to cover it from diverse sources.`,
    },
  },
  {
    id: '5',
    title: { ar: 'روتين التمارين المثالي للمبتدئين', en: 'The Perfect Workout Routine for Beginners' },
    excerpt: { ar: 'خطة تمارين أسبوعية مصممة خصيصاً للمبتدئين لبناء أساس قوي.', en: 'A weekly workout plan designed specifically for beginners to build a strong foundation.' },
    category: 'workout', readTime: { ar: '٨ دقائق', en: '8 min read' }, date: '2024-03-05',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
    content: {
      ar: `إذا كنت مبتدئاً في عالم التمارين، فإن وجود خطة واضحة هو أهم خطوة. إليك روتين أسبوعي مصمم خصيصاً لك.\n\n## المبادئ الأساسية للمبتدئين\n• ابدأ بأوزان خفيفة وركز على الأداء الصحيح\n• تمرن ٣ أيام في الأسبوع مع يوم راحة بين كل تمرين\n• كل جلسة تمرين لا تتجاوز ٤٥-٦٠ دقيقة\n\n## اليوم الأول: الجزء العلوي\n• ضغط الصدر بالدمبلز: ٣ × ١٢\n• سحب الكابل للظهر: ٣ × ١٢\n• رفع الأكتاف الجانبي: ٣ × ١٥\n\n## اليوم الثاني: الجزء السفلي\n• القرفصاء بوزن الجسم: ٣ × ١٥\n• الرفعة الميتة الرومانية: ٣ × ١٢\n• رفع السمانة: ٣ × ٢٠\n\n## اليوم الثالث: كامل الجسم\n• ضغط الصدر: ٣ × ١٢\n• القرفصاء: ٣ × ١٢\n• البلانك: ٣ × ٣٠ ثانية\n\n---\n\n**تذكر:** الثبات أهم من الشدة. التزم بالروتين لمدة ٨ أسابيع وستلاحظ تحسناً كبيراً.`,
      en: `If you're a beginner in the world of exercise, having a clear plan is the most important step.\n\n## Basic Principles for Beginners\n• Start with light weights and focus on proper form\n• Train 3 days per week with a rest day between each workout\n• Each session should not exceed 45-60 minutes\n\n## Day 1: Upper Body\n• Dumbbell chest press: 3 × 12\n• Cable row for back: 3 × 12\n• Lateral shoulder raises: 3 × 15\n\n## Day 2: Lower Body\n• Bodyweight squats: 3 × 15\n• Romanian deadlift: 3 × 12\n• Calf raises: 3 × 20\n\n## Day 3: Full Body\n• Chest press: 3 × 12\n• Squats: 3 × 12\n• Plank: 3 × 30 seconds\n\n---\n\n**Remember:** Consistency is more important than intensity. Stick to the routine for 8 weeks and you'll see significant improvement.`,
    },
  },
  {
    id: '6',
    title: { ar: 'أهمية النوم في رحلة اللياقة البدنية', en: 'The Importance of Sleep in Your Fitness Journey' },
    excerpt: { ar: 'لماذا النوم الجيد أساسي للتعافي وبناء العضلات وخسارة الدهون.', en: 'Why good sleep is essential for recovery, muscle building, and fat loss.' },
    category: 'lifestyle', readTime: { ar: '٥ دقائق', en: '5 min read' }, date: '2024-03-02',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=500&fit=crop',
    content: {
      ar: `النوم ليس رفاهية — إنه جزء أساسي من برنامج اللياقة. إليك كيف يؤثر النوم على نتائجك.\n\n## النوم والتعافي العضلي\nأثناء النوم العميق يفرز الجسم هرمون النمو الذي يلعب دوراً رئيسياً في إصلاح وبناء العضلات.\n\n## النوم وحرق الدهون\nقلة النوم تزيد هرمون الكورتيزول الذي يشجع تخزين الدهون. كما أنها تزيد هرمون الجوع وتقلل هرمون الشبع.\n\n## كم ساعة نوم تحتاج؟\n• للبالغين: ٧-٩ ساعات يومياً\n• للرياضيين: ٨-١٠ ساعات يومياً\n\n## نصائح لنوم أفضل\n• حافظ على موعد نوم ثابت\n• توقف عن استخدام الشاشات قبل النوم بساعة\n• اجعل غرفة النوم مظلمة وباردة\n• تجنب الكافيين بعد الساعة ٤ مساءً\n\n---\n\n**الخلاصة:** إذا كنت تتمرن بجد وتأكل بشكل صحي لكن لا ترى نتائج، راجع عادات نومك.`,
      en: `Sleep isn't a luxury — it's a fundamental part of your fitness program.\n\n## Sleep and Muscle Recovery\nDuring deep sleep, the body releases Growth Hormone, which plays a key role in repairing and building muscle.\n\n## Sleep and Fat Burning\nLack of sleep increases cortisol, which encourages fat storage. It also increases ghrelin (hunger hormone) and decreases leptin (satiety hormone).\n\n## How Many Hours of Sleep Do You Need?\n• For adults: 7-9 hours daily\n• For athletes: 8-10 hours daily\n\n## Tips for Better Sleep\n• Maintain a consistent sleep schedule\n• Stop using screens one hour before bed\n• Keep your bedroom dark and cool\n• Avoid caffeine after 4 PM\n\n---\n\n**Conclusion:** If you're training hard and eating well but not seeing results, review your sleep habits.`,
    },
  },
  {
    id: '7',
    title: { ar: 'وجبات صحية سريعة التحضير للمشغولين', en: 'Quick Healthy Meals for Busy People' },
    excerpt: { ar: '١٠ وصفات صحية يمكن تحضيرها في أقل من ١٥ دقيقة للأشخاص المشغولين.', en: '10 healthy recipes you can prepare in under 15 minutes for busy people.' },
    category: 'nutrition', readTime: { ar: '٦ دقائق', en: '6 min read' }, date: '2024-02-28',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=500&fit=crop',
    content: {
      ar: `ضيق الوقت ليس عذراً لتناول الوجبات السريعة. إليك ١٠ وصفات صحية تحضّرها في أقل من ١٥ دقيقة.\n\n## ١. بول الدجاج والأرز\nاطبخ أرز بني مسبقاً وأضف صدور دجاج مشوية مقطعة مع خضار سوتيه. وقت التحضير: ١٠ دقائق.\n\n## ٢. سلطة التونا بالأفوكادو\nاخلط التونا المعلبة مع الأفوكادو المهروس والطماطم والخيار. وقت التحضير: ٥ دقائق.\n\n## ٣. عجة البيض بالخضار\n٣ بيضات مع سبانخ وفلفل وبصل. وقت التحضير: ٨ دقائق.\n\n## ٤. شوفان بالموز والمكسرات\nشوفان مطبوخ مع حليب + موز مقطع + ملعقة عسل + مكسرات. وقت التحضير: ٥ دقائق.\n\n## ٥. سموذي البروتين\nموز + حليب + مسحوق بروتين + زبدة فول سوداني. وقت التحضير: ٣ دقائق.\n\n---\n\n**نصيحة:** حضّر المكونات يوم الأحد لتكون جاهزة طوال الأسبوع.`,
      en: `Being busy is no excuse for eating junk food. Here are 10 healthy recipes you can prepare in under 15 minutes.\n\n## 1. Chicken & Rice Bowl\nPre-cook brown rice, add sliced grilled chicken breast with sautéed vegetables. Prep time: 10 minutes.\n\n## 2. Tuna Avocado Salad\nMix canned tuna with mashed avocado, tomatoes, and cucumber. Prep time: 5 minutes.\n\n## 3. Veggie Omelette\n3 eggs with spinach, bell pepper, and onion. Prep time: 8 minutes.\n\n## 4. Oatmeal with Banana & Nuts\nCooked oats with milk + sliced banana + honey + nuts. Prep time: 5 minutes.\n\n## 5. Protein Smoothie\nBanana + milk + protein powder + peanut butter. Prep time: 3 minutes.\n\n---\n\n**Tip:** Prep your ingredients on Sunday so they're ready all week.`,
    },
  },
  {
    id: '8',
    title: { ar: 'كيف تتغلب على ثبات الوزن', en: 'How to Overcome a Weight Loss Plateau' },
    excerpt: { ar: 'استراتيجيات فعالة لكسر حاجز ثبات الوزن والاستمرار في التقدم.', en: 'Effective strategies to break through weight loss plateaus and keep progressing.' },
    category: 'nutrition', readTime: { ar: '٧ دقائق', en: '7 min read' }, date: '2024-02-25',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=500&fit=crop',
    content: {
      ar: `وصلت لمرحلة ثبات الوزن؟ لا تقلق — هذا طبيعي ويمكن التغلب عليه.\n\n## لماذا يحدث ثبات الوزن؟\nعندما تفقد وزناً، ينخفض معدل الأيض لأن جسمك أصبح أصغر ويحتاج سعرات أقل.\n\n## ١. أعد حساب سعراتك\nكل ٥ كيلو تفقدها، أعد حساب احتياجك من السعرات.\n\n## ٢. غيّر نوع التمارين\nإذا كنت تمارس الكارديو فقط، أضف تمارين المقاومة.\n\n## ٣. جرّب الصيام المتقطع\nنمط ١٦:٨ يساعد كثيراً في كسر ثبات الوزن.\n\n## ٤. زد البروتين\nالبروتين يرفع معدل الأيض ويحافظ على الكتلة العضلية.\n\n## ٥. نم أكثر\nالنوم الجيد يحسن الهرمونات المسؤولة عن الجوع والأيض.\n\n---\n\n**الخلاصة:** ثبات الوزن مرحلة مؤقتة وليست نهاية الطريق.`,
      en: `Hit a weight loss plateau? Don't worry — this is normal and can be overcome.\n\n## Why Do Plateaus Happen?\nWhen you lose weight, your metabolic rate drops because your body is smaller and needs fewer calories.\n\n## 1. Recalculate Your Calories\nEvery 5 kg you lose, recalculate your calorie needs.\n\n## 2. Change Your Exercise Type\nIf you're only doing cardio, add resistance training.\n\n## 3. Try Intermittent Fasting\nThe 16:8 pattern helps greatly in breaking through plateaus.\n\n## 4. Increase Protein\nProtein boosts metabolic rate and preserves muscle mass.\n\n## 5. Sleep More\nGood sleep improves hormones responsible for hunger and metabolism.\n\n---\n\n**Conclusion:** A weight plateau is a temporary phase, not the end of the road.`,
    },
  },
  {
    id: '9',
    title: { ar: 'تمارين الإطالة: لماذا هي مهمة؟', en: 'Stretching Exercises: Why Are They Important?' },
    excerpt: { ar: 'فوائد تمارين الإطالة للتعافي وتجنب الإصابات وتحسين المرونة.', en: 'Benefits of stretching for recovery, injury prevention, and improved flexibility.' },
    category: 'workout', readTime: { ar: '٤ دقائق', en: '4 min read' }, date: '2024-02-22',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
    content: {
      ar: `كثير من الناس يهملون تمارين الإطالة، لكنها من أهم عناصر اللياقة البدنية.\n\n## فوائد تمارين الإطالة\n• تحسين المرونة ومدى الحركة\n• تقليل خطر الإصابات\n• تحسين الدورة الدموية\n• تخفيف التوتر والآلام العضلية\n\n## متى تمارس الإطالة؟\n• قبل التمرين: إطالة ديناميكية لتحضير العضلات\n• بعد التمرين: إطالة ثابتة لتسريع التعافي\n\n## تمارين إطالة أساسية\n• إطالة عضلات الفخذ: قف على قدم واحدة واسحب القدم الأخرى للخلف. ثبّت ٢٠-٣٠ ثانية.\n• إطالة أوتار الركبة: اجلس ومد ساقيك. حاول لمس أصابع قدميك.\n• إطالة عضلات الظهر: استلقِ على ظهرك واسحب ركبتيك نحو صدرك.\n\n---\n\n**النصيحة:** خصص ١٠ دقائق يومياً للإطالة. ستلاحظ تحسناً في أدائك خلال أسبوعين.`,
      en: `Many people neglect stretching, but it's one of the most important elements of fitness.\n\n## Benefits of Stretching\n• Improved flexibility and range of motion\n• Reduced injury risk\n• Better blood circulation\n• Relief from tension and muscle soreness\n\n## When to Stretch?\n• Before exercise: Dynamic stretching to prepare muscles\n• After exercise: Static stretching to speed recovery\n\n## Essential Stretching Exercises\n• Quad Stretch: Stand on one foot and pull the other foot behind you. Hold 20-30 seconds.\n• Hamstring Stretch: Sit with legs extended. Try to touch your toes.\n• Back Stretch: Lie on your back and pull your knees toward your chest.\n\n---\n\n**Tip:** Dedicate 10 minutes daily to stretching. You'll notice improved performance within two weeks.`,
    },
  },
]

async function getBlogs() {
  try {
    const data = await kv.get(KV_KEY)
    if (!data) {
      // Seed on first load
      await kv.set(KV_KEY, JSON.stringify(SEED_POSTS))
      return SEED_POSTS
    }
    return typeof data === 'string' ? JSON.parse(data) : data
  } catch {
    return SEED_POSTS
  }
}

export async function GET() {
  const posts = await getBlogs()
  return NextResponse.json(posts)
}

export async function POST(request) {
  try {
    const post = await request.json()
    const posts = await getBlogs()

    if (post.id) {
      // Update existing
      const idx = posts.findIndex(p => p.id === post.id)
      if (idx >= 0) posts[idx] = post
      else posts.unshift(post)
    } else {
      // Create new — generate id
      post.id = Date.now().toString()
      posts.unshift(post)
    }

    await kv.set(KV_KEY, JSON.stringify(posts))
    return NextResponse.json({ ok: true, id: post.id })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const posts = await getBlogs()
    const filtered = posts.filter(p => p.id !== id)
    await kv.set(KV_KEY, JSON.stringify(filtered))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
