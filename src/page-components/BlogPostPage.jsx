'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const categories = {
  nutrition: { ar: 'التغذية', en: 'Nutrition' },
  workout: { ar: 'التمارين', en: 'Workout' },
  lifestyle: { ar: 'نمط الحياة', en: 'Lifestyle' },
}

const blogPosts = {
  1: {
    title: { ar: '١٠ أخطاء شائعة في التغذية تمنعك من خسارة الوزن', en: '10 Common Nutrition Mistakes Preventing Weight Loss' },
    category: 'nutrition',
    readTime: { ar: '٥ دقائق', en: '5 min read' },
    date: { ar: '١٥ مارس ٢٠٢٤', en: 'March 15, 2024' },
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop',
    content: {
      ar: `هل تبذل جهداً كبيراً في حميتك الغذائية ولكن لا ترى النتائج المرجوة؟ قد تكون ترتكب أحد هذه الأخطاء الشائعة التي تمنعك من تحقيق أهدافك.

## ١. تخطي وجبة الإفطار
يعتقد الكثيرون أن تخطي الإفطار يساعد في خسارة الوزن، لكن العكس صحيح. تخطي الإفطار يبطئ عملية الأيض ويزيد من احتمال الإفراط في الأكل لاحقاً.

## ٢. عدم شرب كمية كافية من الماء
الماء ضروري لعملية الأيض وحرق الدهون. اشرب على الأقل ٨ أكواب يومياً.

## ٣. الاعتماد على الأطعمة "قليلة الدهون"
كثير من الأطعمة المصنفة "قليلة الدهون" تحتوي على سكر مضاف لتعويض النكهة.

## ٤. عدم حساب السعرات الحرارية
حتى الأطعمة الصحية تحتوي على سعرات. تتبع ما تأكله لتفهم استهلاكك الفعلي.

## ٥. تناول الطعام بسرعة
الأكل ببطء يمنح دماغك الوقت الكافي لإرسال إشارات الشبع.

## ٦. إهمال البروتين
البروتين يزيد الشعور بالشبع ويساعد في بناء العضلات وحرق الدهون.

## ٧. الحرمان الشديد
الحميات القاسية تؤدي لنتائج عكسية. التوازن هو المفتاح.

## ٨. عدم تحضير الوجبات مسبقاً
التحضير المسبق يمنعك من اللجوء للوجبات السريعة.

## ٩. تجاهل حجم الحصص
حتى الأطعمة الصحية يجب تناولها بكميات مناسبة.

## ١٠. عدم النوم الكافي
قلة النوم تزيد هرمون الجوع وتقلل هرمون الشبع.

---

**الخلاصة:** التغذية السليمة ليست عن الحرمان بل عن الاختيارات الذكية. ابدأ بتصحيح هذه الأخطاء وستلاحظ الفرق خلال أسابيع.`,
      en: `Are you putting in effort with your diet but not seeing the results you want? You might be making one of these common mistakes that are preventing you from reaching your goals.

## 1. Skipping Breakfast
Many believe skipping breakfast helps with weight loss, but the opposite is true. Skipping breakfast slows your metabolism and increases the likelihood of overeating later.

## 2. Not Drinking Enough Water
Water is essential for metabolism and fat burning. Drink at least 8 glasses daily.

## 3. Relying on "Low-Fat" Foods
Many "low-fat" foods contain added sugar to compensate for flavor.

## 4. Not Counting Calories
Even healthy foods contain calories. Track what you eat to understand your actual consumption.

## 5. Eating Too Fast
Eating slowly gives your brain enough time to send satiety signals.

## 6. Neglecting Protein
Protein increases feelings of fullness and helps build muscle and burn fat.

## 7. Extreme Deprivation
Crash diets lead to opposite results. Balance is key.

## 8. Not Meal Prepping
Preparing meals in advance prevents you from resorting to fast food.

## 9. Ignoring Portion Sizes
Even healthy foods should be eaten in appropriate amounts.

## 10. Not Getting Enough Sleep
Lack of sleep increases hunger hormones and decreases satiety hormones.

---

**Conclusion:** Proper nutrition isn't about deprivation — it's about smart choices. Start correcting these mistakes and you'll notice the difference within weeks.`,
    },
  },
  2: {
    title: { ar: 'أفضل ٥ تمارين لحرق الدهون في المنزل', en: 'Top 5 Fat-Burning Home Exercises' },
    category: 'workout',
    readTime: { ar: '٧ دقائق', en: '7 min read' },
    date: { ar: '١٢ مارس ٢٠٢٤', en: 'March 12, 2024' },
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop',
    content: {
      ar: `لا تحتاج للذهاب للجيم لحرق الدهون. إليك ٥ تمارين فعالة يمكنك ممارستها في المنزل.

## ١. تمرين Burpees
من أفضل التمارين لحرق السعرات. يعمل على كامل الجسم ويرفع معدل ضربات القلب بسرعة. ابدأ بـ ٣ مجموعات، كل مجموعة ١٠ تكرارات.

## ٢. تمرين القرفصاء القفزي (Jump Squats)
يستهدف الأرجل والمؤخرة ويحرق سعرات عالية. ٤ مجموعات × ١٥ تكرار.

## ٣. تمرين المتسلق (Mountain Climbers)
تمرين ممتاز للكور وحرق الدهون. ٣ مجموعات × ٣٠ ثانية.

## ٤. تمرين البلانك المتحرك
يقوي عضلات البطن والذراعين. ٣ مجموعات × ٤٥ ثانية.

## ٥. تمرين الضغط (Push-ups)
يبني عضلات الصدر والكتف والذراع. ٤ مجموعات × ١٢ تكرار.

---

**نصيحة:** مارس هذه التمارين ٣-٤ مرات أسبوعياً مع فترات راحة قصيرة بين المجموعات للحصول على أفضل النتائج.`,
      en: `You don't need a gym to burn fat. Here are 5 effective exercises you can do at home.

## 1. Burpees
One of the best calorie-burning exercises. Works the entire body and raises heart rate quickly. Start with 3 sets of 10 reps.

## 2. Jump Squats
Targets legs and glutes while burning high calories. 4 sets × 15 reps.

## 3. Mountain Climbers
Excellent for core and fat burning. 3 sets × 30 seconds.

## 4. Moving Plank
Strengthens abs and arms. 3 sets × 45 seconds.

## 5. Push-ups
Builds chest, shoulder, and arm muscles. 4 sets × 12 reps.

---

**Tip:** Practice these exercises 3-4 times weekly with short rest periods between sets for best results.`,
    },
  },
  3: {
    title: { ar: 'كيف تبني عادات صحية تدوم مدى الحياة', en: 'How to Build Healthy Habits That Last a Lifetime' },
    category: 'lifestyle',
    readTime: { ar: '٦ دقائق', en: '6 min read' },
    date: { ar: '١٠ مارس ٢٠٢٤', en: 'March 10, 2024' },
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=500&fit=crop',
    content: {
      ar: `بناء عادات صحية مستدامة هو المفتاح الحقيقي للتغيير الدائم. إليك كيف تفعل ذلك.

## ابدأ صغيراً
لا تحاول تغيير كل شيء دفعة واحدة. ابدأ بعادة واحدة صغيرة وطوّرها تدريجياً.

## اربط العادة الجديدة بعادة موجودة
مثال: "بعد أن أشرب قهوتي الصباحية، سأمشي ١٠ دقائق."

## تتبع تقدمك
استخدم تطبيقاً أو دفتراً لتسجيل التزامك اليومي. رؤية التقدم تحفزك على الاستمرار.

## لا تسعَ للكمال
الهدف هو الاستمرارية وليس الكمال. إذا فاتك يوم، عُد في اليوم التالي بدون لوم.

## كافئ نفسك
ضع مكافآت صغيرة عند تحقيق أهداف معينة لتعزيز الدافع.

---

**تذكر:** العادات تستغرق في المتوسط ٦٦ يوماً لتصبح تلقائية. كن صبوراً مع نفسك.`,
      en: `Building sustainable healthy habits is the real key to lasting change. Here's how to do it.

## Start Small
Don't try to change everything at once. Start with one small habit and develop it gradually.

## Link New Habits to Existing Ones
Example: "After I drink my morning coffee, I'll walk for 10 minutes."

## Track Your Progress
Use an app or notebook to record your daily commitment. Seeing progress motivates you to continue.

## Don't Aim for Perfection
The goal is consistency, not perfection. If you miss a day, come back the next day without guilt.

## Reward Yourself
Set small rewards when you achieve certain goals to boost motivation.

---

**Remember:** Habits take an average of 66 days to become automatic. Be patient with yourself.`,
    },
  },
  4: {
    title: { ar: 'البروتين: كم تحتاج يومياً لبناء العضلات؟', en: 'Protein: How Much Do You Need Daily to Build Muscle?' },
    category: 'nutrition',
    readTime: { ar: '٤ دقائق', en: '4 min read' },
    date: { ar: '٨ مارس ٢٠٢٤', en: 'March 8, 2024' },
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=500&fit=crop',
    content: {
      ar: `البروتين هو اللبنة الأساسية لبناء العضلات. لكن كم تحتاج فعلاً؟ دعنا نوضح الأمر بالأرقام.

## لماذا البروتين مهم؟
البروتين يساعد في إصلاح الألياف العضلية بعد التمرين وبناء أنسجة عضلية جديدة. بدون كمية كافية من البروتين، لن تحقق نتائج ملموسة مهما كانت شدة تمارينك.

## كم تحتاج يومياً؟
القاعدة العامة هي ١.٦ - ٢.٢ غرام لكل كيلوغرام من وزن الجسم يومياً. مثال: إذا كان وزنك ٧٠ كجم، تحتاج بين ١١٢ - ١٥٤ غرام بروتين يومياً.

## أفضل مصادر البروتين
• صدور الدجاج: ٣١ غرام لكل ١٠٠ غرام
• البيض: ٦ غرام لكل بيضة
• السمك (التونا): ٢٦ غرام لكل ١٠٠ غرام
• اللحم البقري: ٢٦ غرام لكل ١٠٠ غرام
• الزبادي اليوناني: ١٠ غرام لكل ١٠٠ غرام
• العدس: ٩ غرام لكل ١٠٠ غرام

## توزيع البروتين على الوجبات
لا تأكل كل البروتين في وجبة واحدة. وزّعه على ٤-٥ وجبات للاستفادة القصوى. ٣٠-٤٠ غرام لكل وجبة هو المثالي.

## هل تحتاج مكملات البروتين؟
إذا كنت تستطيع تلبية احتياجك من الطعام الطبيعي، فلا حاجة للمكملات. لكن مسحوق البروتين (الواي بروتين) خيار عملي بعد التمرين.

---

**النصيحة:** ابدأ بحساب احتياجك اليومي، ثم خطط وجباتك لتغطية هذا الاحتياج من مصادر متنوعة.`,
      en: `Protein is the fundamental building block for muscle growth. But how much do you really need? Let's break it down with numbers.

## Why Is Protein Important?
Protein helps repair muscle fibers after exercise and build new muscle tissue. Without adequate protein, you won't see meaningful results no matter how intense your workouts are.

## How Much Do You Need Daily?
The general rule is 1.6 - 2.2 grams per kilogram of body weight daily. Example: if you weigh 70 kg, you need between 112 - 154 grams of protein daily.

## Best Protein Sources
• Chicken breast: 31g per 100g
• Eggs: 6g per egg
• Fish (tuna): 26g per 100g
• Beef: 26g per 100g
• Greek yogurt: 10g per 100g
• Lentils: 9g per 100g

## Distributing Protein Across Meals
Don't eat all your protein in one meal. Spread it across 4-5 meals for maximum benefit. 30-40 grams per meal is ideal.

## Do You Need Protein Supplements?
If you can meet your needs from whole foods, supplements aren't necessary. But whey protein powder is a practical post-workout option.

---

**Tip:** Start by calculating your daily requirement, then plan your meals to cover it from diverse sources.`,
    },
  },
  5: {
    title: { ar: 'روتين التمارين المثالي للمبتدئين', en: 'The Perfect Workout Routine for Beginners' },
    category: 'workout',
    readTime: { ar: '٨ دقائق', en: '8 min read' },
    date: { ar: '٥ مارس ٢٠٢٤', en: 'March 5, 2024' },
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
    content: {
      ar: `إذا كنت مبتدئاً في عالم التمارين، فإن وجود خطة واضحة هو أهم خطوة. إليك روتين أسبوعي مصمم خصيصاً لك.

## المبادئ الأساسية للمبتدئين
• ابدأ بأوزان خفيفة وركز على الأداء الصحيح
• تمرن ٣ أيام في الأسبوع مع يوم راحة بين كل تمرين
• كل جلسة تمرين لا تتجاوز ٤٥-٦٠ دقيقة
• الإحماء ٥-١٠ دقائق ضروري قبل كل تمرين

## اليوم الأول: الجزء العلوي
• ضغط الصدر بالدمبلز: ٣ × ١٢
• سحب الكابل للظهر: ٣ × ١٢
• رفع الأكتاف الجانبي: ٣ × ١٥
• تمرين البايسبس: ٣ × ١٢
• تمرين الترايسبس: ٣ × ١٢

## اليوم الثاني: الجزء السفلي
• القرفصاء بوزن الجسم: ٣ × ١٥
• الرفعة الميتة الرومانية: ٣ × ١٢
• تمديد الساق: ٣ × ١٥
• ثني الساق: ٣ × ١٥
• رفع السمانة: ٣ × ٢٠

## اليوم الثالث: كامل الجسم
• ضغط الصدر: ٣ × ١٢
• القرفصاء: ٣ × ١٢
• سحب للظهر: ٣ × ١٢
• البلانك: ٣ × ٣٠ ثانية
• الكرنشز: ٣ × ١٥

## نصائح مهمة
• زد الأوزان تدريجياً كل أسبوعين
• اشرب الماء بكثرة أثناء التمرين
• لا تهمل تمارين الإطالة بعد التمرين

---

**تذكر:** الثبات أهم من الشدة. التزم بالروتين لمدة ٨ أسابيع وستلاحظ تحسناً كبيراً.`,
      en: `If you're a beginner in the world of exercise, having a clear plan is the most important step. Here's a weekly routine designed specifically for you.

## Basic Principles for Beginners
• Start with light weights and focus on proper form
• Train 3 days per week with a rest day between each workout
• Each session should not exceed 45-60 minutes
• 5-10 minute warm-up is essential before every workout

## Day 1: Upper Body
• Dumbbell chest press: 3 × 12
• Cable row for back: 3 × 12
• Lateral shoulder raises: 3 × 15
• Bicep curls: 3 × 12
• Tricep extensions: 3 × 12

## Day 2: Lower Body
• Bodyweight squats: 3 × 15
• Romanian deadlift: 3 × 12
• Leg extension: 3 × 15
• Leg curl: 3 × 15
• Calf raises: 3 × 20

## Day 3: Full Body
• Chest press: 3 × 12
• Squats: 3 × 12
• Back row: 3 × 12
• Plank: 3 × 30 seconds
• Crunches: 3 × 15

## Important Tips
• Increase weights gradually every two weeks
• Drink plenty of water during workouts
• Don't skip stretching after your workout

---

**Remember:** Consistency is more important than intensity. Stick to the routine for 8 weeks and you'll see significant improvement.`,
    },
  },
  6: {
    title: { ar: 'أهمية النوم في رحلة اللياقة البدنية', en: 'The Importance of Sleep in Your Fitness Journey' },
    category: 'lifestyle',
    readTime: { ar: '٥ دقائق', en: '5 min read' },
    date: { ar: '٢ مارس ٢٠٢٤', en: 'March 2, 2024' },
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=500&fit=crop',
    content: {
      ar: `النوم ليس رفاهية — إنه جزء أساسي من برنامج اللياقة. إليك كيف يؤثر النوم على نتائجك.

## النوم والتعافي العضلي
أثناء النوم العميق يفرز الجسم هرمون النمو (Growth Hormone) الذي يلعب دوراً رئيسياً في إصلاح وبناء العضلات. بدون نوم كافٍ، تنخفض مستويات هذا الهرمون بشكل كبير.

## النوم وحرق الدهون
قلة النوم تزيد هرمون الكورتيزول (هرمون التوتر) الذي يشجع تخزين الدهون خاصة في منطقة البطن. كما أنها تزيد هرمون الجريلين (الجوع) وتقلل هرمون اللبتين (الشبع).

## كم ساعة نوم تحتاج؟
• للبالغين: ٧-٩ ساعات يومياً
• للرياضيين: ٨-١٠ ساعات يومياً
• الجودة مهمة بقدر الكمية

## نصائح لنوم أفضل
• حافظ على موعد نوم ثابت
• توقف عن استخدام الشاشات قبل النوم بساعة
• اجعل غرفة النوم مظلمة وباردة
• تجنب الكافيين بعد الساعة ٤ مساءً
• مارس تمارين الاسترخاء قبل النوم

## تأثير قلة النوم على الأداء
• انخفاض القوة بنسبة ١٠-٣٠٪
• بطء ردة الفعل
• زيادة خطر الإصابات
• صعوبة التركيز والتحفيز

---

**الخلاصة:** إذا كنت تتمرن بجد وتأكل بشكل صحي لكن لا ترى نتائج، راجع عادات نومك. النوم هو القطعة المفقودة من اللغز.`,
      en: `Sleep isn't a luxury — it's a fundamental part of your fitness program. Here's how sleep affects your results.

## Sleep and Muscle Recovery
During deep sleep, the body releases Growth Hormone, which plays a key role in repairing and building muscle. Without adequate sleep, levels of this hormone drop significantly.

## Sleep and Fat Burning
Lack of sleep increases cortisol (the stress hormone), which encourages fat storage, especially around the belly. It also increases ghrelin (hunger hormone) and decreases leptin (satiety hormone).

## How Many Hours of Sleep Do You Need?
• For adults: 7-9 hours daily
• For athletes: 8-10 hours daily
• Quality matters as much as quantity

## Tips for Better Sleep
• Maintain a consistent sleep schedule
• Stop using screens one hour before bed
• Keep your bedroom dark and cool
• Avoid caffeine after 4 PM
• Practice relaxation exercises before bed

## Effects of Sleep Deprivation on Performance
• Strength decreases by 10-30%
• Slower reaction time
• Increased injury risk
• Difficulty with focus and motivation

---

**Conclusion:** If you're training hard and eating well but not seeing results, review your sleep habits. Sleep is the missing piece of the puzzle.`,
    },
  },
  7: {
    title: { ar: 'وجبات صحية سريعة التحضير للمشغولين', en: 'Quick Healthy Meals for Busy People' },
    category: 'nutrition',
    readTime: { ar: '٦ دقائق', en: '6 min read' },
    date: { ar: '٢٨ فبراير ٢٠٢٤', en: 'February 28, 2024' },
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=500&fit=crop',
    content: {
      ar: `ضيق الوقت ليس عذراً لتناول الوجبات السريعة. إليك ١٠ وصفات صحية تحضّرها في أقل من ١٥ دقيقة.

## ١. بول الدجاج والأرز
اطبخ أرز بني مسبقاً وأضف صدور دجاج مشوية مقطعة مع خضار سوتيه. وقت التحضير: ١٠ دقائق.

## ٢. سلطة التونا بالأفوكادو
اخلط التونا المعلبة مع الأفوكادو المهروس والطماطم والخيار. وقت التحضير: ٥ دقائق.

## ٣. عجة البيض بالخضار
٣ بيضات مع سبانخ وفلفل وبصل. وقت التحضير: ٨ دقائق.

## ٤. شوفان بالموز والمكسرات
شوفان مطبوخ مع حليب + موز مقطع + ملعقة عسل + مكسرات. وقت التحضير: ٥ دقائق.

## ٥. راب الدجاج
خبز تورتيلا + دجاج مشوي + خس + صوص زبادي. وقت التحضير: ٧ دقائق.

## ٦. سموذي البروتين
موز + حليب + مسحوق بروتين + زبدة فول سوداني. وقت التحضير: ٣ دقائق.

## ٧. سلطة الكينوا
كينوا مطبوخة + حمص + خيار + طماطم + ليمون + زيت زيتون. وقت التحضير: ١٠ دقائق.

## ٨. توست الأفوكادو مع البيض
خبز محمص + أفوكادو مهروس + بيضة مسلوقة. وقت التحضير: ٨ دقائق.

## ٩. زبادي يوناني بالفواكه
زبادي يوناني + فواكه طازجة + جرانولا + عسل. وقت التحضير: ٣ دقائق.

## ١٠. معكرونة بالخضار السريعة
معكرونة قمح كامل + زيت زيتون + ثوم + خضار مشكلة. وقت التحضير: ١٢ دقيقة.

---

**نصيحة:** حضّر المكونات يوم الأحد لتكون جاهزة طوال الأسبوع. هذا يوفر وقتاً كبيراً.`,
      en: `Being busy is no excuse for eating junk food. Here are 10 healthy recipes you can prepare in under 15 minutes.

## 1. Chicken & Rice Bowl
Pre-cook brown rice, add sliced grilled chicken breast with sautéed vegetables. Prep time: 10 minutes.

## 2. Tuna Avocado Salad
Mix canned tuna with mashed avocado, tomatoes, and cucumber. Prep time: 5 minutes.

## 3. Veggie Omelette
3 eggs with spinach, bell pepper, and onion. Prep time: 8 minutes.

## 4. Oatmeal with Banana & Nuts
Cooked oats with milk + sliced banana + honey + nuts. Prep time: 5 minutes.

## 5. Chicken Wrap
Tortilla + grilled chicken + lettuce + yogurt sauce. Prep time: 7 minutes.

## 6. Protein Smoothie
Banana + milk + protein powder + peanut butter. Prep time: 3 minutes.

## 7. Quinoa Salad
Cooked quinoa + chickpeas + cucumber + tomato + lemon + olive oil. Prep time: 10 minutes.

## 8. Avocado Toast with Egg
Toasted bread + mashed avocado + boiled egg. Prep time: 8 minutes.

## 9. Greek Yogurt with Fruits
Greek yogurt + fresh fruits + granola + honey. Prep time: 3 minutes.

## 10. Quick Veggie Pasta
Whole wheat pasta + olive oil + garlic + mixed vegetables. Prep time: 12 minutes.

---

**Tip:** Prep your ingredients on Sunday so they're ready all week. This saves a lot of time.`,
    },
  },
  8: {
    title: { ar: 'كيف تتغلب على ثبات الوزن', en: 'How to Overcome a Weight Loss Plateau' },
    category: 'nutrition',
    readTime: { ar: '٧ دقائق', en: '7 min read' },
    date: { ar: '٢٥ فبراير ٢٠٢٤', en: 'February 25, 2024' },
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=500&fit=crop',
    content: {
      ar: `وصلت لمرحلة ثبات الوزن؟ لا تقلق — هذا طبيعي ويمكن التغلب عليه. إليك الاستراتيجيات الفعالة.

## لماذا يحدث ثبات الوزن؟
عندما تفقد وزناً، ينخفض معدل الأيض لأن جسمك أصبح أصغر ويحتاج سعرات أقل. الجسم يتكيف مع النظام الغذائي الجديد ويصبح أكثر كفاءة في استخدام الطاقة.

## ١. أعد حساب سعراتك
كل ٥ كيلو تفقدها، أعد حساب احتياجك من السعرات. جسمك الأصغر يحتاج سعرات أقل.

## ٢. غيّر نوع التمارين
إذا كنت تمارس الكارديو فقط، أضف تمارين المقاومة. إذا كنت تتمرن بنفس الروتين، غيّره.

## ٣. جرّب الصيام المتقطع
نمط ١٦:٨ (صيام ١٦ ساعة وأكل خلال ٨ ساعات) يساعد كثيراً في كسر ثبات الوزن.

## ٤. زد البروتين
البروتين يرفع معدل الأيض ويحافظ على الكتلة العضلية. زد حصتك اليومية بـ ٢٠-٣٠ غرام.

## ٥. راقب السعرات المخفية
المشروبات، الصلصات، والوجبات الخفيفة قد تضيف مئات السعرات بدون أن تشعر.

## ٦. نم أكثر
النوم الجيد يحسن الهرمونات المسؤولة عن الجوع والأيض.

## ٧. اشرب ماء أكثر
أحياناً الجسم يحتبس الماء ويخفي فقدان الدهون. زيادة شرب الماء تساعد في تقليل الاحتباس.

## ٨. خذ يوم ريفيد
مرة في الأسبوع، زد سعراتك بشكل مقصود (خاصة الكاربوهيدرات). هذا يعيد تنشيط الأيض.

---

**الخلاصة:** ثبات الوزن مرحلة مؤقتة وليست نهاية الطريق. جرب هذه الاستراتيجيات واحدة تلو الأخرى حتى تجد ما يناسبك.`,
      en: `Hit a weight loss plateau? Don't worry — this is normal and can be overcome. Here are effective strategies.

## Why Do Plateaus Happen?
When you lose weight, your metabolic rate drops because your body is smaller and needs fewer calories. Your body adapts to the new diet and becomes more efficient at using energy.

## 1. Recalculate Your Calories
Every 5 kg you lose, recalculate your calorie needs. Your smaller body needs fewer calories.

## 2. Change Your Exercise Type
If you're only doing cardio, add resistance training. If you've been doing the same routine, switch it up.

## 3. Try Intermittent Fasting
The 16:8 pattern (fasting 16 hours, eating within 8 hours) helps greatly in breaking through plateaus.

## 4. Increase Protein
Protein boosts metabolic rate and preserves muscle mass. Increase your daily intake by 20-30 grams.

## 5. Watch Hidden Calories
Drinks, sauces, and snacks can add hundreds of calories without you noticing.

## 6. Sleep More
Good sleep improves hormones responsible for hunger and metabolism.

## 7. Drink More Water
Sometimes your body retains water and masks fat loss. Increasing water intake helps reduce retention.

## 8. Take a Refeed Day
Once a week, intentionally increase your calories (especially carbs). This reactivates your metabolism.

---

**Conclusion:** A weight plateau is a temporary phase, not the end of the road. Try these strategies one by one until you find what works for you.`,
    },
  },
  9: {
    title: { ar: 'تمارين الإطالة: لماذا هي مهمة؟', en: 'Stretching Exercises: Why Are They Important?' },
    category: 'workout',
    readTime: { ar: '٤ دقائق', en: '4 min read' },
    date: { ar: '٢٢ فبراير ٢٠٢٤', en: 'February 22, 2024' },
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
    content: {
      ar: `كثير من الناس يهملون تمارين الإطالة، لكنها من أهم عناصر اللياقة البدنية. إليك لماذا يجب أن تجعلها جزءاً من روتينك.

## فوائد تمارين الإطالة
• تحسين المرونة ومدى الحركة
• تقليل خطر الإصابات
• تحسين الدورة الدموية
• تخفيف التوتر والآلام العضلية
• تحسين وضعية الجسم

## متى تمارس الإطالة؟
• قبل التمرين: إطالة ديناميكية (حركية) لتحضير العضلات
• بعد التمرين: إطالة ثابتة لتسريع التعافي
• في أيام الراحة: جلسة إطالة كاملة ١٥-٢٠ دقيقة

## تمارين إطالة أساسية

## إطالة عضلات الفخذ الأمامية
قف على قدم واحدة واسحب القدم الأخرى للخلف. ثبّت ٢٠-٣٠ ثانية لكل جانب.

## إطالة أوتار الركبة
اجلس ومد ساقيك. حاول لمس أصابع قدميك. ثبّت ٢٠-٣٠ ثانية.

## إطالة عضلات الكتف
ضع ذراعك أمام صدرك واسحبها بالذراع الأخرى. ثبّت ٢٠ ثانية لكل جانب.

## إطالة عضلات الظهر
استلقِ على ظهرك واسحب ركبتيك نحو صدرك. ثبّت ٣٠ ثانية.

## إطالة عضلات الصدر
قف بجانب الحائط وضع ذراعك عليه بزاوية ٩٠ درجة. لفّ جسمك بعيداً. ثبّت ٢٠ ثانية.

## أخطاء شائعة في الإطالة
• الارتداد أثناء الإطالة (خطر الإصابة)
• حبس النفس (تنفس بشكل طبيعي)
• الإطالة لعضلات باردة (سخّن أولاً)
• تجاوز نقطة الألم (اشعر بالشد لا الألم)

---

**النصيحة:** خصص ١٠ دقائق يومياً للإطالة. ستلاحظ تحسناً في أدائك وتقليل الآلام خلال أسبوعين.`,
      en: `Many people neglect stretching, but it's one of the most important elements of fitness. Here's why you should make it part of your routine.

## Benefits of Stretching
• Improved flexibility and range of motion
• Reduced injury risk
• Better blood circulation
• Relief from tension and muscle soreness
• Improved posture

## When to Stretch?
• Before exercise: Dynamic stretching to prepare muscles
• After exercise: Static stretching to speed recovery
• On rest days: Full stretching session 15-20 minutes

## Essential Stretching Exercises

## Quad Stretch
Stand on one foot and pull the other foot behind you. Hold 20-30 seconds per side.

## Hamstring Stretch
Sit with legs extended. Try to touch your toes. Hold 20-30 seconds.

## Shoulder Stretch
Place your arm across your chest and pull it with the other arm. Hold 20 seconds per side.

## Back Stretch
Lie on your back and pull your knees toward your chest. Hold 30 seconds.

## Chest Stretch
Stand beside a wall, place your arm on it at a 90-degree angle. Rotate your body away. Hold 20 seconds.

## Common Stretching Mistakes
• Bouncing during stretches (injury risk)
• Holding your breath (breathe normally)
• Stretching cold muscles (warm up first)
• Going past the point of pain (feel the stretch, not pain)

---

**Tip:** Dedicate 10 minutes daily to stretching. You'll notice improved performance and reduced soreness within two weeks.`,
    },
  },
}

