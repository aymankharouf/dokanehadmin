import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Page, Navbar, List, ListItem, Icon, Fab, Toolbar, FabButton, FabButtons, ListInput, BlockTitle } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import moment from 'moment'
import 'moment/locale/ar'
import { approveAlarm, rejectAlarm, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'

const AlarmDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [storeId, setStoreId] = useState('')
  const alarm = useMemo(() => state.alarms.find(a => a.id === props.id)
  , [state.alarms, props.id])
  const pack = useMemo(() => state.packs.find(p => p.id === alarm.packId)
  , [state.packs, alarm])
  const userInfo = useMemo(() => state.users.find(u => u.id === alarm.userId)
  , [state.users, alarm])
  const customerInfo = useMemo(() => state.customers.find(c => c.id === alarm.userId)
  , [state.customers, alarm])
  const storeName = useMemo(() => customerInfo.storeId ? state.stores.find(s => s.id === customerInfo.storeId).name : alarm.storeName
  , [customerInfo, state.stores, alarm])
  const storeLocation = useMemo(() => {
    const location = customerInfo.storeId ? state.stores.find(s => s.id === customerInfo.storeId).locationId : alarm.locationId
    return state.locations.find(l => l.id === location).name
  }, [customerInfo, state.stores, state.locations, alarm])
  const stores = useMemo(() => {
    const stores = state.stores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  }, [state.stores])
  const storePacks = useMemo(() => {
    let storePacks = state.storePacks.filter(p => p.packId === pack.id)
    storePacks = storePacks.map(p => {
      const currentStore = state.stores.find(st => st.id === p.storeId)
      return {
        ...p,
        currentStore
      }
    })
    return storePacks.sort((p1, p2) => p1.price - p2.price)
  }, [state.storePacks, state.stores, pack])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleApprove = async () => {
    try{
      await approveAlarm(alarm, pack, storeId, customerInfo, state.storePacks, state.packs)
      showMessage(labels.approveSuccess)
			props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleReject = async () => {
    try{
      await rejectAlarm(alarm)
      showMessage(labels.rejectSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={alarmTypes.find(t => t.id === alarm.alarmType).name} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="blue" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="keyboard_arrow_up"></Icon>
        <FabButtons position="bottom">
          {customerInfo.storeId || storeId ? 
            <FabButton color="green" onClick={() => handleApprove()}>
              <Icon material="done"></Icon>
            </FabButton>
          : ''}
          <FabButton color="red" onClick={() => handleReject()}>
          <Icon material="close"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <List form>
        <ListInput 
          name="userName" 
          label={labels.user}
          value={customerInfo.fullName || `${userInfo.name}:${userInfo.mobile}`}
          type="text" 
          readonly
        />
        <ListInput 
          name="productName" 
          label={labels.product}
          value={pack.productName}
          type="text" 
          readonly
        />
        <ListInput 
          name="packName" 
          label={labels.pack}
          value={pack.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="currentPrice" 
          label={labels.currentPrice}
          value={(pack.price / 1000).toFixed(3)}
          type="number" 
          readonly
        />
        <ListInput 
          name="newProduct" 
          label={labels.newProduct}
          value={alarm.newProduct}
          type="text" 
          readonly
        />
        <ListInput 
          name="newPack" 
          label={labels.newPack}
          value={alarm.newPack}
          type="text" 
          readonly
        />
        <ListInput 
          name="newPrice"
          label={labels.price}
          value={(alarm.price / 1000).toFixed(3)}
          type="number" 
          readonly
        />
        <ListInput 
          name="quantity"
          label={labels.quantity}
          value={alarm.quantity}
          type="number" 
          readonly
        />
        <ListInput 
          name="storeName" 
          label={labels.storeName}
          value={storeName}
          type="text" 
          readonly
        />
        <ListInput 
          name="storeLocation" 
          label={labels.location}
          value={storeLocation}
          type="text" 
          readonly
        />
        {customerInfo.storeId ? '' :
          <ListItem
            title={labels.store}
            smartSelect
            smartSelectParams={{
              openIn: "popup", 
              closeOnSelect: true, 
              searchbar: true, 
              searchbarPlaceholder: labels.search,
              popupCloseLinkText: labels.close
            }}
          >
            <select name="store" value={storeId} onChange={e => setStoreId(e.target.value)}>
              <option value=""></option>
              {stores.map(s => 
                <option key={s.id} value={s.id}>{s.name}</option>
              )}
            </select>
          </ListItem>
        }
      </List>
      <BlockTitle>
        {labels.prices}
      </BlockTitle>
        <List mediaList>
        {storePacks.map(p => 
          <ListItem 
            title={p.currentStore.name}
            subtitle={p.quantity ? `${state.labels.quantity}: ${p.quantity}` : ''}
            text={moment(p.time.toDate()).fromNow()} 
            after={(p.price / 1000).toFixed(3)} 
            key={p.id} 
          />
        )}
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default AlarmDetails
