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
import Users from './pages/users'
import PasswordRequests from './pages/password-requests'
import AddPack from './pages/add-pack'
import PackDetails from './pages/pack-details'
import EditPack from './pages/edit-pack'
import EditCountry from './pages/edit-country'
import EditCategory from './pages/edit-category'
import EditStore from './pages/edit-store'
import RetreivePassword from './pages/retreive-password'
import StoreOwners from './pages/store-owners'
import ChangePassword from './pages/change-password'
import Locations from './pages/locations'
import AddLocation from './pages/add-location'
import EditLocation from './pages/edit-location'
import Approvals from './pages/approvals'
import AddPackStore from './pages/add-pack-store'
import Logs from './pages/logs'
import StoreDetails from './pages/store-details'
import ProductDetails from './pages/product-details'
import AddGroup from './pages/add-group'
import EditGroup from './pages/edit-group'
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
import ProductRequests from './pages/product-requests'
import ProductRequestDetails from './pages/product-request-details'

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
    path: '/users/:id',
    component: Users,
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
    path: '/add-group/:id',
    component: AddGroup
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
    path: '/edit-group/:id',
    component: EditGroup
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
    path: '/approvals/',
    component: Approvals
  },
  {
    path: '/logs/',
    component: Logs
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
    path: '/permission-list/',
    component: PermissionList
  },
  {
    path: '/archived-products/',
    component: ArchivedProducts
  },
  {
    path: '/product-requests/',
    component: ProductRequests
  },
  {
    path: '/product-request-details/:id',
    component: ProductRequestDetails
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
]

export default routes