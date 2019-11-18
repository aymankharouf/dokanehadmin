import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const CustomerDetails = props => {
  const { state } = useContext(StoreContext)
  const customer = useMemo(() => state.customers.find(rec => rec.id === props.id)
  , [state.customers, props.id])
  const userInfo = useMemo(() => state.users.find(rec => rec.id === props.id)
  , [state.users, props.id])
  const storeName = useMemo(() => customer.storeId ? state.stores.find(rec => rec.id === customer.storeId).name : ''
  , [customer, state.stores])
  const locationName = useMemo(() => customer.locationId ? state.locations.find(rec => rec.id === customer.locationId).name : ''
  , [customer, state.locations])
  const typeName = useMemo(() => state.customerTypes.find(rec => rec.id === customer.type).name
  , [state.customerTypes, customer])

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
          floatingLabel 
          type="text" 
          readonly
        />
        <ListInput 
          name="mobile" 
          label={state.labels.mobile}
          value={userInfo.mobile}
          floatingLabel 
          type="number"
          readonly
        />
        <ListInput 
          name="type" 
          label={state.labels.type}
          value={typeName}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="limit" 
          label={state.labels.limit}
          value={(customer.limit / 1000).toFixed(3)}
          floatingLabel 
          type="number"
          readonly
        />
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
          value={locationName}
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
          name="storeName" 
          label={state.labels.store}
          value={storeName}
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
