import firebase from './firebase'

export interface Label {
    [key: string]: string
}
export interface Category {
  id: string,
  name: string,
  parentId: string,
  ordering: number,
  isLeaf: boolean,
  isActive: boolean
}
export interface Error {
  code: string,
  message: string
}
export interface Pack {
  id?: string,
  name: string,
  productId: string,
  productName: string,
  productAlias: string,
  productDescription?: string,
  imageUrl?: string,
  price: number,
  categoryId: string,
  sales?: number,
  rating: number,
  subPackId?: string,
  subQuantity?: number,
  subPercent?: number,
  subPackName?: string,
  bonusPackId?: string,
  bonusProductName?: string,
  bonusPackName?: string,
  bonusQuantity?: number,
  bonusPercent?: number,
  isOffer?: boolean,
  offerEnd?: Date,
  weightedPrice?: number,
  isDivided?: boolean,
  minStoreId?: string,
  trademarkId?: string,
  countryId: string,
  closeExpired?: boolean,
  ratingCount?: number,
  categoryName?: string,
  trademarkName?: string,
  countryName?: string,
  byWeight?: boolean,
  forSale?: boolean,
  unitsCount?: number,
  specialImage?: boolean,
  packTypeId?: string
}
export interface PackPrice {
  storeId: string,
  packId: string,
  price: number,
  cost: number,
  offerEnd?: Date,
  isActive: boolean,
  isAuto: boolean,
  packInfo?: Pack,
  storeInfo?: Store,
  time: Date,
  quantity?: number,
  weight?: number,
  subQuantity?: number,
  unitPrice?: number,
  unitCost?: number
}
export interface Notification {
  id: string,
  title: string,
  message: string,
  status: string,
  time: Date,
  userId: string
}
export interface Friend {
  userId: string,
  mobile: string,
  name: string,
  status: string
}
export interface Rating {
  productId: string,
  status: string,
  userId: string,
  value: number,
  userInfo?: User,
  productInfo?: Product
}
export interface Alarm {
  id: string,
  packId?: string,
  type: string,
  price: number,
  quantity?: number,
  alternative?: string,
  offerDays?: number,
  status: string,
  userId: string,
  time: Date,
  storeId?: string,
  newPackId?: string
}
export interface User {
  id: string,
  name: string,
  mobile: string,
  locationId: string,
  storeName?: string,
  notifications?: Notification[],
  friends?: Friend[],
  ratings?: Rating[],
  favorites?: string[],
  alarms?: Alarm[],
  colors?: string[],
  time: Date
}
export interface Customer {
  id: string,
  storeId: string,
  storeName: string,
  name: string,
  isBlocked: boolean,
  deliveryFees: number,
  discounts: number,
  specialDiscount: number,
  address: string,
  time?: Date
}
export interface Advert {
  id?: string,
  type: string,
  title: string,
  text: string,
  isActive: boolean,
  imageUrl?: string,
  time: Date
}
export interface Location {
  id: string,
  name: string,
  ordering: number
}
export interface Country {
  id: string,
  name: string,
}
export interface Trademark {
  id: string,
  name: string,
}
export interface PackType {
  id: string,
  name: string,
}
export interface PasswordRequest {
  id: string,
  mobile: string,
  status: string,
  time: Date
}
export interface Discount {
  value: number,
  type: string
}
export interface Product {
  id?: string,
  name: string,
  alias: string,
  description: string,
  categoryId: string,
  trademarkId: string,
  countryId: string,
  imageUrl: string,
  rating: number,
  ratingCount: number,
  categoryInfo?: Category,
  sales?: number
}
export interface Store {
  id?: string,
  type: string,
  name: string,
  isActive: boolean,
  discount: number,
  mobile: string,
  address: string,
  mapPosition: string,
  allowReturn: boolean,
  openTime: string
}
export interface Log {
  id: string,
  error: string,
  page: string,
  userId: string,
  time: Date,
  userInfo?: User
}
export interface AlarmType {
  id: string,
  name: string,
  isAvailable: number
}
export interface State {
  user?: firebase.User,
  users: User[],
  customers: Customer[],
  categories: Category[],
  packs: Pack[],
  packPrices: PackPrice[],
  adverts: Advert[],
  locations: Location[],
  countries: Country[],
  trademarks: Trademark[],
  passwordRequests: PasswordRequest[],
  archivedProducts: Product[],
  stores: Store[],
  products: Product[],
  logs: Log[],
  archivedPacks: Pack[],
  notifications: Notification[],
  alarms: Alarm[],
  ratings: Rating[],
  invitations: Friend[],
  packTypes: PackType[]
}

export interface Action {
  type: string
  payload?: any
}

export interface Context {
  state: State;
  dispatch: React.Dispatch<Action>
}