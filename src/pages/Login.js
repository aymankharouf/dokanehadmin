import React, { useContext, useState, useCallback } from 'react'
import { Page, Navbar, List, ListInput, ListButton, Block, Link} from 'framework7-react'
import { StoreContext } from '../data/Store';
import firebase from '../data/firebase'

const Login = props => {
  const { state } = useContext(StoreContext)
  /*useEffect(() => {
    dispatch({type: 'CLEAR_ERRORS'})
  }, [])
  componentDidUpdate(){
    if (this.$f7router.currentRoute.name == 'login' && state.result.finished && state.result.message === '') {
      this.$f7router.navigate(`/${this.$f7route.params.callingPage}/`)
    }
  }*/
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [error, setError] = useState('')
  const patterns = {
    password: /^.{4}$/,
    mobile: /^07[7-9][0-9]{7}$/
  }
  const validatePassword = (value) => {
    if (patterns.password) {
      if (patterns.password.test(value)){
        setPasswordErrorMessage('')
      } else {
        setPasswordErrorMessage('not a valid password')
      }
    }
  }
  const validateMobile = (value) => {
    if (patterns.mobile) {
      if (patterns.mobile.test(value)){
        setMobileErrorMessage('')
      } else {
        setMobileErrorMessage('not a valid mobile number')
      }
    }
  }
  const handlePasswordChange = e => {
    setPassword(e.target.value)
    setError('')
    validatePassword(e.target.value)
  }
  const handleMobileChange = e => {
    setMobile(e.target.value)
    setError('')
    validateMobile(e.target.value)
  }
  const handleLogin = useCallback(
    async e => {
      e.preventDefault();
      try {
        if (mobile === '') {
          setMobileErrorMessage('enter your mobile number')
          throw 'enter your mobile number'
        }
        if (password === '') {
          setPasswordErrorMessage('enter your password')
          throw 'enter your password'
        }
        if (passwordErrorMessage !== '') {
          throw passwordErrorMessage
        }
        if (mobileErrorMessage !== '') {
          throw mobileErrorMessage
        }
        await firebase.auth().signInWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(8, 2) + password);
        props.f7router.navigate(`/${props.f7route.params.callingPage}/`)
      } catch (err) {
        err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err)
      }
    }
  )

  const handleForgetPassword = () => {
    console.log('handle forget password')
  }
  return (
    <Page loginScreen>
      <Navbar title="Login" backLink="Back" />
      <List form>
        <ListInput
          label="Mobile"
          type="number"
          placeholder="Your Mobile beginning with 07"
          inputId="mobile"
          value={mobile}
          errorMessage={mobileErrorMessage}
          errorMessageForce
          onChange={(e) => handleMobileChange(e)}
        />
        <ListInput
          label="Password"
          type="number"
          placeholder="Your password"
          inputId="password"
          value={password}
          errorMessage={passwordErrorMessage}
          errorMessageForce
          onChange={(e) => handlePasswordChange(e)}
        />
      </List>
      <List>
        <ListButton onClick={(e) => handleLogin(e)}>Sign In</ListButton>
        <Link href={`/register/${props.f7route.params.callingPage}/`}>New User</Link>
        <ListButton onClick={() => handleForgetPassword()}>Forget Password</ListButton>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default Login
