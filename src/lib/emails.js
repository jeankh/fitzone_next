function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function baseTemplate({ lang = 'ar', title, intro, buttonLabel, buttonUrl, footer, bodyHtml = '' }) {
  const isAr = lang === 'ar'
  const direction = isAr ? 'rtl' : 'ltr'

  return `<div dir="${direction}" style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0b0b0f;border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;color:#ffffff">
    <div style="padding:28px 28px 20px;background:linear-gradient(135deg,#1a1a22 0%,#0b0b0f 100%);border-bottom:1px solid rgba(255,255,255,0.08)">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff3b72;font-weight:700;margin-bottom:10px">FitZone</div>
      <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff">${title}</h1>
    </div>
    <div style="padding:28px">
      <p style="margin:0 0 18px;color:#d0d0d5;font-size:15px;line-height:1.8">${intro}</p>
      ${bodyHtml}
      ${buttonUrl ? `<div style="margin:26px 0 22px"><a href="${buttonUrl}" style="display:inline-block;background:linear-gradient(90deg,#d30a4a 0%,#b3053d 100%);color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:14px;font-weight:700">${buttonLabel}</a></div>` : ''}
      <p style="margin:0;color:#7f7f8a;font-size:12px;line-height:1.7">${footer}</p>
    </div>
  </div>`
}

function itemName(id, lang) {
  const isAr = lang === 'ar'
  if (id === 'transformation') return isAr ? 'دليل التنشيف وبناء الجسم' : 'Shredding & Building Guide'
  if (id === 'nutrition') return isAr ? 'دليل خسارة الدهون' : 'Fat Loss Guide'
  if (id === 'bundle') return isAr ? 'الباقة الكاملة' : 'Complete Bundle'
  return escapeHtml(id)
}

export function buildResetPasswordEmail({ resetUrl, lang = 'ar' }) {
  const isAr = lang === 'ar'
  return {
    subject: isAr ? 'إعادة تعيين كلمة المرور - FitZone' : 'Reset Your Password - FitZone',
    html: baseTemplate({
      lang,
      title: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password',
      intro: isAr
        ? 'تلقينا طلبا لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لاختيار كلمة مرور جديدة.'
        : 'We received a request to reset your account password. Use the button below to choose a new password.',
      buttonLabel: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
      buttonUrl: resetUrl,
      footer: isAr
        ? 'هذا الرابط صالح لمدة 15 دقيقة. إذا لم تطلب هذا التغيير، يمكنك تجاهل هذه الرسالة.'
        : 'This link expires in 15 minutes. If you did not request this change, you can ignore this email.',
    }),
  }
}

export function buildMagicLinkEmail({ name, magicUrl, lang = 'ar' }) {
  const isAr = lang === 'ar'
  const safeName = escapeHtml(name)
  return {
    subject: isAr ? 'رابط الدخول إلى حسابك - FitZone' : 'Your Login Link - FitZone',
    html: baseTemplate({
      lang,
      title: isAr ? `مرحباً ${safeName}!` : `Hello ${safeName}!`,
      intro: isAr
        ? 'اضغط على الزر أدناه لتسجيل الدخول مباشرة إلى حسابك.'
        : 'Use the button below to sign in directly to your account.',
      buttonLabel: isAr ? 'تسجيل الدخول' : 'Sign In',
      buttonUrl: magicUrl,
      footer: isAr
        ? 'هذا الرابط صالح لمدة 15 دقيقة. إذا لم تطلب تسجيل الدخول، تجاهل هذه الرسالة.'
        : 'This link expires in 15 minutes. If you did not request it, ignore this email.',
    }),
  }
}

export function buildOrderConfirmationEmail({ emailName, items, lang = 'ar' }) {
  const isAr = lang === 'ar'
  const safeName = escapeHtml(emailName)
  const itemList = (items || '')
    .split(',')
    .filter(Boolean)
    .map(id => `<li style="margin-bottom:8px">${itemName(id, lang)}</li>`)
    .join('')

  return {
    subject: isAr ? 'تأكيد طلبك - FitZone' : 'Order Confirmed - FitZone',
    html: baseTemplate({
      lang,
      title: isAr ? 'تم تأكيد طلبك' : 'Your Order Is Confirmed',
      intro: isAr
        ? `مرحباً ${safeName}، شكراً لطلبك. هذه المنتجات التي قمت بشرائها:`
        : `Hi ${safeName}, thanks for your purchase. Here are the items you bought:`,
      bodyHtml: `<ul style="margin:0 0 8px;padding-${isAr ? 'right' : 'left'}:20px;color:#ffffff;font-size:15px;line-height:1.8">${itemList}</ul>`,
      footer: isAr
        ? 'سيتم التواصل معك عبر واتساب أو البريد الإلكتروني لتسليم المنتجات إذا لزم الأمر. شكراً لثقتك بنا.'
        : 'We will reach out via WhatsApp or email if needed for delivery. Thank you for trusting FitZone.',
    }),
  }
}

export function buildAccountCreatedEmail({ name, magicUrl, lang = 'ar' }) {
  const isAr = lang === 'ar'
  const safeName = escapeHtml(name)
  return {
    subject: isAr ? 'حسابك جاهز - FitZone' : 'Your Account Is Ready - FitZone',
    html: baseTemplate({
      lang,
      title: isAr ? `مرحباً ${safeName}!` : `Welcome ${safeName}!`,
      intro: isAr
        ? 'تم إنشاء حسابك تلقائياً بعد عملية الشراء. يمكنك الآن متابعة مشترياتك والوصول إلى حسابك من خلال الزر أدناه.'
        : 'Your account was created automatically after checkout. You can now track your purchases and access your account using the button below.',
      buttonLabel: isAr ? 'فتح حسابي' : 'Open My Account',
      buttonUrl: magicUrl,
      footer: isAr
        ? 'هذا الرابط صالح لمدة 15 دقيقة. بعد الدخول يمكنك تعيين كلمة مرور دائمة من صفحة الحساب.'
        : 'This link expires in 15 minutes. After signing in, you can set a permanent password from your account page.',
    }),
  }
}
