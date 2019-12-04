import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import PanelPage from './pages/PanelPage'
import Login from './pages/Login'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Basket from './pages/Basket'
import Stores from './pages/Stores';
import StorePacks from './pages/StorePacks';
import AddStorePack from './pages/AddStorePack';
import AddProduct from './pages/AddProduct';
import OrdersList from './pages/OrdersList';
import OrderDetails from './pages/OrderDetails';
import StorePackDetails from './pages/StorePackDetails';
import AddStore from './pages/AddStore';
import EditProduct from './pages/EditProduct';
import EditPrice from './pages/EditPrice';
import Countries from './pages/Countries';
import AddCountry from './pages/AddCountry';
import Settings from './pages/Settings';
import Sections from './pages/Sections';
import AddSection from './pages/AddSection';
import SectionCategories from './pages/SectionCategories';
import AddCategory from './pages/AddCategory';
import Trademarks from './pages/Trademarks';
import AddTrademark from './pages/AddTrademark';
import Orders from './pages/Orders';
import RequestedPacks from './pages/RequestedPacks';
import RequestedPackDetails from './pages/RequestedPackDetails';
import ConfirmPurchase from './pages/ConfirmPurchase';
import Purchases from './pages/Purchases';
import PurchaseDetails from './pages/PurchaseDetails';
import Stock from './pages/Stock';
import StockPackTrans from './pages/StockPackTrans';
import StockTrans from './pages/StockTrans';
import StockTransDetails from './pages/StockTransDetails';
import Customers from './pages/Customers';
import ForgetPassword from './pages/ForgetPassword';
import AddPack from './pages/AddPack';
import PackDetails from './pages/PackDetails';
import EditPack from './pages/EditPack';
import EditCountry from './pages/EditCountry';
import EditSection from './pages/EditSection';
import EditCategory from './pages/EditCategory';
import EditTrademark from './pages/EditTrademark';
import EditStore from './pages/EditStore';
import CustomerDetails from './pages/CustomerDetails';
import EditCustomer from './pages/EditCustomer';
import NewUsers from './pages/NewUsers';
import ApproveUser from './pages/ApproveUser';
import PriceAlarms from './pages/PriceAlarms';
import PriceAlarmDetails from './pages/PriceAlarmDetails';
import Offers from './pages/Offers';
import Spendings from './pages/Spendings';
import AddSpending from './pages/AddSpending';
import EditSpending from './pages/EditSpending';
import Profits from './pages/Profits';
import MonthlyTrans from './pages/MonthlyTrans';
import RetreivePassword from './pages/RetreivePassword';
import StoreOwners from './pages/StoreOwners';
import EditOrder from './pages/EditOrder';
import ChangePassword from './pages/ChangePassword';
import Locations from './pages/Locations';
import AddLocation from './pages/AddLocation';
import EditLocation from './pages/EditLocation';
import Ratings from './pages/Ratings';
import Approvals from './pages/Approvals';
import RatingDetails from './pages/RatingDetails';
import PackTrans from './pages/PackTrans';
import AddPackStore from './pages/AddPackStore';
import CancelOrders from './pages/CancelOrders';
import Logs from './pages/Logs';

