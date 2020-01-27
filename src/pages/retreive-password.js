import React, { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Toolbar, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { resolvePasswordRequest, showMessage, showError, getMessage } from '../data/actions'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { randomColors } from '../data/config'

const RetreivePassword = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [passwordRequest] = useState(() => state.passwordRequests.find(r => r.id === props.id))
  const [userInfo, setUserInfo] = useState('')
  const [password, setPassword] = useState('')
  useEffect(() => {
    setUserInfo(() => state.users.find(u => u.mobile === passwordRequest.mobile))
  }, [state.users, passwordRequest])
  useEffect(() => {
    setPassword(() => {
      const password = userInfo.colors.map(c => randomColors.find(rc => rc.name === c).id)
      return password.join('')
    })
  }, [userInfo])
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

  const handleResolve = async () => {
    try{
      setInprocess(true)
      await resolvePasswordRequest(props.id)
      setInprocess(false)
      showMessage(labels.sendSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
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
        <ListInput 
          name="password" 
          label={labels.password}
          value={password}
          type="number"
          readonly
        />
      </List>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleResolve()}>
        <Icon material="done"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default RetreivePassword