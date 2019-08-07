import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DynamicRoutePage from './pages/DynamicRoutePage';
import NotFoundPage from './pages/NotFoundPage';
import PanelPage from './pages/PanelPage'
import Login from './pages/Login'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Basket from './pages/Basket'
import Stores from './pages/Stores';
import StoreProducts from './pages/StoreProducts';
import AddProduct from './pages/AddProduct';
import NewProduct from './pages/NewProduct';
import ActiveOrders from './pages/ActiveOrders';
import OrdersList from './pages/OrdersList';
import OrderDetails from './pages/OrderDetails';
import StoreProductDetails from './pages/StoreProductDetails';
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
import RequestedProducts from './pages/RequestedProducts';
import RequestedProductDetails from './pages/RequestedProductDetails';
import ConfirmPurchase from './pages/ConfirmPurchase';
import Purchases from './pages/Purchases';
import PurchaseDetails from './pages/PurchaseDetail';

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
    path: '/about/',
    component: AboutPage,
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
    path: '/countries/',
    component: Countries
  },
  {
    path: '/addCountry/',
    component: AddCountry,
  },
  {
    path: '/sections/',
    component: Sections
  },
  {
    path: '/addSection/',
    component: AddSection,
  },
  {
    path: '/section/:id',
    component: SectionCategories
  },
  {
    path: '/addCategory/:id',
    component: AddCategory
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
    path: '/store/:id',
    component: StoreProducts
  },
  {
    path: '/addProduct/:id',
    component: AddProduct
  },
  {
    path: '/newProduct/:id',
    component: NewProduct
  },
  {
    path: '/storeProduct/:storeId/product/:productId',
    component: StoreProductDetails
  },
  {
    path: '/editPrice/:storeId/product/:productId',
    component: EditPrice
  },
  {
    path: '/activeOrders/',
    component: ActiveOrders
  },
  {
    path: '/orders/',
    component: Orders
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
    path: '/requestedProducts/',
    component: RequestedProducts
  },
  {
    path: '/requestedProduct/:productId/quantity/:quantity',
    component: RequestedProductDetails
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
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },

];
