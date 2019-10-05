import React, { useContext } from 'react'
import { Block, Page, Navbar, Card, CardContent, Icon, Fab, Toolbar, FabButtons, FabButton, CardFooter} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import { deleteStorePack, confirmPrice } from '../data/Actions'

const StorePackDetails = props => {
  const { state } = useContext(StoreContext)
  let pack = state.packs.find(rec => rec.id === props.packId)
  const product = state.products.find(rec => rec.id === pack.productId)
  pack = {
    ...pack,
    price: pack.stores.find(rec => rec.id === props.storeId).price
  }
  const store = state.stores.find(rec => rec.id === props.storeId)
  const handleEditPrice = () => {
    props.f7router.navigate(`/editPrice/${props.storeId}/pack/${props.packId}`)
  }
  const handleDelete = () => {
    deleteStorePack(store, pack).then(() => {
      props.f7router.navigate(`/store/${props.storeId}`)
    })
  }
  const handleConfirm = () => {
    confirmPrice(store, pack).then(() => {
      props.f7router.back()
    })
  }

  return (
    <Page>
      <Navbar title={`${product.name} - ${store.name}`} backLink={state.labels.back} />
      <Block>
        <Card className="demo-card-header-pic">
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
          </CardContent>
          <CardFooter>
            <p>{pack.name}</p>
            <p>{(pack.price / 1000).toFixed(3)}</p>
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

export default StorePackDetails
