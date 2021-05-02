import firebase from './firebase'

export type Label = {
    [key: string]: string
}
export type Category = {
  id: string,
  name: string,
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
  isArchived: boolean,
  unitType: string
}
export type Pack = {
  id?: string,
  name: string,
  product: Product,
  price?: number,
  subPackId?: string,
  subQuantity?: number,
  weightedPrice?: number,
  byWeight: boolean,
  typeUnits: number,
  standardUnits: number,
  specialImage: boolean,
  unitId: string,
  imageUrl?: string
}
export type PackPrice = {
  storeId: string,
  packId: string,
  price: number,
  time: Date,
  subQuantity?: number,
  unitPrice?: number,
}
export type Notification = {
  id: string,
  title: string,
  message: string,
  status: string,
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
  notifications?: Notification[],
  ratings?: Rating[],
  favorites?: string[],
  colors?: string[],
  time: Date
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
  ordering: number
}
export type Country = {
  id: string,
  name: string,
}
export type Trademark = {
  id: string,
  name: string,
}
export type Unit = {
  id: string,
  name: string,
  type: string,
  factor: number
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
  locationId?: string
}
export type Log = {
  id: string,
  error: string,
  page: string,
  userId: string,
  time: Date,
}
export type AlarmType = {
  id: string,
  name: string,
  isAvailable: number
}
export type ProductRequest = {
  id: string,
  userId: string,
  name: string,
  country: string,
  weight: string,
  price: number,
  imageUrl: string,
  time: Date
}
export type State = {
  user?: firebase.User,
  users: User[],
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
  units: Unit[],
  productRequests: ProductRequest[]
}

export type Action = {
  type: string
  payload?: any
}

export type Context = {
  state: State;
  dispatch: React.Dispatch<Action>
}