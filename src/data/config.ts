export const randomColors = [
  {id: 0, name: 'primary'},
  {id: 1, name: 'secondary'},
  {id: 2, name: 'tertiary'},
  {id: 3, name: 'success'},
  {id: 4, name: 'danger'},
  {id: 5, name: 'dark'},
  {id: 6, name: 'warning'},
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
  {id: 'n', name: 'مستخدم عادي', isStore: false},
  {id: 's', name: 'محل تجزئة', isStore: true},
  {id: 'w', name: 'محل جملة', isStore: true},
  {id: 'd', name: 'موزع', isStore: true}
]

export const patterns = {
  password: /^.{4}$/,
  name: /^.{4,50}$/,
  mobile: /^07[7-9][0-9]{7}$/
}
