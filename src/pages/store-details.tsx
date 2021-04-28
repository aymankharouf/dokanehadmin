import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, FabButton, FabButtons, FabBackdrop } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const StoreDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [store, setStore] = useState(() => state.stores.find(s => s.id === props.id)!)
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === props.id)!)
  }, [state.stores, props.id])

  return (
    <Page>
      <Navbar title={labels.storeDetails} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          value={store.name}
          type="text" 
          readonly
        />
        <ListInput
          name="mobile"
          label={labels.mobile}
          value={store.mobile}
          type="number"
          readonly
        />
        <ListItem>
          <span>{labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={store.isActive} 
            disabled
          />
        </ListItem>
        <ListInput
          name="openTime"
          label={labels.location}
          value={state.locations.find(l => l.id === store.locationId)?.name || ''}
          type="text"
          readonly
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={store.address}
          type="text"
        />
      </List>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/store-packs/${props.id}`)}>
            <Icon material="shopping_cart"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => f7.views.current.router.navigate(`/edit-store/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => f7.views.current.router.navigate(`/store-owners/${store.id}`)}>
            <Icon material="perm_identity"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
    </Page>
  )
}
export default StoreDetails
