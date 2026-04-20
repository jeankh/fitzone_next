function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function itemName(id, lang) {
  const isAr = lang === 'ar'
  if (id === 'transformation') return isAr ? 'دليل التنشيف وبناء الجسم' : 'Shredding & Building Guide'
  if (id === 'nutrition') return isAr ? 'دليل خسارة الدهون' : 'Fat Loss Guide'
  if (id === 'bundle') return isAr ? 'الباقة الكاملة' : 'Complete Bundle'
  return escapeHtml(id)
}

function buildFooter({ lang, supportEmail }) {
  const isAr = lang === 'ar'
  const safeSupportEmail = escapeHtml(supportEmail)

  return `
    <div style="margin-top:28px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08)">
      <p style="margin:0 0 8px;color:#8f919c;font-size:12px;line-height:1.8">
        ${isAr
          ? 'هذه رسالة آلية من FitZone. يرجى عدم الرد مباشرة على هذا البريد الإلكتروني.'
          : 'This is an automated email from FitZone. Please do not reply directly to this message.'}
      </p>
      <p style="margin:0;color:#8f919c;font-size:12px;line-height:1.8">
        ${isAr
          ? `إذا كنت بحاجة إلى مساعدة، تواصل معنا عبر <a href="mailto:${safeSupportEmail}" style="color:#ffffff;text-decoration:none">${safeSupportEmail}</a> أو قم بزيارة <a href="https://www.fitzoneapp.com" style="color:#ffffff;text-decoration:none">fitzoneapp.com</a>.`
          : `If you need help, contact us at <a href="mailto:${safeSupportEmail}" style="color:#ffffff;text-decoration:none">${safeSupportEmail}</a> or visit <a href="https://www.fitzoneapp.com" style="color:#ffffff;text-decoration:none">fitzoneapp.com</a>.`}
      </p>
    </div>`
}

