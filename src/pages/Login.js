import React, { useContext, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { login, showMessage, showError, getMessage } from '../data/Actions'

const Login = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleLogin = async () => {
    try{
      await login(email, password)
      showMessage(props, state.labels.loginSuccess)
      props.f7router.back()
      props.f7router.app.panel.close('right')  
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }

  return (
    <Page>
      <Navbar title={state.labels.login} backLink={state.labels.back} />
      <List form>
        <ListInput
          label={state.labels.email}
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <ListInput
          label={state.labels.password}
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </List>
      {!email || !password ? '' : 
        <Button large onClick={() => handleLogin()}>{state.labels.loginSubmit}</Button>
      }
    </Page>
  )
}
export default Login
