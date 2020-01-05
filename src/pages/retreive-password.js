import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Toolbar, Button } from 'framework7-react'
import { StoreContext } from '../data/store'
import { resolvePasswordRequest, showMessage, showError, getMessage } from '../data/actions'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { randomColors } from '../data/config'

const RetreivePassword = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const passwordRequest = useMemo(() => state.passwordRequests.find(r => r.id === props.id)
  , [state.passwordRequests, props.id])
  const user = useMemo(() => state.users.find(u => u.mobile === passwordRequest.mobile)
  , [state.users, passwordRequest])
  const password = useMemo(() => {
    const password = user.colors.map(c => randomColors.find(rc => rc.name === c).id)
    return password.join('')
  }, [user])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSend = async () => {
    try{
      await resolvePasswordRequest(props.id)
      showMessage(labels.sendSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={labels.retreivePassword} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={user.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="mobile" 
          label={labels.mobile}
          value={user.mobile}
          type="number"
          readonly
        />
        <ListInput 
          name="password" 
          label={labels.password}
          value={password}
          type="number"
          readonly
        />
      </List>
      <Button large onClick={() => handleSend()}>{labels.send}</Button>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default RetreivePassword