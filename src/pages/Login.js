import React, { useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { login, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const Login = props => {
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleLogin = async () => {
    try{
      await login(email, password)
      showMessage(labels.loginSuccess)
      props.f7router.back()
      props.f7router.app.panel.close('right')  
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={labels.login} backLink={labels.back} />
      <List form>
        <ListInput
          label={labels.email}
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <ListInput
          label={labels.password}
          type="text"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </List>
      {!email || !password ? '' : 
        <Button large onClick={() => handleLogin()}>{labels.logon}</Button>
      }
    </Page>
  )
}
export default Login
