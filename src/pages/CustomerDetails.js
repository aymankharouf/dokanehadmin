import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'
import labels from '../data/labels'


const CustomerDetails = props => {
  const { state } = useContext(StoreContext)
  const customer = useMemo(() => state.customers.find(c => c.id === props.id)
  , [state.customers, props.id])
  const userInfo = useMemo(() => state.users.find(u => u.id === props.id)
  , [state.users, props.id])
  const customerOrders = useMemo(() => state.orders.filter(o => o.userId === props.id && o.status === 'd')
  , [state.orders, props.id])
  const storeName = useMemo(() => customer.storeId ? state.stores.find(s => s.id === customer.storeId).name : ''
  , [customer, state.stores])
  const otherMobileHolderName = useMemo(() => customer.otherMobileHolder ? state.otherMobileHolders.find(h => h.id === customer.otherMobileHolder).name : ''
  , [customer, state.otherMobileHolders])

  return (
    <Page>
      <Navbar title={labels.customerDetails} backLink={labels.back} />
      {props.full === '0' ? '' :
        <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/editCustomer/${props.id}`}>
          <Icon material="edit"></Icon>
        </Fab>
      }
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={userInfo.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="mobile" 
          label={labels.mobile}
          value={userInfo.mobile}
          type="number"
          readonly
        />
        {props.full === '0' ? '' :
          <ListInput 
            name="orderLimit" 
            label={labels.orderLimit}
            value={(customer.orderLimit / 1000).toFixed(3)}
            floatingLabel 
            type="number"
            readonly
          />
        }
        <ListItem>
          <span>{labels.isOldAge}</span>
          <Toggle color="blue" checked={customer.isOldAge} disabled />
        </ListItem>
        {props.full === '0' ? '' :
          <ListItem>
            <span>{labels.isBlocked}</span>
            <Toggle color="blue" checked={customer.isBlocked} disabled />
          </ListItem>
        }
        {props.full === '0' ? '' :
          <ListItem>
            <span>{labels.exceedPrice}</span>
            <Toggle color="blue" checked={customer.exceedPrice} disabled />
          </ListItem>
        }
        {props.full === '0' ? '' :
          <ListInput 
            name="totalOrders" 
            label={labels.totalOrders}
            value={customerOrders.length}
            floatingLabel 
            type="number"
            readonly
          />
        }
        <ListInput 
          name="locationName" 
          label={labels.location}
          value={state.locations.find(l => l.id === customer.locationId).name}
          floatingLabel 
          type="text"
          readonly
        />
        {props.full === '0' ? '' :
          <ListInput 
            name="discounts" 
            label={labels.discountBalance}
            value={(customer.discounts / 1000).toFixed(3)}
            floatingLabel 
            type="number"
            readonly
          />
        }
        {props.full === '0' ? '' :
          <ListInput 
            name="deliveryFees" 
            label={labels.deliveryFees}
            value={(customer.deliveryFees / 1000).toFixed(3)}
            floatingLabel 
            type="number"
            readonly
          />
        }
        {props.full === '0' ? '' :
          <ListInput 
            name="storeName" 
            label={labels.store}
            value={storeName}
            floatingLabel 
            type="text"
            readonly
          />
        }
        <ListInput 
          name="otherMobile" 
          label={labels.otherMobile}
          value={customer.otherMobile}
          type="number"
          readonly
        />
        <ListInput 
          name="otherMobileHolder" 
          label={labels.otherMobileHolder}
          value={otherMobileHolderName}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="address" 
          label={labels.address}
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
