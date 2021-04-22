import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, ListItem, Toggle, FabBackdrop, FabButton, FabButtons } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const CustomerDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [customer, setCustomer] = useState(() => state.customers.find(c => c.id === props.id)!)
  const [userInfo, setUserInfo] = useState(() => state.users.find(u => u.id === props.id)!)
  const [storeName] = useState(() => state.stores.find(s => s.id === customer.storeId)?.name)
  useEffect(() => {
    setCustomer(() => state.customers.find(c => c.id === props.id)!)
    setUserInfo(() => state.users.find(u => u.id === props.id)!)
  }, [state.customers, state.users, props.id])
  return (
    <Page>
      <Navbar title={labels.customerDetails} backLink={labels.back} />
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="blue" onClick={() => f7.views.current.router.navigate(`/edit-customer/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          value={userInfo.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="fullName" 
          label={labels.fullName}
          value={customer.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="locationName" 
          label={labels.location}
          value={state.locations.find(l => l.id === userInfo.locationId)?.name}
          type="text"
          readonly
        />
        <ListInput 
          name="discounts" 
          label={labels.discountBalance}
          value={(customer.discounts / 100).toFixed(2)}
          type="number"
          readonly
        />
        <ListInput 
          name="specialDiscount"
          label={labels.specialDiscount}
          value={(customer.specialDiscount / 100).toFixed(2)}
          type="number"
          readonly
        />
        <ListInput 
          name="storeName" 
          label={labels.store}
          value={storeName}
          type="text"
          readonly
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={customer.address}
          type="text" 
          readonly
        />
        <ListItem>
          <span>{labels.isBlocked}</span>
          <Toggle color="red" checked={customer.isBlocked} disabled />
        </ListItem>
      </List>
    </Page>
  )
}
export default CustomerDetails
