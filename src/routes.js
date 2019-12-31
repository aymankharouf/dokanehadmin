import Home from './pages/home'
import NotFoundPage from './pages/not-found-page'
import Panel from './pages/panel'
import Login from './pages/login'
import Products from './pages/products'
import ProductPacks from './pages/product-packs'
import Basket from './pages/basket'
import Stores from './pages/stores'
import StorePacks from './pages/store-packs'
import AddStorePack from './pages/add-store-pack'
import AddProduct from './pages/add-product'
import OrdersList from './pages/orders-list'
import OrderDetails from './pages/order-details'
import StorePackDetails from './pages/store-pack-details'
import AddStore from './pages/add-store'
import EditProduct from './pages/edit-product'
import EditPrice from './pages/edit-price'
import Countries from './pages/countries'
import AddCountry from './pages/add-country'
import Settings from './pages/settings'
import Sections from './pages/sections'
import AddSection from './pages/add-section'
import SectionCategories from './pages/section-categories'
import AddCategory from './pages/add-category'
import Trademarks from './pages/trademarks'
import AddTrademark from './pages/add-trademark'
import Orders from './pages/orders'
import RequestedPacks from './pages/requested-packs'
import RequestedPackDetails from './pages/requested-pack-details'
import ConfirmPurchase from './pages/confirm-purchase'
import Purchases from './pages/purchases'
import PurchaseDetails from './pages/purchase-details'
import Stock from './pages/stock'
import StockPackTrans from './pages/stock-pack-trans'
import StockTrans from './pages/stock-trans'
import StockTransDetails from './pages/stock-trans-details'
import Customers from './pages/customers'
import ForgetPassword from './pages/forget-password'
import AddPack from './pages/add-pack'
import PackDetails from './pages/pack-details'
import EditPack from './pages/edit-pack'
import EditCountry from './pages/edit-country'
import EditSection from './pages/edit-section'
import EditCategory from './pages/edit-category'
import EditTrademark from './pages/edit-trademark'
import EditStore from './pages/edit-store'
import CustomerDetails from './pages/customer-details'
import EditCustomer from './pages/edit-customer'
import NewUsers from './pages/new-users'
import ApproveUser from './pages/approve-user'
import PriceAlarms from './pages/price-alarms'
import PriceAlarmDetails from './pages/price-alarm-details'
import Offers from './pages/offers'
import Spendings from './pages/spendings'
import AddSpending from './pages/add-spending'
import EditSpending from './pages/edit-spending'
import Profits from './pages/profits'
import MonthlyTrans from './pages/monthly-trans'
import RetreivePassword from './pages/retreive-password'
import StoreOwners from './pages/store-owners'
import EditOrder from './pages/edit-order'
import ChangePassword from './pages/change-password'
import Locations from './pages/locations'
import AddLocation from './pages/add-location'
import EditLocation from './pages/edit-location'
import Ratings from './pages/ratings'
import Approvals from './pages/approvals'
import RatingDetails from './pages/rating-details'
import PackTrans from './pages/pack-trans'
import AddPackStore from './pages/add-pack-store'
import CancelRequests from './pages/cancel-requests'
import Logs from './pages/logs'
import Prices from './pages/prices'
import StoreDetails from './pages/store-details'
import PrepareOrders from './pages/prepare-orders'
import PrepareOrdersList from './pages/prepare-orders-list'
import ReturnOrder from './pages/return-order'
import ReturnOrderPack from './pages/return-order-pack'
import FollowupOrders from './pages/followup-orders'
import FollowupOrdersList from './pages/followup-orders-list'
import FollowupOrderDetails from './pages/followup-order-details'
import SellStore from './pages/sell-store'
import ProductDetails from './pages/product-details'
import AddOffer from './pages/add-offer'
import EditOffer from './pages/edit-offer'
import Tags from './pages/tags'
import AddTag from './pages/add-tag'
import EditTag from './pages/edit-tag'
import RelatedProducts from './pages/related-products'
import AddBulk from './pages/add-bulk'
import EditBulk from './pages/edit-bulk'

