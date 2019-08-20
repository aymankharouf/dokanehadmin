import React, { useContext } from 'react'
import { Block, Page, Navbar, Card, CardContent, Icon, Fab, Toolbar, FabButtons, FabButton, CardFooter} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import { deleteProduct, confirmPrice } from '../data/Actions'

const StoreProductDetails = props => {
  const { state, products } = useContext(StoreContext)
  let product = products.find(product => product.id === props.productId)
  product = {
    ...product,
    price: product.stores.find(rec => rec.id === props.storeId).price
  }
  const store = state.stores.find(rec => rec.id === props.storeId)
  const handleEditPrice = () => {
    props.f7router.navigate(`/editPrice/${props.storeId}/product/${props.productId}`)
  }
  const handleDelete = () => {
    if (window.confirm('Are you sure to delete this product from the store?')) {
    deleteProduct(store, product).then(() => props.f7router.navigate(`/store/${props.storeId}`))
    }
  }
  const handleConfirm = () => {
    confirmPrice(store, product).then(() => props.f7router.back())
  }

  return (
    <Page>
      <Navbar title={`${product.name} - ${store.name}`} backLink="Back" />
      <Block>
        <Card className="demo-card-header-pic">
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
          </CardContent>
          <CardFooter>
            <p>{product.description}</p>
            <p>{(product.price / 1000).toFixed(3)}</p>
          </CardFooter>
        </Card>
      </Block>
      <Fab position="right-bottom" slot="fixed" color="orange">
        <Icon ios="f7:chevron_up" aurora="f7:chevron_up" md="material:keyboard_arrow_up"></Icon>
        <Icon ios="f7:close" aurora="f7:close" md="material:close"></Icon>
        <FabButtons position="top">
          <FabButton color="blue" onClick={() => handleEditPrice()}>
            <Icon ios="f7:edit" aurora="f7:edit" md="material:edit"></Icon>
          </FabButton>
          <FabButton color="green" onClick={() => handleConfirm()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => handleDelete()}>
          <Icon ios="f7:trash" aurora="f7:trash" md="material:delete"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreProductDetails
