import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FormPage from './pages/FormPage';
import DynamicRoutePage from './pages/DynamicRoutePage';
import NotFoundPage from './pages/NotFoundPage';
import PanelPage from './pages/PanelPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Categories from './pages/Categories'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Basket from './pages/Basket'
import ConfirmOrder from './pages/ConfirmOrder'
import Search from './pages/Search'
import Stores from './pages/Stores';
import StoreSections from './pages/StoreSections';
import StoreCategories from './pages/StoreCategories';
import StoreProducts from './pages/StoreProducts';
import AddProduct from './pages/AddProduct';
import NewProduct from './pages/NewProduct';
import ActiveOrders from './pages/ActiveOrders';
import OrdersList from './pages/OrdersList';
import OrderDetails from './pages/OrderDetails';
import StoreProductDetails from './pages/StoreProductDetails';

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
    path: '/form/',
    component: FormPage,
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
    path: '/register/:callingPage',
    component: Register
  },
  {
    path: '/section/:id',
    component: Categories
  },
  {
    path: '/category/:id',
    component: Products
  },
  {
    path: '/product/:id',
    component: ProductDetails
  },
  {
    path: '/basket/',
    component: Basket
  },
  {
    path: '/confirmOrder/',
    component: ConfirmOrder
  },
  {
    path: '/search/',
    component: Search,
  },
  {
    path: '/stores/',
    component: Stores
  },
  {
    path: '/store/:id',
    component: StoreSections
  },
  {
    path: '/storeSection/:storeId/section/:sectionId',
    component: StoreCategories
  },
  {
    path: '/storeCategory/:storeId/category/:categoryId',
    component: StoreProducts
  },
  {
    path: '/addProduct/:storeId/category/:categoryId',
    component: AddProduct
  },
  {
    path: '/newProduct/:storeId/category/:categoryId',
    component: NewProduct
  },
  {
    path: '/storeProduct/:storeId/product/:productId',
    component: StoreProductDetails
  },
  {
    path: '/activeOrders/',
    component: ActiveOrders
  },
  {
    path: '/ordersList/',
    component: OrdersList
  },
  {
    path: '/order/:id',
    component: OrderDetails
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