function baseTemplate({
  lang = 'ar',
  preheader,
  eyebrow,
  title,
  intro,
  bodyHtml = '',
  buttonLabel,
  buttonUrl,
  note,
  supportEmail = 'support@fitzoneapp.com',
}) {
  const isAr = lang === 'ar'
  const direction = isAr ? 'rtl' : 'ltr'
  const align = isAr ? 'right' : 'left'
  const oppositeAlign = isAr ? 'left' : 'right'
  const introFont = isAr ? 17 : 16
  const introLineHeight = isAr ? 2 : 1.8
  const bodyLineHeight = isAr ? 1.95 : 1.8
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fitzoneapp.com'}/fitzone-logo.jpeg`

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden">${escapeHtml(preheader || '')}</div>
    <div dir="${direction}" style="margin:0;padding:24px 12px;background:#f5f5f7">
      <div style="max-width:620px;margin:0 auto;background:#0b0c10;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:0 24px 60px rgba(0,0,0,0.28);color:#ffffff">
        <div style="padding:26px 28px 20px;background:radial-gradient(circle at top ${isAr ? 'left' : 'right'}, rgba(211,10,74,0.16), transparent 25%),linear-gradient(180deg,#14161d 0%,#0b0c10 100%);border-bottom:1px solid rgba(255,255,255,0.08);text-align:${align}">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
            <tr>
              <td style="text-align:${align};vertical-align:top">
                <img src="${logoUrl}" alt="FitZone" width="34" height="34" style="width:34px;height:34px;border-radius:8px;object-fit:cover;display:block" />
              </td>
              <td style="text-align:${oppositeAlign};vertical-align:middle;color:#8f919c;font-size:11px;line-height:1.6;padding-${isAr ? 'right' : 'left'}:12px;letter-spacing:0.2px">
                ${isAr ? 'رسالة معاملة' : 'Transactional email'}
              </td>
            </tr>
          </table>
          <div style="margin-top:22px;color:#ff4d82;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase">${escapeHtml(eyebrow || '')}</div>
          <h1 style="margin:10px 0 0;font-size:${isAr ? 30 : 32}px;line-height:${isAr ? 1.45 : 1.22};font-weight:800;color:#ffffff">${title}</h1>
        </div>

        <div style="padding:28px;text-align:${align}">
          <p style="margin:0 0 18px;color:#d7d9df;font-size:${introFont}px;line-height:${introLineHeight};max-width:${isAr ? '100%' : '500px'}">${intro}</p>

          ${bodyHtml ? `<div style="color:#b8bbc5;font-size:14px;line-height:${bodyLineHeight};margin-bottom:18px">${bodyHtml}</div>` : ''}

          ${buttonUrl ? `
            <div style="margin:24px 0 18px;text-align:center">
              <a href="${buttonUrl}" style="display:inline-block;background:linear-gradient(90deg,#d30a4a 0%,#b3053d 100%);color:#ffffff;text-decoration:none;padding:16px 26px;border-radius:16px;font-weight:800;font-size:15px;letter-spacing:0.2px;box-shadow:0 10px 30px rgba(211,10,74,0.25)">${buttonLabel}</a>
            </div>` : ''}

          ${note ? `
            <div style="margin-top:18px;padding:0;color:#9094a0;font-size:12px;line-height:1.9;text-align:${align}">
              ${note}
            </div>` : ''}

          ${buildFooter({ lang, supportEmail })}
        </div>
      </div>
    </div>`
}

export function buildResetPasswordEmail({ resetUrl, lang = 'ar', supportEmail = 'support@fitzoneapp.com' }) {
  const isAr = lang === 'ar'
  return {
    subject: isAr ? 'إعادة تعيين كلمة المرور - FitZone' : 'Reset Your Password - FitZone',
    html: baseTemplate({
      lang,
      supportEmail,
      preheader: isAr ? 'رابط آمن لإعادة تعيين كلمة المرور الخاصة بحسابك.' : 'A secure link to reset your FitZone password.',
      eyebrow: isAr ? 'أمان الحساب' : 'Account Security',
      title: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password',
      intro: isAr
        ? 'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. إذا كان هذا الطلب منك، استخدم الزر أدناه لاختيار كلمة مرور جديدة بشكل آمن.'
        : 'We received a request to reset your account password. If this was you, use the button below to choose a new password securely.',
      buttonLabel: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
      buttonUrl: resetUrl,
      note: isAr
        ? 'هذا الرابط صالح لمدة 15 دقيقة فقط. إذا لم تطلب هذا التغيير، يمكنك تجاهل الرسالة ولن يتم تعديل حسابك.'
        : 'This link is valid for 15 minutes only. If you did not request this change, you can safely ignore this message and nothing on your account will be updated.',
    }),
  }
}

export function buildMagicLinkEmail({ name, magicUrl, lang = 'ar', supportEmail = 'support@fitzoneapp.com' }) {
  const isAr = lang === 'ar'
  const safeName = escapeHtml(name)
  return {
    subject: isAr ? 'رابط الدخول إلى حسابك - FitZone' : 'Your Login Link - FitZone',
    html: baseTemplate({
      lang,
      supportEmail,
      preheader: isAr ? 'رابط سريع وآمن للدخول إلى حسابك في FitZone.' : 'A fast, secure sign-in link for your FitZone account.',
      eyebrow: isAr ? 'دخول آمن' : 'Secure Sign In',
      title: isAr ? `مرحباً ${safeName}` : `Hello ${safeName}`,
      intro: isAr
        ? 'استخدم الزر أدناه للدخول مباشرة إلى حسابك بدون الحاجة إلى إدخال كلمة المرور.'
        : 'Use the button below to sign in directly to your account without entering your password.',
      buttonLabel: isAr ? 'تسجيل الدخول' : 'Sign In',
      buttonUrl: magicUrl,
      note: isAr
        ? 'الرابط صالح لمدة 15 دقيقة فقط ويستخدم مرة واحدة. إذا لم تطلب تسجيل الدخول، تجاهل هذه الرسالة.'
        : 'This link is valid for 15 minutes and can be used once. If you did not request this sign-in, simply ignore this message.',
    }),
  }
}

export function buildOrderConfirmationEmail({ emailName, items, lang = 'ar', supportEmail = 'support@fitzoneapp.com' }) {
  const isAr = lang === 'ar'
  const safeName = escapeHtml(emailName)
  // items may arrive as an array, a JSON string like '["transformation"]',
  // or a legacy comma string like 'transformation,nutrition'.
  // Inlined here instead of importing parseItems to keep this module free of
  // server-auth deps (jose/bcrypt) — email builders are used from many paths.
  let ids = []
  if (Array.isArray(items)) {
    ids = items
  } else if (typeof items === 'string' && items.trim()) {
    const trimmed = items.trim()
    if (trimmed.startsWith('[')) {
      try { ids = JSON.parse(trimmed) } catch { ids = [] }
    } else {
      ids = trimmed.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  const itemList = ids
    .map(id => `<li style="margin-bottom:10px">${itemName(id, lang)}</li>`)
    .join('')

  return {
    subject: isAr ? 'تأكيد طلبك - FitZone' : 'Order Confirmed - FitZone',
    html: baseTemplate({
      lang,
      supportEmail,
      preheader: isAr ? 'تم استلام طلبك بنجاح من FitZone.' : 'Your FitZone order has been confirmed successfully.',
      eyebrow: isAr ? 'تأكيد الطلب' : 'Order Confirmation',
      title: isAr ? 'تم تأكيد طلبك' : 'Your Order Is Confirmed',
      intro: isAr
        ? `مرحباً ${safeName}، شكراً لثقتك بنا. تم استلام طلبك بنجاح، وهذه المنتجات المرتبطة بطلبك:`
        : `Hi ${safeName}, thank you for trusting FitZone. Your order has been received successfully, and these are the items included in your purchase:`,
      bodyHtml: `<ul style="margin:0;padding-${isAr ? 'right' : 'left'}:20px;color:#ffffff;font-size:15px;line-height:${isAr ? 2 : 1.9}">${itemList}</ul>`,
      note: isAr
        ? 'إذا احتاج طلبك إلى متابعة إضافية، سيتواصل معك فريقنا عبر واتساب أو البريد الإلكتروني باستخدام البيانات التي أدخلتها أثناء الشراء.'
        : 'If your order needs any follow-up, our team will contact you through WhatsApp or email using the details you provided during checkout.',
    }),
  }
}

export function buildAccountCreatedEmail({ name, magicUrl, lang = 'ar', supportEmail = 'support@fitzoneapp.com' }) {
  const isAr = lang === 'ar'
  const safeName = escapeHtml(name)
  return {
    subject: isAr ? 'حسابك جاهز - FitZone' : 'Your Account Is Ready - FitZone',
    html: baseTemplate({
      lang,
      supportEmail,
      preheader: isAr ? 'تم تجهيز حسابك تلقائياً بعد عملية الشراء.' : 'Your account has been created automatically after checkout.',
      eyebrow: isAr ? 'حسابك الجديد' : 'Your New Account',
      title: isAr ? `مرحباً ${safeName}` : `Welcome ${safeName}`,
      intro: isAr
        ? 'قمنا بإنشاء حسابك تلقائياً بعد إتمام عملية الشراء حتى تتمكن من متابعة طلباتك والوصول إلى مشترياتك بسهولة.'
        : 'We created your account automatically after checkout so you can track your orders and access your purchases more easily.',
      buttonLabel: isAr ? 'فتح حسابي' : 'Open My Account',
      buttonUrl: magicUrl,
      note: isAr
        ? 'هذا الرابط صالح لمدة 15 دقيقة. بعد الدخول، يمكنك تعيين كلمة مرور دائمة من صفحة الحساب لسهولة الوصول لاحقاً.'
        : 'This link stays valid for 15 minutes. After signing in, you can set a permanent password from your account page for easier future access.',
    }),
  }
}
