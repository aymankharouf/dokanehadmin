import React, { useContext, useState, useEffect, useMemo } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { StoreContext } from '../data/store'
import { callTypes, callResults } from '../data/config'
import { addCall, showMessage, showError, getMessage } from '../data/actions'

const AddCall = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [callType, setCallType] = useState('')
  const [callResult, setCallResult] = useState('')
  const customerInfo = useMemo(() => state.customers.find(u => u.id === props.id)
  , [state.customers, props.id])
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
  const handleSubmit = async () => {
    try{
      setInprocess(true)
      await addCall({
        userId: props.id,
        callType,
        callResult,
        time: new Date()
      })
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addCall} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.fullName} 
          type="text"
          value={customerInfo.fullName}
          readonly
        />
        <ListInput 
          name="otherMobile" 
          label={labels.otherMobile} 
          type="text"
          value={customerInfo.otherMobile}
          readonly
        />
        <ListItem
          title={labels.callType}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="callType" value={callType} onChange={e => setCallType(e.target.value)}>
            <option value=""></option>
            {callTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem
          title={labels.callResult}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="callResult" value={callResult} onChange={e => setCallResult(e.target.value)}>
            <option value=""></option>
            {callResults.map(r => 
              <option key={r.id} value={r.id}>{r.name}</option>
            )}
          </select>
        </ListItem>
      </List>
      {!callType || !callResult ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default AddCall
