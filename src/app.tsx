import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import StateProvider from './data/state-provider'


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './css/variables.css';
import './css/app.css';

import Home from './pages/home'
import Panel from './pages/panel'
import Login from './pages/login'
import Register from './pages/register'
import Settings from './pages/settings'
import Approvals from './pages/approvals'
import Countries from './pages/countries'
import AddCountry from './pages/add-country'
import EditCountry from './pages/edit-country'
import Locations from './pages/locations'
import AddLocation from './pages/add-location'
import EditLocation from './pages/edit-location'
import Trademarks from './pages/trademarks'
import AddTrademark from './pages/add-trademark'
import EditTrademark from './pages/edit-trademark'
import UserTypes from './pages/user-types'
import Users from './pages/users'
import Stores from './pages/stores'
import AddStore from './pages/add-store'
import EditStore from './pages/edit-store'
import Notifications from './pages/notifications'
import AddNotification from './pages/add-notification'
import Logs from './pages/logs'
import PasswordRequests from './pages/password-requests'
import RetreivePassword from './pages/retreive-password'
import ChangePassword from './pages/change-password'
import PermissionList from './pages/permission-list'
import PermitUser from './pages/permit-user'
import Categories from './pages/categories'
import AddCategory from './pages/add-category'
import EditCategory from './pages/edit-category'
import Products from './pages/products'
import ProductPacks from './pages/product-packs'
import AddPack from './pages/add-pack'
import AddGroup from './pages/add-group'
import EditPack from './pages/edit-pack'
import EditGroup from './pages/edit-group'
import AddProduct from './pages/add-product'
import EditProduct from './pages/edit-product'
import Adverts from './pages/adverts'
import AddAdvert from './pages/add-advert'
import EditAdvert from './pages/edit-advert'
import AddStorePack from './pages/add-store-pack'
import AddPackStore from './pages/add-pack-store'
import StoreDetails from './pages/store-details'
import AdvertDetails from './pages/advert-details'
import ArchivedProducts from './pages/archived-products'
import StorePacks from './pages/store-packs'
import PackDetails from './pages/pack-details'
import ProductRequests from './pages/product-requests'
import ProductRequestDetails from './pages/product-request-details'
import PackRequests from './pages/pack-requests'
import PackRequestDetails from './pages/pack-request-details'

const app = () => {
  return (
    <StateProvider>
      <IonApp dir="rtl">
        <IonReactRouter>
          <IonSplitPane contentId="main">
            <Panel />
            <IonRouterOutlet id="main" mode="ios">
              <Route path="/" exact={true} component={Home} />
              <Route path="/login" exact={true} component={Login} />
              <Route path="/register" exact={true} component={Register} />
              <Route path="/settings" exact={true} component={Settings} />
              <Route path="/approvals" exact={true} component={Approvals} />
              <Route path="/countries" exact={true} component={Countries} />
              <Route path="/add-country" exact={true} component={AddCountry} />
              <Route path="/edit-country/:id" exact={true} component={EditCountry} />
              <Route path="/locations" exact={true} component={Locations} />
              <Route path="/add-location" exact={true} component={AddLocation} />
              <Route path="/edit-location/:id" exact={true} component={EditLocation} />
              <Route path="/trademarks" exact={true} component={Trademarks} />
              <Route path="/add-trademark" exact={true} component={AddTrademark} />
              <Route path="/edit-trademark/:id" exact={true} component={EditTrademark} />
              <Route path="/user-types" exact={true} component={UserTypes} />
              <Route path="/users/:id" exact={true} component={Users} />
              <Route path="/stores" exact={true} component={Stores} />
              <Route path="/add-store" exact={true} component={AddStore} />
              <Route path="/edit-store/:id" exact={true} component={EditStore} />
              <Route path="/notifications" exact={true} component={Notifications} />
              <Route path="/add-notification" exact={true} component={AddNotification} />
              <Route path="/logs" exact={true} component={Logs} />
              <Route path="/password-requests" exact={true} component={PasswordRequests} />
              <Route path="/retreive-password/:id" exact={true} component={RetreivePassword} />
              <Route path="/change-password" exact={true} component={ChangePassword} />
              <Route path="/permission-list" exact={true} component={PermissionList} />
              <Route path="/permit-user/:id" exact={true} component={PermitUser} />
              <Route path="/categories/:id" exact={true} component={Categories} />
              <Route path="/add-category/:id" exact={true} component={AddCategory} />
              <Route path="/edit-category/:id" exact={true} component={EditCategory} />
              <Route path="/products/:id" exact={true} component={Products} />
              <Route path="/product-packs/:id/:type" exact={true} component={ProductPacks} />
              <Route path="/add-pack/:productId/:requestId" exact={true} component={AddPack} />
              <Route path="/add-group/:productId/:requestId" exact={true} component={AddGroup} />
              <Route path="/edit-pack/:id" exact={true} component={EditPack} />
              <Route path="/edit-group/:id" exact={true} component={EditGroup} />
              <Route path="/add-product/:id" exact={true} component={AddProduct} />
              <Route path="/edit-product/:id" exact={true} component={EditProduct} />
              <Route path="/adverts" exact={true} component={Adverts} />
              <Route path="/add-advert" exact={true} component={AddAdvert} />
              <Route path="/edit-advert/:id" exact={true} component={EditAdvert} />
              <Route path="/add-pack-store/:id" exact={true} component={AddPackStore} />
              <Route path="/add-store-pack/:storeId/:requestId" exact={true} component={AddStorePack} />
              <Route path="/store-details/:id" exact={true} component={StoreDetails} />
              <Route path="/advert-details/:id" exact={true} component={AdvertDetails} />
              <Route path="/archived-products" exact={true} component={ArchivedProducts} />
              <Route path="/store-packs/:id" exact={true} component={StorePacks} />
              <Route path="/pack-details/:id" exact={true} component={PackDetails} />
              <Route path="/product-requests" exact={true} component={ProductRequests} />
              <Route path="/product-request-details/:id" exact={true} component={ProductRequestDetails} />
              <Route path="/pack-requests" exact={true} component={PackRequests} />
              <Route path="/pack-request-details/:id" exact={true} component={PackRequestDetails} />
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
      </IonApp>
    </StateProvider>
  );
};

export default app;

