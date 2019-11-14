import React, { useContext, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { login, showMessage } from '../data/Actions'

const Login = props => {
  const { state } = useContext(StoreContext)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (error) {
      showMessage(props, 'error', error)
      setError('')
    }
  }, [error, props])

  const handleLogin = () => {
    login(email, password).then(() => {
      showMessage(props, 'success', state.labels.loginSuccess)
      props.f7router.navigate(`/${props.f7route.params.callingPage}/`)
      props.f7router.app.panel.close('right')  
    }).catch (err => {
      setError(state.labels[err.code.replace(/-|\//g, '_')])
    })
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
      {!email || !password ? '' : <Button large onClick={() => handleLogin()}>{state.labels.loginSubmit}</Button>}
    </Page>
  )
}
export default Login
