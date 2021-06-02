export const randomColors = [
  {id: 0, name: 'darkblue'},
  {id: 1, name: 'deeppink'},
  {id: 2, name: 'dodgerblue'},
  {id: 3, name: 'red'},
  {id: 4, name: 'purple'},
  {id: 5, name: 'green'},
  {id: 6, name: 'crimson'},
]

export const advertTypes = [
  {id: 'a', name: 'اعلان'},
  {id: 'n', name: 'تنويه'}
]

export const units = [
  {id: 'g', name: 'غرام', type: 'w', factor: 1},
  {id: 'kg', name: 'كيلو', type: 'w', factor: 1000},
  {id: 'l', name: 'لتر', type: 'v', factor: 1000},
  {id: 'ml', name: 'مل', type: 'v', factor: 1},
  {id: 'c', name: 'حبة', type: 'c', factor: 1},
]

export const userTypes = [
  {id: 'n', name: 'مستخدم', isStore: false},
  {id: 's', name: 'دكانة', isStore: true},
  {id: 'w', name: 'جملة', isStore: true},
  {id: 'd', name: 'موزع', isStore: true},
  {id: 'r', name: 'مطعم', isStore: true}
]

export const patterns = {
  password: /^.{4}$/,
  name: /^.{4,50}$/,
  mobile: /^07[7-9][0-9]{7}$/
}
