import React, { useContext, useState } from 'react'
import { Page, Navbar, List, ListInput, ListButton, Block } from 'framework7-react'
import { StoreContext } from '../data/Store';
import firebase from '../data/firebase'

const Login = props => {
  const { state } = useContext(StoreContext)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const handleLogin = async () => {
    try {
      if (email === '') {
        throw new Error('enter your email')
      }
      if (password === '') {
        throw new Error('enter your password')
      }
      await firebase.auth().signInWithEmailAndPassword(email, password);
      props.f7router.navigate(`/${props.f7route.params.callingPage}/`)
    } catch (err) {
      err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
    }
  }

  return (
    <Page loginScreen>
      <Navbar title="Login" backLink="Back" />
      <List form>
        <ListInput
          label="email"
          type="text"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <ListInput
          label="Password"
          type="text"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </List>
      <List>
        <ListButton onClick={() => handleLogin()}>Sign In</ListButton>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default Login
