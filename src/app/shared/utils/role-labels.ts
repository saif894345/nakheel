/**
 * Plain-Arabic explanation of what each Hitit role code allows a user to do.
 * The source export has no official role glossary, so these are best-effort
 * descriptions based on standard airline reservation-system (PSS) terminology -
 * not confirmed by Hitit documentation. Treat as a helpful guide, not a
 * definitive permissions audit.
 */
const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'مدير عام - صلاحيات إدارية كاملة على حساب الوكيل/المحطة',
  ADMIN_NO_PAYMENT: 'مدير عام بدون صلاحية الدفع أو التحصيل المالي',
  AGENT_USER: 'مستخدم وكيل - يقدر يحجز ويدفع باسم الوكيل',
  AGENT_SUPERVISOR: 'مشرف وكيل - يراقب ويوافق على معاملات مستخدمي الوكيل',
  AGENT_SUBUSER: 'مستخدم فرعي تابع لحساب وكيل رئيسي',
  UPD_AGENT_USER: 'مستخدم وكيل بصلاحية تعديل الحجوزات',
  CHECK_IN_USER: 'مستخدم تسجيل وصول الركاب بالمطار (تشيك إن)',
  CHECK_IN_SUPERVISOR: 'مشرف تسجيل وصول الركاب بالمطار',
  CRC_ADMIN: 'مدير مركز التحكم بالحجوزات المركزي (Central Reservation Control)',
  'CRC_ADMIN_2022': 'مدير مركز التحكم بالحجوزات المركزي (نسخة محدثة 2022)',
  DCS_ADMIN: 'مدير نظام مراقبة المغادرة (Departure Control System)',
  SYSTEM_ADMIN: 'مدير النظام العام - صلاحيات تقنية واسعة',
  HITIT_SYSTEM_ADMIN: 'مدير نظام Hitit - صلاحيات مزوّد النظام نفسه (موظفو Hitit)',
  OFFICE_SUPERVISOR: 'مشرف مكتب مبيعات',
  OFFICE_USER: 'مستخدم مكتب مبيعات',
  GSA: 'وكيل خدمات عام (General Sales Agent)',
  API_USER: 'مستخدم واجهة برمجية (API) - وصول تقني آلي للنظام',
  PERIPHERAL: 'جهاز طرفي متصل بالنظام (مثل طابعة تذاكر)',
  GROUP_AIRLINE: 'صلاحية على مستوى مجموعة شركات طيران',
  TRANSACTION: 'صلاحية معاملات نظام داخلية',
  PNL_USER: 'مستخدم قوائم أسماء الركاب (Passenger Name List)',
  MEMBER: 'حساب أساسي بدون صلاحيات إدارية',
  CC_SUPERVISOR: 'مشرف عمليات بطاقات الائتمان',
  'FF_ADMIN_2022': 'مدير برنامج الولاء (Frequent Flyer) - نسخة 2022',
  'FINANCE_USER_2022': 'مستخدم الشؤون المالية - نسخة 2022',
  'GROUP_PNR_APPROVER)': 'يوافق على حجوزات المجموعات (Group PNR)',
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? 'صلاحية غير موثقة بدليل رسمي - راجع الدعم الفني لتوضيحها';
}
