export const randomColors = [
  {id: 0, name: 'primary'},
  {id: 1, name: 'secondary'},
  {id: 2, name: 'success'},
  {id: 3, name: 'warning'},
  {id: 4, name: 'danger'},
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

export const storeTypes = [
  {id: 's', name: 'محل'},
  {id: 'w', name: 'جملة'},
  {id: 'd', name: 'موزع'}
]

export const userTypes = [
  {id: 's', name: 'محل'},
  {id: 'd', name: 'موزع/جملة'},
  {id: 'n', name: 'عادي'}
]

export const patterns = {
  password: /^.{4}$/,
  name: /^.{4,50}$/,
  mobile: /^07[7-9][0-9]{7}$/
}