export default [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/home/',
    component: HomePage,
  },
  {
    path: '/panel/',
    component: PanelPage
  },
  {
    path: '/login/',
    component: Login,
    options: {
      reloadCurrent: true,
    },
  },
  {
    path: '/panelLogin/',
    component: Login,
  },
  {
    path: '/changePassword/',
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
    path: '/product/:id',
    component: ProductDetails
  },
  {
    path: '/editProduct/:id',
    component: EditProduct
  },
  {
    path: '/basket/',
    component: Basket
  },
  {
    path: '/confirmPurchase/',
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
    path: '/addStore/',
    component: AddStore
  },
  {
    path: '/customers/',
    component: Customers,
  },
  {
    path: '/newUsers/',
    component: NewUsers
  },
  {
    path: '/approveUser/:id',
    component: ApproveUser
  },
  {
    path: '/customer/:id',
    component: CustomerDetails
  },
  {
    path: '/editCustomer/:id',
    component: EditCustomer
  },
  {
    path: '/store/:id',
    component: StorePacks
  },
  {
    path: '/forgetPassword/',
    component: ForgetPassword
  },
  {
    path: '/priceAlarms/',
    component: PriceAlarms
  },
  {
    path: '/priceAlarmDetails/:id',
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
    path: '/addCountry/',
    component: AddCountry
  },
  {
    path: '/editCountry/:id',
    component: EditCountry
  },
  {
    path: '/spendings/',
    component: Spendings
  },
  {
    path: '/addSpending/',
    component: AddSpending
  },
  {
    path: '/editSpending/:id',
    component: EditSpending
  },
  {
    path: '/sections/',
    component: Sections
  },
  {
    path: '/addSection/',
    component: AddSection
  },
  {
    path: '/section/:id',
    component: SectionCategories
  },
  {
    path: '/editSection/:id',
    component: EditSection
  },
  {
    path: '/addCategory/:id',
    component: AddCategory
  },
  {
    path: '/editCategory/:id',
    component: EditCategory
  },
  {
    path: '/trademarks/',
    component: Trademarks
  },
  {
    path: '/addTrademark/',
    component: AddTrademark,
  },
  {
    path: '/editTrademark/:id',
    component: EditTrademark,
  },
  {
    path: '/store/:id',
    component: StorePacks
  },
  {
    path: '/editStore/:id',
    component: EditStore
  },
  {
    path: '/addStorePack/:id',
    component: AddStorePack
  },
  {
    path: '/addPackStore/:id',
    component: AddPackStore
  },
  {
    path: '/addProduct/',
    component: AddProduct
  },
  {
    path: '/addPack/:id',
    component: AddPack
  },
  {
    path: '/packDetails/:id',
    component: PackDetails
  },
  {
    path: '/editPack/:id',
    component: EditPack
  },
  {
    path: '/storePack/:id',
    component: StorePackDetails
  },
  {
    path: '/editPrice/:id',
    component: EditPrice
  },
  {
    path: '/orders/',
    component: Orders,
  },
  {
    path: '/ordersList/:id',
    component: OrdersList,
  },
  {
    path: '/order/:id',
    component: OrderDetails
  },
  {
    path: '/cancelOrder/:id/cancelOrder/:cancelOrderId',
    component: OrderDetails
  },
  {
    path: '/editOrder/:id',
    component: EditOrder
  },
  {
    path: '/requestedPacks/',
    component: RequestedPacks
  },
  {
    path: '/requestedPack/:packId/quantity/:quantity/price/:price/order/:orderId',
    component: RequestedPackDetails
  },
  {
    path: '/purchases/',
    component: Purchases,
  },
  {
    path: '/purchase/:id',
    component: PurchaseDetails
  },
  {
    path: '/stock/',
    component: Stock,
  },
  {
    path: '/stockPackTrans/:id',
    component: StockPackTrans
  },
  {
    path: '/stockTrans/',
    component: StockTrans
  },
  {
    path: '/stockTrans/:id',
    component: StockTransDetails
  },
  {
    path: '/profits/',
    component: Profits,
  },
  {
    path: '/monthlyTrans/:id',
    component: MonthlyTrans,
  },
  {
    path: '/retreivePassword/:id',
    component: RetreivePassword,
  },
  {
    path: '/storeOwners/:id',
    component: StoreOwners,
  },
  {
    path: '/locations/',
    component: Locations
  },
  {
    path: '/addLocation/',
    component: AddLocation
  },
  {
    path: '/editLocation/:id',
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
    path: '/rating/:id',
    component: RatingDetails
  },
  {
    path: '/packTrans/:id',
    component: PackTrans
  },
  {
    path: '/cancelOrders/',
    component: CancelOrders
  },
  {
    path: '/logs/',
    component: Logs
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },

];
