import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const CustomerDetails = props => {
  const { state } = useContext(StoreContext)
  const customer = useMemo(() => state.customers.find(c => c.id === props.id)
  , [state.customers, props.id])
  const userInfo = useMemo(() => state.users.find(u => u.id === props.id)
  , [state.users, props.id])
  const storeName = useMemo(() => customer.storeId ? state.stores.find(s => s.id === customer.storeId).name : ''
  , [customer, state.stores])
  const otherMobileHolderName = useMemo(() => customer.otherMobileHolder ? state.otherMobileHolders.find(h => h.id === customer.otherMobileHolder).name : ''
  , [customer, state.otherMobileHolders])

  return (
    <Page>
      <Navbar title={state.labels.customerDetails} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="red" onClick={() => props.f7router.navigate(`/editCustomer/${props.id}`)}>
        <Icon material="edit"></Icon>
      </Fab>
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={userInfo.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="mobile" 
          label={state.labels.mobile}
          value={userInfo.mobile}
          type="number"
          readonly
        />
        <ListInput 
          name="orderLimit" 
          label={state.labels.orderLimit}
          value={(customer.orderLimit / 1000).toFixed(3)}
          floatingLabel 
          type="number"
          readonly
        />
        <ListItem>
          <span>{state.labels.isOldAge}</span>
          <Toggle color="blue" checked={customer.isOldAge} disabled />
        </ListItem>
        <ListItem>
          <span>{state.labels.isBlocked}</span>
          <Toggle color="blue" checked={customer.isBlocked} disabled />
        </ListItem>
        <ListInput 
          name="totalOrders" 
          label={state.labels.totalOrders}
          value={customer.totalOrders}
          floatingLabel 
          type="number"
          readonly
        />
        <ListInput 
          name="totalPayments" 
          label={state.labels.totalPayments}
          value={(customer.totalPayments / 1000).toFixed(3)}
          floatingLabel 
          type="number"
          readonly
        />
        <ListInput 
          name="locationName" 
          label={state.labels.location}
          value={state.locations.find(l => l.id === customer.locationId).name}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="invitationsDiscount" 
          label={state.labels.invitationsDiscount}
          value={(customer.invitationsDiscount / 1000).toFixed(3)}
          floatingLabel 
          type="number"
          readonly
        />
        <ListInput 
          name="priceAlarmsDiscount" 
          label={state.labels.priceAlarmsDiscount}
          value={(customer.priceAlarmsDiscount / 1000).toFixed(3)}
          floatingLabel 
          type="number"
          readonly
        />
        <ListInput 
          name="specialDiscount" 
          label={state.labels.specialDiscountPercent}
          value={`${customer.specialDiscountPercent} %`}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="overPriceLimit" 
          label={state.labels.overPriceLimit}
          value={(customer.overPriceLimit / 1000).toFixed(3)}
          floatingLabel 
          type="number"
          readonly
        />
        <ListInput 
          name="storeName" 
          label={state.labels.store}
          value={storeName}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="otherMobile" 
          label={state.labels.otherMobile}
          value={customer.otherMobile}
          type="number"
          readonly
        />
        <ListInput 
          name="otherMobileHolder" 
          label={state.labels.otherMobileHolder}
          value={otherMobileHolderName}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="address" 
          label={state.labels.address}
          value={customer.address}
          floatingLabel 
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
