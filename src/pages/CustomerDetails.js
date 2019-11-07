import React, { useContext, useMemo } from 'react'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const CustomerDetails = props => {
  const { state } = useContext(StoreContext)
  const customer = useMemo(() => state.customers.find(rec => rec.id === props.id), [state.customers])
  const userInfo = useMemo(() => state.users.find(rec => rec.id === props.id), [state.users])
  const storeName = useMemo(() => customer.storeId ? state.stores.find(rec => rec.id === customer.storeId).name : '', [customer, state.stores])
  const typeName = useMemo(() => state.customerTypes.find(rec => rec.id === customer.type).name , [state.customerTypes])

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
          name="deliveryFees" 
          label={state.labels.deliveryFees}
          value={(customer.deliveryFees / 1000).toFixed(3)}
          floatingLabel 
          type="number"
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
          name="lessPriceDiscount" 
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
