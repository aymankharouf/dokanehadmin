import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Toolbar, Button } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { resolveForgetPassword, showMessage } from '../data/Actions'
import BottomToolbar from './BottomToolbar';

const RetreivePassword = props => {
  const { state } = useContext(StoreContext)
  const forgetPasswordTrans = useMemo(() => state.forgetPassword.find(rec => rec.id === props.id), [state.forgetPassword])
  const user = useMemo(() => state.users.find(rec => rec.mobile === forgetPasswordTrans.mobile), [state.users])
  const password = useMemo(() => {
    const password = user.colors.map(color => state.randomColors.find(rec => rec.name === color).id)
    return password.join('')
  }, [user, state.randomColors])
  const handleSend = () => {
    resolveForgetPassword(props.id).then(() => {
      showMessage(props, 'success', state.labels.sendSuccess)
      props.f7router.back()
    })
  }
  return(
    <Page>
      <Navbar title={state.labels.retreivePassword} backLink={state.labels.back} />
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