export default function BlogPostPage({ initialPost, postId }) {
  const params = useParams()
  const id = postId || params?.id
  const { lang } = useLanguage()
  // Use server-fetched post if provided, fall back to hardcoded
  const post = initialPost || blogPosts[id]

  if (!post) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <span className="text-6xl mb-6 block">📄</span>
          <h1 className="text-2xl font-bold mb-4">
            {lang === 'ar' ? 'المقال غير موجود' : 'Article Not Found'}
          </h1>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand hover:underline"
          >
            <ArrowRight size={18} className={lang === 'en' ? 'rotate-180' : ''} />
            <span>{lang === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}</span>
          </Link>
        </div>
      </div>
    )
  }

  const content = post.content[lang]
  const catLabel = categories[post.category]?.[lang] || post.category

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8"
        >
          <ArrowRight size={18} className={lang === 'en' ? 'rotate-180' : ''} />
          <span>{lang === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Image */}
          {post.image && (
            <div className="h-64 sm:h-80 rounded-3xl overflow-hidden mb-8">
              <img
                src={post.image}
                alt={post.title[lang]}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-brand/10 text-brand text-sm font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2">
              <Tag size={14} />
              {catLabel}
            </span>
            <span className="text-text-muted text-sm flex items-center gap-1.5">
              <Clock size={14} />
              {post.readTime[lang]}
            </span>
            <span className="text-text-muted text-sm">{post.date[lang]}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 leading-tight">
            {post.title[lang]}
          </h1>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          {content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4">
                  {paragraph.replace('## ', '')}
                </h2>
              )
            }
            if (paragraph.startsWith('---')) {
              return <hr key={i} className="border-border my-8" />
            }
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <p key={i} className="text-brand font-bold text-lg my-4">
                  {paragraph.replace(/\*\*/g, '')}
                </p>
              )
            }
            return (
              <p key={i} className="text-text-secondary leading-relaxed mb-4">
                {paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}
              </p>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-brand/15 to-brand/5 border border-brand/20 rounded-3xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">
            {lang === 'ar' ? 'هل تريد المزيد من النصائح التفصيلية؟' : 'Want more detailed tips?'}
          </h2>
          <p className="text-text-secondary mb-6">
            {lang === 'ar'
              ? 'كتبنا الإلكترونية تحتوي على خطط مفصلة وبرامج كاملة لمساعدتك في تحقيق أهدافك.'
              : 'Our ebooks contain detailed plans and complete programs to help you achieve your goals.'}
          </p>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark text-white px-8 py-4 rounded-2xl font-bold hover:-translate-y-1 transition-transform"
          >
            <span>{lang === 'ar' ? 'تصفح الكتب' : 'Browse Books'}</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
