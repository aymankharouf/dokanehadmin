import React, { useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { registerUser, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const Register = props => {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
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

  const handleRegister = async () => {
    try{
      setInprocess(true)
      await registerUser(email, password)
      setInprocess(false)
      showMessage(labels.registerSuccess)
      props.f7router.back()
      props.f7router.app.panel.close('right') 
    } catch (err){
      setInprocess(false)
      setError(getMessage(props, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.registerTitle} backLink={labels.back} />
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
        <Button text={labels.register} href="#" large onClick={() => handleRegister()} />
      }
    </Page>
  )
}
export default Register