export default [
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
    path: '/search/',
    component: Products
  },
  {
    path: '/products/',
    component: Products,
  },
  {
    path: '/product-packs/:id',
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
    path: '/basket/',
    component: Basket,
  },
  {
    path: '/confirm-purchase/',
    component: ConfirmPurchase
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
    path: '/prices/',
    component: Prices,
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
    path: '/customer-details/:id/full/:full',
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
    path: '/forget-password/',
    component: ForgetPassword
  },
  {
    path: '/price-alarms/',
    component: PriceAlarms
  },
  {
    path: '/price-alarm-details/:id',
    component: PriceAlarmDetails
  },
  {
    path: '/offers/',
    component: Offers
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
    path: '/spendings/',
    component: Spendings
  },
  {
    path: '/add-spending/',
    component: AddSpending
  },
  {
    path: '/edit-spending/:id',
    component: EditSpending
  },
  {
    path: '/sections/',
    component: Sections
  },
  {
    path: '/add-section/',
    component: AddSection
  },
  {
    path: '/section-categories/:id',
    component: SectionCategories
  },
  {
    path: '/edit-section/:id',
    component: EditSection
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
    path: '/trademarks/',
    component: Trademarks
  },
  {
    path: '/add-trademark/',
    component: AddTrademark,
  },
  {
    path: '/edit-trademark/:id',
    component: EditTrademark,
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
    path: '/add-product/',
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
    path: '/store-pack-details/:id',
    component: StorePackDetails
  },
  {
    path: '/edit-price/:id',
    component: EditPrice
  },
  {
    path: '/orders/',
    component: Orders,
  },
  {
    path: '/orders-list/:id',
    component: OrdersList,
  },
  {
    path: '/order-details/:id',
    component: OrderDetails
  },
  {
    path: '/cancel-order/:id/request/:requestId',
    component: OrderDetails
  },
  {
    path: '/edit-order/:id',
    component: EditOrder
  },
  {
    path: '/requested-packs/',
    component: RequestedPacks
  },
  {
    path: '/requested-pack-details/:packId/quantity/:quantity/price/:price/order/:orderId/exceed-price-quantity/:exceedPriceQuantity',
    component: RequestedPackDetails
  },
  {
    path: '/purchases/',
    component: Purchases,
  },
  {
    path: '/purchase-details/:id',
    component: PurchaseDetails
  },
  {
    path: '/stock/',
    component: Stock,
  },
  {
    path: '/stock-pack-trans/:id',
    component: StockPackTrans
  },
  {
    path: '/stock-trans/',
    component: StockTrans
  },
  {
    path: '/stock-trans-details/:id',
    component: StockTransDetails
  },
  {
    path: '/profits/',
    component: Profits,
  },
  {
    path: '/monthly-trans/:id',
    component: MonthlyTrans,
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
    path: '/rating-details/:id',
    component: RatingDetails
  },
  {
    path: '/pack-trans/:id',
    component: PackTrans
  },
  {
    path: '/cancel-requests/',
    component: CancelRequests
  },
  {
    path: '/logs/',
    component: Logs
  },
  {
    path: '/prepare-orders/',
    component: PrepareOrders
  },
  {
    path: '/prepare-orders-list/:packId/order/:orderId',
    component: PrepareOrdersList
  },
  {
    path: '/return-order/:id',
    component: ReturnOrder
  },
  {
    path: '/return-order-pack/:orderId/pack/:packId',
    component: ReturnOrderPack
  },
  {
    path: '/followup-orders/',
    component: FollowupOrders
  },
  {
    path: '/followup-orders-list/:id',
    component: FollowupOrdersList
  },
  {
    path: '/followup-order-details/:id',
    component: FollowupOrderDetails
  },
  {
    path: '/sell-store/:id',
    component: SellStore
  },
  {
    path: '/tags/',
    component: Tags
  },
  {
    path: '/add-tag/',
    component: AddTag
  },
  {
    path: '/edit-tag/:id',
    component: EditTag
  },
  {
    path: '/related-products/:id',
    component: RelatedProducts
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
    path: '(.*)',
    component: NotFoundPage,
  },

]
