import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Card, CardContent, Icon, Fab, Toolbar, FabButtons, FabButton, CardFooter} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import { deleteStorePack, confirmPrice, haltOffer, showMessage } from '../data/Actions'

const StorePackDetails = props => {
  const { state } = useContext(StoreContext)
  const storePack = useMemo(() => state.storePacks.find(p => p.id === props.id)
  , [state.storePacks, props.id])
  const pack = useMemo(() => state.packs.find(p => p.id === storePack.packId)
  , [state.packs, storePack])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])

  const handleEditPrice = () => {
    props.f7router.navigate(`/editPrice/${storePack.id}`)
  }
  const handleDelete = () => {
    deleteStorePack(storePack, pack, state.storePacks).then(() => {
      showMessage(props, 'success', state.labels.deleteSuccess)
      props.f7router.back()
    })
  }
  const handleConfirmPrice = () => {
    confirmPrice(storePack).then(() => {
      showMessage(props, 'success', state.labels.approveSuccess)
      props.f7router.back()
    })
  }
  const handleHaltOffer = () => {
    const offerEndDate = new Date(storePack.offerEnd)
    const today = (new Date()).setHours(0, 0, 0, 0)
    let confirmation
    if (offerEndDate > today) {
      props.f7router.app.dialog.confirm(state.labels.confirmationText, () => {
        confirmation = true
      })
    } else {
      confirmation = true
    }
    if (!confirmation) return
    haltOffer(storePack, pack, state.storePacks).then(() => {
      showMessage(props, 'success', state.labels.haltSuccess)
      props.f7router.back()
    })
  }

  return (
    <Page>
      <Navbar title={`${product.name} - ${state.stores.find(s => s.id === storePack.storeId).name}`} backLink={state.labels.back} />
      <Block>
        <Card>
          <CardContent>
            <img src={product.imageUrl} className="img-card" alt={product.name} />
          </CardContent>
          <CardFooter>
            <p>{pack.name}</p>
            <p>{(storePack.price / 1000).toFixed(3)}</p>
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
          <FabButton color="green" onClick={() => handleConfirmPrice()}>
            <Icon material="done"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => handleDelete()}>
            <Icon material="delete"></Icon>
          </FabButton>
          {storePack.offerEnd ? 
            <FabButton color="red" onClick={() => handleHaltOffer()}>
              <Icon material="report_problem"></Icon>
            </FabButton>
            : ''
          }
        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StorePackDetails
