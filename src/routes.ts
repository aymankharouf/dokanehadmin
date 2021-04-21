import Home from './pages/home'
import NotFoundPage from './pages/not-found-page'
import Panel from './pages/panel'
import Login from './pages/login'
import Products from './pages/products'
import ProductPacks from './pages/product-packs'
import Stores from './pages/stores'
import StorePacks from './pages/store-packs'
import AddStorePack from './pages/add-store-pack'
import AddProduct from './pages/add-product'
import AddStore from './pages/add-store'
import EditProduct from './pages/edit-product'
import EditPrice from './pages/edit-price'
import Countries from './pages/countries'
import AddCountry from './pages/add-country'
import Settings from './pages/settings'
import Categories from './pages/categories'
import AddCategory from './pages/add-category'
import Customers from './pages/customers'
import PasswordRequests from './pages/password-requests'
import AddPack from './pages/add-pack'
import PackDetails from './pages/pack-details'
import EditPack from './pages/edit-pack'
import EditCountry from './pages/edit-country'
import EditCategory from './pages/edit-category'
import EditStore from './pages/edit-store'
import CustomerDetails from './pages/customer-details'
import EditCustomer from './pages/edit-customer'
import NewUsers from './pages/new-users'
import ApproveUser from './pages/approve-user'
import Alarms from './pages/alarms'
import AlarmDetails from './pages/alarm-details'
import RetreivePassword from './pages/retreive-password'
import StoreOwners from './pages/store-owners'
import ChangePassword from './pages/change-password'
import Locations from './pages/locations'
import AddLocation from './pages/add-location'
import EditLocation from './pages/edit-location'
import Ratings from './pages/ratings'
import Approvals from './pages/approvals'
import AddPackStore from './pages/add-pack-store'
import Logs from './pages/logs'
import StoreDetails from './pages/store-details'
import ProductDetails from './pages/product-details'
import AddOffer from './pages/add-offer'
import EditOffer from './pages/edit-offer'
import AddBulk from './pages/add-bulk'
import EditBulk from './pages/edit-bulk'
import Invitations from './pages/invitations'
import InvitationDetails from './pages/invitation-details'
import Notifications from './pages/notifications'
import AddNotification from './pages/add-notification'
import Adverts from './pages/adverts'
import AddAdvert from './pages/add-advert'
import AdvertDetails from './pages/advert-details'
import EditAdvert from './pages/edit-advert'
import PermitUser from './pages/permit-user'
import Register from './pages/register'
import PermissionList from './pages/permission-list'
import ArchivedProducts from './pages/archived-products'
import Trademarks from './pages/trademarks'
import AddTrademark from './pages/add-trademark'
import EditTrademark from './pages/edit-trademark'
import PackTypes from './pages/pack-types'
import AddPackType from './pages/add-pack-type'
import EditPackType from './pages/edit-pack-type'

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/home/',
    component: Home,
  },
  {
    path: '/panel/',
    component: Panel
  },
  {
    path: '/login/',
    component: Login,
    options: {
      reloadCurrent: true,
    },
  },
  {
    path: '/panel-login/',
    component: Login,
  },
  {
    path: '/change-password/',
    component: ChangePassword
  },
  {
    path: '/permit-user/:id',
    component: PermitUser
  },
  {
    path: '/register/',
    component: Register,
    options: {
      reloadCurrent: true,
    },
  },
  {
    path: '/products/:id',
    component: Products,
  },
  {
    path: '/product-packs/:id/type/:type',
    component: ProductPacks
  },
  {
    path: '/product-details/:id',
    component: ProductDetails
  },
  {
    path: '/edit-product/:id',
    component: EditProduct
  },
  {
    path: '/settings/',
    component: Settings
  },
  {
    path: '/stores/',
    component: Stores,
  },
  {
    path: '/add-store/',
    component: AddStore
  },
  {
    path: '/customers/',
    component: Customers,
  },
  {
    path: '/new-users/',
    component: NewUsers
  },
  {
    path: '/approve-user/:id',
    component: ApproveUser
  },
  {
    path: '/customer-details/:id',
    component: CustomerDetails
  },
  {
    path: '/edit-customer/:id',
    component: EditCustomer
  },
  {
    path: '/store-details/:id',
    component: StoreDetails
  },
  {
    path: '/password-requests/',
    component: PasswordRequests
  },
  {
    path: '/alarms/',
    component: Alarms
  },
  {
    path: '/alarm-details/:id/user/:userId',
    component: AlarmDetails
  },
  {
    path: '/countries/',
    component: Countries,
  },
  {
    path: '/add-country/',
    component: AddCountry
  },
  {
    path: '/edit-country/:id',
    component: EditCountry
  },
  {
    path: '/trademarks/',
    component: Trademarks,
  },
  {
    path: '/add-trademark/',
    component: AddTrademark
  },
  {
    path: '/edit-trademark/:id',
    component: EditTrademark
  },
  {
    path: '/categories/:id',
    component: Categories,
  },
  {
    path: '/add-category/:id',
    component: AddCategory
  },
  {
    path: '/edit-category/:id',
    component: EditCategory
  },
  {
    path: '/store-packs/:id',
    component: StorePacks
  },
  {
    path: '/edit-store/:id',
    component: EditStore
  },
  {
    path: '/add-store-pack/:id',
    component: AddStorePack
  },
  {
    path: '/add-pack-store/:id',
    component: AddPackStore
  },
  {
    path: '/add-product/:id',
    component: AddProduct
  },
  {
    path: '/add-pack/:id',
    component: AddPack
  },
  {
    path: '/add-offer/:id',
    component: AddOffer
  },
  {
    path: '/pack-details/:id',
    component: PackDetails
  },
  {
    path: '/edit-pack/:id',
    component: EditPack
  },
  {
    path: '/edit-offer/:id',
    component: EditOffer
  },
  {
    path: '/edit-price/:packId/store/:storeId',
    component: EditPrice
  },
  {
    path: '/retreive-password/:id',
    component: RetreivePassword,
  },
  {
    path: '/store-owners/:id',
    component: StoreOwners,
  },
  {
    path: '/locations/',
    component: Locations
  },
  {
    path: '/add-location/',
    component: AddLocation
  },
  {
    path: '/edit-location/:id',
    component: EditLocation
  },
  {
    path: '/ratings/',
    component: Ratings
  },
  {
    path: '/approvals/',
    component: Approvals
  },
  {
    path: '/logs/',
    component: Logs
  },
  {
    path: '/add-bulk/:id',
    component: AddBulk
  },
  {
    path: '/edit-bulk/:id',
    component: EditBulk
  },
  {
    path: '/invitations/',
    component: Invitations
  },
  {
    path: '/invitation-details/:userId/mobile/:mobile',
    component: InvitationDetails
  },
  {
    path: '/notifications/',
    component: Notifications
  },
  {
    path: '/add-notification/',
    component: AddNotification
  },
  {
    path: '/adverts/',
    component: Adverts
  },
  {
    path: '/add-advert/',
    component: AddAdvert
  },
  {
    path: '/advert-details/:id',
    component: AdvertDetails
  },
  {
    path: '/edit-advert/:id',
    component: EditAdvert
  },
  {
    path: '/permission-list/:id',
    component: PermissionList
  },
  {
    path: '/archived-products/',
    component: ArchivedProducts
  },
  {
    path: '/pack-types/',
    component: PackTypes
  },
  {
    path: '/add-pack-type/',
    component: AddPackType
  },
  {
    path: '/edit-pack-type/',
    component: EditPackType
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
]

export default routes