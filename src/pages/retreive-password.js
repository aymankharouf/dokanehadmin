import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Toolbar, Button } from 'framework7-react'
import { StoreContext } from '../data/store'
import { resolveForgetPassword, showMessage, showError, getMessage } from '../data/actions'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { randomColors } from '../data/config'

const RetreivePassword = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const forgetPasswordTrans = useMemo(() => state.forgetPassword.find(f => f.id === props.id)
  , [state.forgetPassword, props.id])
  const user = useMemo(() => state.users.find(u => u.mobile === forgetPasswordTrans.mobile)
  , [state.users, forgetPasswordTrans])
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
      await resolveForgetPassword(props.id)
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
          floatingLabel 
          type="text" 
          readonly
        />
        <ListInput 
          name="mobile" 
          label={labels.mobile}
          value={user.mobile}
          floatingLabel 
          type="number"
          readonly
        />
        <ListInput 
          name="password" 
          label={labels.password}
          value={password}
          floatingLabel 
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