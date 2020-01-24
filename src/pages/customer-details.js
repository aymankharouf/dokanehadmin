import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { deliveryIntervals } from '../data/config'

const CustomerDetails = props => {
  const { state } = useContext(StoreContext)
  const customer = useMemo(() => state.customers.find(c => c.id === props.id)
  , [state.customers, props.id])
  const storeName = useMemo(() => state.stores.find(s => s.id === customer.storeId)?.name || ''
  , [customer, state.stores])

  return (
    <Page>
      <Navbar title={labels.customerDetails} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/edit-customer/${props.id}`}>
        <Icon material="edit"></Icon>
      </Fab>
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={customer.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="fullName" 
          label={labels.fullName}
          value={customer.fullName}
          type="text" 
          readonly
        />
        <ListInput 
          name="orderLimit" 
          label={labels.orderLimit}
          value={(customer.orderLimit / 1000).toFixed(3)}
          type="number"
          readonly
        />
        <ListItem>
          <span>{labels.isOldAge}</span>
          <Toggle color="blue" checked={customer.isOldAge} disabled />
        </ListItem>
        <ListItem>
          <span>{labels.isBlocked}</span>
          <Toggle color="blue" checked={customer.isBlocked} disabled />
        </ListItem>
        <ListItem>
          <span>{labels.exceedPrice}</span>
          <Toggle color="blue" checked={customer.exceedPrice} disabled />
        </ListItem>
        <ListInput 
          name="totalOrders" 
          label={labels.totalOrders}
          value={customer.ordersCount}
          type="number"
          readonly
        />
        <ListInput 
          name="totalDeliveredOrders" 
          label={labels.totalDeliveredOrders}
          value={customer.deliveredOrdersCount}
          type="number"
          readonly
        />
        <ListInput 
          name="locationName" 
          label={labels.location}
          value={state.locations.find(l => l.id === customer.locationId).name}
          type="text"
          readonly
        />
        <ListInput 
          name="discounts" 
          label={labels.discountBalance}
          value={(customer.discounts / 1000).toFixed(3)}
          type="number"
          readonly
        />
        <ListInput 
          name="deliveryFees"
          label={labels.deliveryDiscount}
          value={(customer.deliveryDiscount / 1000).toFixed(3)}
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
          name="otherMobile" 
          label={labels.otherMobile}
          value={customer.otherMobile}
          type="number"
          readonly
        />
        <ListInput 
          name="deliveryInterval" 
          label={labels.deliveryInterval}
          value={deliveryIntervals.find(i => i.id === customer.deliveryInterval)?.name || ''}
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
      </List>
      <Toolbar bottom>
        <BottomToolbar />
      </Toolbar>
    </Page>
  )
}
export default CustomerDetails
