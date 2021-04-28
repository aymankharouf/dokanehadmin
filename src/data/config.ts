import { AlarmType } from "./types"

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

export const alarmTypes: AlarmType[] = [
  {id: 'av', name: 'الابلاغ عن توفر هذا المنتج/العرض', isAvailable: -1},
  {id: 'ua', name: 'الابلاغ عن عدم توفر هذا المنتج/العرض', isAvailable: 1},
  {id: 'aa', name: 'الابلاغ عن توفر بديل', isAvailable: 0},
  {id: 'eo', name: 'الابلاغ عن عرض لقرب انتهاء الصلاحية', isAvailable: 0},
  {id: 'go', name: 'الابلاغ عن عرض لمجموعة', isAvailable: 0},
]

export const advertType = [
  {id: 'a', name: 'اعلان'},
  {id: 'n', name: 'تنويه'}
]

export const unitTypes = [
  {id: 'w', name: 'وزن'},
  {id: 'v', name: 'حجم'},
  {id: 'c', name: 'عدد'},
  {id: 'l', name: 'طول'}
]