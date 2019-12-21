import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Toolbar, Button } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { resolveForgetPassword, showMessage, showError, getMessage } from '../data/Actions'
import BottomToolbar from './BottomToolbar';

const RetreivePassword = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const forgetPasswordTrans = useMemo(() => state.forgetPassword.find(f => f.id === props.id)
  , [state.forgetPassword, props.id])
  const user = useMemo(() => state.users.find(u => u.mobile === forgetPasswordTrans.mobile)
  , [state.users, forgetPasswordTrans])
  const password = useMemo(() => {
    const password = user.colors.map(c => state.randomColors.find(rc => rc.name === c).id)
    return password.join('')
  }, [user, state.randomColors])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handleSend = async () => {
    try{
      await resolveForgetPassword(props.id)
      showMessage(props, state.labels.sendSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={state.labels.retreivePassword} backLink={state.labels.back} className="page-title" />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={user.name}
          floatingLabel 
          type="text" 
          readonly
        />
        <ListInput 
          name="mobile" 
          label={state.labels.mobile}
          value={user.mobile}
          floatingLabel 
          type="number"
          readonly
        />
        <ListInput 
          name="password" 
          label={state.labels.password}
          value={password}
          floatingLabel 
          type="number"
          readonly
        />
      </List>
      <Button large onClick={() => handleSend()}>{state.labels.send}</Button>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default RetreivePassword