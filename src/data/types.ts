import firebase from './firebase'

export type Label = {
    [key: string]: string
}
export type Category = {
  id?: string,
  name: string,
  mainId?: string,
  parentId: string,
  ordering: number,
  isLeaf: boolean,
  isActive: boolean
}
export type Error = {
  code: string,
  message: string
}

export type Product = {
  id?: string,
  name: string,
  alias?: string,
  description?: string,
  categoryId: string,
  trademarkId?: string,
  countryId: string,
  imageUrl?: string,
  rating: number,
  ratingCount: number,
  unit: string,
  isActive: boolean
}
export type Pack = {
  id?: string,
  name: string,
  product: Product,
  price?: number,
  subPackId?: string,
  subCount?: number,
  weightedPrice?: number,
  byWeight: boolean,
  unitsCount: number,
  imageUrl?: string,
  withGift?: boolean,
  gift?: string,
  forSale: boolean,
  isActive: boolean,
  lastTrans: Date
}
export type PackStore = {
  storeId: string,
  packId: string,
  price: number,
  isRetail: boolean,
  isActive: boolean,
  claimUserId?: string,
  time: Date,
}
export type Notification = {
  id: string,
  title: string,
  message: string,
  time: Date,
  userId: string
}
export type Rating = {
  productId: string,
  status: string,
  userId: string,
  value: number,
  userInfo?: User,
  productInfo?: Product
}
export type Position = {
  lat: number,
  lng: number
}
export type User = {
  id: string,
  name: string,
  mobile: string,
  position: Position,
  storeName?: string,
  storeId?: string,
  colors?: string[],
  address?: string,
  time: Date,
  locationId?: string,
  type: string
}
export type Advert = {
  id?: string,
  type: string,
  title: string,
  text: string,
  isActive: boolean,
  imageUrl?: string,
  time: Date
}
export type Location = {
  id: string,
  name: string,
  position: Position
}
export type Country = {
  id: string,
  name: string,
}
export type Trademark = {
  id: string,
  name: string,
}
export type PasswordRequest = {
  id: string,
  mobile: string,
  status: string,
  time: Date
}
export type Store = {
  id?: string,
  name: string,
  isActive: boolean,
  mobile: string,
  address: string,
  position: Position,
  locationId?: string,
  type: string,
  claimsCount: number
}
export type Log = {
  id: string,
  error: string,
  page: string,
  userId: string,
  time: Date,
}
export type Alarm = {
  packId: string,
  storeId: string,
  type: string,
  time: Date
}
export type ProductRequest = {
  id: string,
  storeId: string,
  name: string,
  country: string,
  weight: string,
  price: number,
  imageUrl: string,
  time: Date
}
export type StoreRequest = {
  storeId: string,
  packId: string
}
export type PackRequest = {
  id: string,
  storeId: string,
  siblingPackId: string,
  name: string,
  imageUrl?: string,
  price: number,
  subCount?: number,
  withGift?: boolean,
  gift?: string,
  time: Date
}

export type State = {
  user?: firebase.User,
  users: User[],
  categories: Category[],
  packs: Pack[],
  packStores: PackStore[],
  adverts: Advert[],
  locations: Location[],
  countries: Country[],
  trademarks: Trademark[],
  passwordRequests: PasswordRequest[],
  stores: Store[],
  products: Product[],
  logs: Log[],
  notifications: Notification[],
  productRequests: ProductRequest[],
  storeRequests: StoreRequest[],
  alarms: Alarm[],
  packRequests: PackRequest[]
}

export type Action = {
  type: string
  payload?: any
}

export type Context = {
  state: State;
  dispatch: React.Dispatch<Action>
}