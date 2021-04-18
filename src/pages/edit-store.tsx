import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, Toolbar } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import Footer from './footer'
import labels from '../data/labels'
import { storeTypes } from '../data/config'
import { editStore, showMessage, showError, getMessage } from '../data/actions'

interface Props {
  id: string
}
const EditStore = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [store] = useState(() => state.stores.find((s: any) => s.id === props.id)!)
  const [type, setType] = useState(store.type)
  const [name, setName] = useState(store.name)
  const [mobile, setMobile] = useState(store.mobile)
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState(store.address)
  const [discount, setDiscount] = useState(store.discount * 100)
  const [mapPosition, setMapPosition] = useState(store.mapPosition)
  const [allowReturn, setAllowReturn] = useState(store.allowReturn)
  const [isActive, setIsActive] = useState(store.isActive)
  const [openTime, setOpenTime] = useState(store.openTime)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = (value: any) => {
      if (patterns.mobile.test(value)){
        setMobileErrorMessage('')
      } else {
        setMobileErrorMessage(labels.invalidMobile)
      }
    }
    if (mobile) validateMobile(mobile)
    else setMobileErrorMessage('')
  }, [mobile])
  useEffect(() => {
    if (name !== store.name
    || type !== store.type
    || mobile !== store.mobile
    || discount !== store.discount * 100
    || address !== store.address
    || mapPosition !== store.mapPosition
    || allowReturn !== store.allowReturn
    || isActive !== store.isActive
    || openTime !== store.openTime) setHasChanged(true)
    else setHasChanged(false)
  }, [store, name, type, mobile, discount, address, mapPosition, allowReturn, isActive, openTime])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (discount && discount <= 0) {
        throw new Error('invalidValue')
      }
      const newStore = {
        ...store,
        name,
        type,
        discount: discount / 100,
        allowReturn,
        isActive,
        mobile,
        address,
        mapPosition,
        openTime
      }
      editStore(newStore)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editStore} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          clearButton 
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput
          name="mobile"
          label={labels.mobile}
          value={mobile}
          clearButton
          type="number"
          errorMessage={mobileErrorMessage}
          errorMessageForce
          onChange={e => setMobile(e.target.value)}
          onInputClear={() => setMobile('')}
        />
        <ListItem
          title={labels.type}
          smartSelect
          id="types"
          smartSelectParams={{
            el: '#types', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="type" value={type} onChange={e => setType(e.target.value)}>
            <option value=""></option>
            {storeTypes.map(t => 
              t.id === '1' ? '' : <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput
          name="discount"
          label={labels.discount}
          value={discount}
          clearButton
          type="number"
          onChange={e => setDiscount(e.target.value)}
          onInputClear={() => setDiscount(0)}
        />
        <ListItem>
          <span>{labels.allowReturn}</span>
          <Toggle 
            name="allowReturn" 
            color="green" 
            checked={allowReturn} 
            onToggleChange={() => setAllowReturn(!allowReturn)}
          />
        </ListItem>
        <ListItem>
          <span>{labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={isActive} 
            onToggleChange={() => setIsActive(!isActive)}
          />
        </ListItem>
        <ListInput
          name="openTime"
          label={labels.openTime}
          value={openTime}
          clearButton
          type="text"
          onChange={e => setOpenTime(e.target.value)}
          onInputClear={() => setOpenTime('')}
        />
        <ListInput
          name="mapPosition"
          label={labels.mapPosition}
          value={mapPosition}
          clearButton
          type="text"
          onChange={e => setMapPosition(e.target.value)}
          onInputClear={() => setMapPosition('')}
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={address}
          clearButton 
          type="textarea" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
      </List>
      {!name || !type || mobileErrorMessage || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}
export default EditStore
