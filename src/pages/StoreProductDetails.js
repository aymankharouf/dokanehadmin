import React, { useContext } from 'react'
import { Block, Page, Navbar, Card, CardContent, Icon, Fab, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';

const StoreProductDetails = props => {
  const { products, stores } = useContext(StoreContext)
  const product = products.find(product => product.id === props.productId)
  const store = stores.find(rec => rec.id === props.storeId)
  const storePrice = product.stores.find(rec => rec.id === props.storeId).price
  const handleEditPrice = () => {
    props.f7router.navigate(`/editPrice/${props.storeId}/product/${props.productId}`)
  }

  return (
    <Page>
      <Navbar title={`${product.name} - ${store.name}`} backLink="Back" />
      <Block>
        <Card className="test">
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
            {storePrice}
          </CardContent>
        </Card>
      </Block>
      <Fab position="center-bottom" slot="fixed" text="Edit" color="red" onClick={() => handleEditPrice()}>
        <Icon ios="f7:edit" aurora="f7:edit" md="material:edit"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreProductDetails
