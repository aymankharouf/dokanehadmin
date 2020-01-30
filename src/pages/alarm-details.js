import React, { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, Icon, Fab, Toolbar, FabButton, FabButtons, ListInput, BlockTitle } from 'framework7-react'
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
  const [inprocess, setInprocess] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [newPackId, setNewPackId] = useState('')
  const [userInfo] = useState(() => state.users.find(u => u.id === props.userId))
  const [customerInfo] = useState(() => state.customers.find(c => c.id === props.userId))
  const [alarm] = useState(() => userInfo.alarms.find(a => a.id === props.id))
  const [pack] = useState(() => state.packs.find(p => p.id === alarm.packId))
  const [storeName] = useState(() => state.stores.find(s => s.id === customerInfo.storeId)?.name || alarm.storeName)
  const [stores] = useState(() => {
    const stores = state.stores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  })
  const [packs] = useState(() => {
    let packs = state.packs.filter(p => p.id !== pack.id)
    if (alarm.type === '8') {
      packs = packs.filter(p => p.productId === pack.productId && p.isOffer)
    } else if (alarmTypes.type === '7') {
      packs = packs.filter(p => p.productId === pack.productId && p.isOffer && p.closeExpired)
    }
    packs = packs.map(p => {
      return {
        id: p.id,
        name: `${p.productName} ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  })
  const [storePacks, setStorePacks] = useState([])
  useEffect(() => {
    setStorePacks(() => {
      let storePacks = state.storePacks.filter(p => p.packId === (newPackId || pack.id))
      storePacks = storePacks.map(p => {
        const currentStore = state.stores.find(st => st.id === p.storeId)
        return {
          ...p,
          currentStore
        }
      })
      return storePacks.sort((p1, p2) => p1.price - p2.price)
    })
  }, [state.storePacks, state.stores, pack, newPackId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleApprove = async () => {
    try{
      setInprocess(true)
      await approveAlarm(userInfo, alarm, pack, storeId, newPackId, customerInfo, state.storePacks, state.packs, state.users)
      setInprocess(false)
      showMessage(labels.approveSuccess)
			props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  const handleReject = async () => {
    try{
      setInprocess(true)
      await rejectAlarm(userInfo, alarm.id)
      setInprocess(false)
      showMessage(labels.rejectSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={alarmTypes.find(t => t.id === alarm.type).name} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="blue" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="keyboard_arrow_up"></Icon>
        <FabButtons position="bottom">
          {(!customerInfo.storeId && !storeId) || (!newPackId && ['5', '6', '7', '8'].includes(alarm.type)) ? '' : 
            <FabButton color="green" onClick={() => handleApprove()}>
              <Icon material="done"></Icon>
            </FabButton>
          }
          <FabButton color="red" onClick={() => handleReject()}>
          <Icon material="close"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <List form>
        <ListInput 
          name="userName" 
          label={labels.user}
          value={customerInfo.fullName}
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
        {['5', '6'].includes(alarm.type) ? 
          <ListInput 
            name="alternative" 
            label={labels.alternative}
            value={alarm.alternative}
            type="text" 
            readonly
          />
        : ''}
        <ListInput 
          name="newPrice"
          label={labels.price}
          value={(alarm.price / 1000).toFixed(3)}
          type="number" 
          readonly
        />
        {['7', '8'].includes(alarm.type) ? 
          <ListInput 
            name="quantity"
            label={labels.quantity}
            value={alarm.quantity}
            type="number" 
            readonly
          />
        : ''}
        {['1', '5'].includes(props.alarmType) ? '' :
          <ListInput 
            name="offerDays"
            label={labels.offerDays}
            value={alarm.offerDays}
            type="number" 
            readonly
          />
        }
        <ListInput 
          name="storeName" 
          label={labels.storeName}
          value={storeName}
          type="text" 
          readonly
        />
        {['1', '5'].includes(props.alarmType) ?
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
        : ''}
        {['5', '6', '7', '8'].includes(alarm.type) ?
          <ListItem
            title={labels.newProduct}
            smartSelect
            smartSelectParams={{
              openIn: "popup", 
              closeOnSelect: true, 
              searchbar: true, 
              searchbarPlaceholder: labels.search,
              popupCloseLinkText: labels.close
            }}
          >
            <select name="newPackId" value={newPackId} onChange={e => setNewPackId(e.target.value)}>
              <option value=""></option>
              {packs.map(p => 
                <option key={p.id} value={p.id}>{p.name}</option>
              )}
            </select>
          </ListItem>
        : ''}
      </List>
      <BlockTitle>
        {labels.prices}
      </BlockTitle>
        <List mediaList>
        {storePacks.map(p => 
          <ListItem 
            title={p.currentStore.name}
            subtitle={p.quantity ? `${labels.quantity}: ${p.quantity}` : ''}
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
