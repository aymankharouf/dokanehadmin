export const setup = {
  fixedFees: 2.5,
  maxDiscount: 100,
  profit: 10,
  weightErrorMargin: 10,
  orderLimit: 50000,
  exceedPricePercent: 5,
  returnPenalty: 100,
  invitationDiscount: 100,
  alarmDiscount: 100,
  firstOrderDiscount: 200,
  ratingDiscount: 50,
}

export const randomColors = [
  {id: 0, name: 'red'},
  {id: 1, name: 'green'},
  {id: 2, name: 'blue'},
  {id: 3, name: 'pink'},
  {id: 4, name: 'yellow'},
  {id: 5, name: 'orange'},
  {id: 6, name: 'purple'},
  {id: 7, name: 'deeppurple'},
  {id: 8, name: 'lightblue'},
  {id: 9, name: 'teal'},
]

export const orderStatus = [
  {id: 'n', name: 'جديد'},
  {id: 'a', name: 'معتمد'},
  {id: 's', name: 'معلق'},
  {id: 'r', name: 'مرفوض'},
  {id: 'e', name: 'قيد التجهيز'},
  {id: 'f', name: 'مكتمل'},
  {id: 'p', name: 'جاهز'},
  {id: 'd', name: 'مستلم'},
  {id: 'c', name: 'ملغي'},
  {id: 'u', name: 'غير متوفر'},
  {id: 'i', name: 'استيداع'}
]  

export const storeTypes = [
  {id: '1', name: 'المستودع'},
  {id: '2', name: 'دكانة'},
  {id: '3', name: 'محل'},
  {id: '4', name: 'سوبرماركت'},
  {id: '5', name: 'محل جملة'}
]

export const stockTransTypes = [
  {id: 'p', name: 'شراء'},
  {id: 's', name: 'بيع'},
  {id: 'i', name: 'استيداع'},
  {id: 'd', name: 'اتلاف'},
  {id: 'g', name: 'تبرع'},
  {id: 'r', name: 'ارجاع'},
  {id: 'c', name: 'تصريف'},
  {id: 'w', name: 'سحب'}
]

export const spendingTypes = [
  {id: 'w', name: 'سحب'},
  {id: 'f', name: 'بنزين'},
  {id: 'm', name: 'صيانة'},
]

export const ratingValues = [
  {id: 0, name: 'ﻻ أنصح به'},
  {id: 1, name: 'أنصح به'}
]

export const orderPositions = [
  {id: 's', name: 'المستودع'},
  {id: 'c', name: 'مركز التوزيع'},
  {id: 'd', name: 'سيارة التوزيع'},
]

export const orderPackStatus = [
  {id: 'n', name: 'جديد'},
  {id: 'p', name: 'شراء جزئي'},
  {id: 'f', name: 'تم الشراء'},
  {id: 'u', name: 'غير متوفر'},
  {id: 'pu', name: 'شراء جزئي والباقي غير متوفر'},
  {id: 'r', name: 'مرتجع'},
  {id: 'pr', name: 'مرتجع جزئي'}
]

export const storageTypes = [
  {id: 'd', name: 'جاف'},
  {id: 'c', name: 'مبرد'},
  {id: 'f', name: 'مجمد'}
]

export const alarmTypes = [
  {id: '1', name: 'الابلاغ عن سعر أقل', actor: 'c'},
  {id: '2', name: 'الابلاغ عن تغيير السعر', actor: 'o', isAvailable: true},
  {id: '3', name: 'الابلاغ عن توفر هذا المنتج/العرض', actor: 'o', isAvailable: false},
  {id: '4', name: 'الابلاغ عن عدم توفر هذا المنتج/العرض', actor: 'o', isAvailable: true},
  {id: '5', name: 'الابلاغ عن توفر منتج بديل', actor: 'a'},
  {id: '6', name: 'الابلاغ غن توفر عبوة جديدة للمنتج', actor: 'a'},
  {id: '7', name: 'الابلاغ عن عرض لقرب انتهاء الصلاحية', actor: 'o', isAvailable: true},
  {id: '8', name: 'الابلاغ عن عرض على شكل مجموعة', actor: 'o', isAvailable: true},
]

export const deliveryIntervals = [
  {id: 'm', name: 'صباحا'},
  {id: 'a', name: 'بعد الظهر'},
  {id: 'n', name: 'مساءا'},
  {id: 'u', name: 'اي وقت'}
]