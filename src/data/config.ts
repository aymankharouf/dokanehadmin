export const colors = [
  {id: 0, name: 'darkblue'},
  {id: 1, name: 'deeppink'},
  {id: 2, name: 'darkgreen'},
  {id: 3, name: 'red'},
  {id: 4, name: 'purple'},
  {id: 5, name: 'maroon'},
  {id: 6, name: 'darkslategray'},
  {id: 7, name: 'crimson'},
  {id: 8, name: 'chocolate'},
  {id: 9, name: 'darkolivegreen'},
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
  {id: 's', name: 'محل', isStore: true},
  {id: 'w', name: 'جملة', isStore: true},
  {id: 'd', name: 'موزع', isStore: true},
  {id: 'r', name: 'مطعم', isStore: true}
]

export const patterns = {
  password: /^.{4}$/,
  name: /^.{4,50}$/,
  mobile: /^07[7-9][0-9]{7}$/
}
