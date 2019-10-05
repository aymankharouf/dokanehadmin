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
import PackTrans from './pages/PackTrans';
import StockTrans from './pages/StockTrans';
import StockTransDetails from './pages/StockTransDetails';
import EditOrder from './pages/EditOrder';
import Customers from './pages/Customers';
import ForgetPassword from './pages/ForgetPassword';
import AddPack from './pages/AddPack';
import AddPackComponent from './pages/AddPackComponent';
import PackDetails from './pages/PackDetails';
import EditPack from './pages/EditPack';
import EditCountry from './pages/EditCountry';
import EditSection from './pages/EditSection';
import EditCategory from './pages/EditCategory';
import EditTrademark from './pages/EditTrademark';
import EditStore from './pages/EditStore';
import CustomersList from './pages/CustomersList';
import CustomerDetails from './pages/CustomerDetails';
import EditCustomer from './pages/EditCustomer';
import NewUsers from './pages/NewUsers';
import ApproveUser from './pages/ApproveUser';
import PriceAlarms from './pages/PriceAlarms';
import PriceAlarmDetails from './pages/PriceAlarmDetails';

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
    path: '/login/:callingPage',
    component: Login
  },
  {
    path: '/search/',
    component: Products
  },
  {
    path: '/products/',
    component: Products
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
    component: Stores
  },
  {
    path: '/addStore/',
    component: AddStore
  },
  {
    path: '/customers/',
    component: Customers
  },
  {
    path: '/customersList/:id',
    component: CustomersList
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
    path: '/countries/',
    component: Countries
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
    path: '/addProduct/',
    component: AddProduct
  },
  {
    path: '/addPack/:id',
    component: AddPack
  },
  {
    path: '/addPackComponent/',
    component: AddPackComponent
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
    path: '/storePack/:storeId/pack/:packId',
    component: StorePackDetails
  },
  {
    path: '/editPrice/:storeId/pack/:packId',
    component: EditPrice
  },
  {
    path: '/orders/',
    component: Orders,
    options: {
      animate: true,
    },
  },
  {
    path: '/ordersList/:id',
    component: OrdersList
  },
  {
    path: '/order/:id',
    component: OrderDetails
  },
  {
    path: '/requestedPacks/',
    component: RequestedPacks
  },
  {
    path: '/editOrder/:id',
    component: EditOrder
  },
  {
    path: '/requestedPack/:packId/quantity/:quantity/price/:price',
    component: RequestedPackDetails
  },
  {
    path: '/purchases/',
    component: Purchases
  },
  {
    path: '/purchase/:id',
    component: PurchaseDetails
  },
  {
    path: '/stock/',
    component: Stock
  },
  {
    path: '/packTrans/:id',
    component: PackTrans
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
    path: '(.*)',
    component: NotFoundPage,
  },

];
