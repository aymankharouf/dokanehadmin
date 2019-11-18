import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Card, CardContent, Icon, Fab, Toolbar, FabButtons, FabButton, CardFooter} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import { deleteStorePack, confirmPrice, showMessage } from '../data/Actions'

const StorePackDetails = props => {
  const { state } = useContext(StoreContext)
  const pack = useMemo(() => {
    let pack = state.packs.find(p => p.id === props.packId)
    return {
      ...pack,
      price: pack.stores.find(s => s.id === props.storeId).price
    }
  }, [state.packs, props.packId, props.storeId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const store = useMemo(() => state.stores.find(s => s.id === props.storeId)
  , [state.stores, props.storeId])
  const handleEditPrice = () => {
    props.f7router.navigate(`/editPrice/${props.storeId}/pack/${props.packId}`)
  }
  const handleDelete = () => {
    deleteStorePack(store, pack).then(() => {
      showMessage(props, 'success', state.labels.deleteSuccess)
      props.f7router.back()
    })
  }
  const handleConfirm = () => {
    confirmPrice(store, pack).then(() => {
      showMessage(props, 'success', state.labels.approveSuccess)
      props.f7router.back()
    })
  }

  return (
    <Page>
      <Navbar title={`${product.name} - ${store.name}`} backLink={state.labels.back} />
      <Block>
        <Card>
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt={product.name} />
          </CardContent>
          <CardFooter>
            <p>{pack.name}</p>
            <p>{(pack.price / 1000).toFixed(3)}</p>
          </CardFooter>
        </Card>
      </Block>
      <Fab position="left-top" slot="fixed" color="orange">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="blue" onClick={() => handleEditPrice()}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="green" onClick={() => handleConfirm()}>
            <Icon material="done"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => handleDelete()}>
            <Icon material="delete"></Icon>
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
