import React, { useContext, useState } from 'react'
import { Page, Navbar, List, ListInput, ListButton, ListItem, Block} from 'framework7-react'
import { StoreContext } from '../data/Store';
import firebase from '../data/firebase'

const Register = props => {
  const { state } = useContext(StoreContext)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('07')
  const [password, setPassword] = useState('')
  const [location, setLocation] = useState('')
  const [nameErrorMessage, setNameErrorMessage] = useState('')
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [error, setError] = useState('')

  const patterns = {
    name: /^.{4,50}$/,
    password: /^.{4}$/,
    mobile: /^07[7-9][0-9]{7}$/
  }
  const validateName = (value) => {
    if (patterns.name) {
      if (patterns.name.test(value)){
        setNameErrorMessage('')
      } else {
        setNameErrorMessage('not a valid name')
      }
    }
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
  const handleNameChange = e => {
    setName(e.target.value)
    validateName(e.target.value)
  }
  const handlePasswordChange = e => {
    setPassword(e.target.value)
    validatePassword(e.target.value)
  }
  const handleMobileChange = e => {
    setMobile(e.target.value)
    validateMobile(e.target.value)
  }
  const handleRegister = async e => {
    e.preventDefault();
    try {
      if (name === '') {
        setNameErrorMessage('enter your name')
        throw 'enter your name'
      }
      if (mobile === '') {
        setMobileErrorMessage('enter your mobile number')
        throw 'enter your mobile number'
      }
      if (password === '') {
        setPasswordErrorMessage('enter your password')
        throw 'enter your password'
      }
      await firebase.auth().createUserWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(8, 2) + password);
      await firebase.auth().currentUser.updateProfile({
        displayName: name + '-' + mobile
      })
      props.f7router.navigate(`/${props.f7route.params.callingPage}/`)
    } catch (err) {
      err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err)
    }
  }
  const locations = state.locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)
  return (
    <Page loginScreen>
      <Navbar title={state.labels.registerTitle} backLink="Back" />
      <List form>
        <ListInput
          label={state.labels.name}
          type="text"
          placeholder={state.labels.name_placeholder}
          name="name"
          value={name}
          errorMessage={nameErrorMessage}
          errorMessageForce
          onChange={(e) => handleNameChange(e)}
        />
        <ListInput
          label={state.labels.mobile}
          type="number"
          placeholder={state.labels.mobile_placeholder}
          name="mobile"
          value={mobile}
          errorMessage={mobileErrorMessage}
          errorMessageForce
          onChange={(e) => handleMobileChange(e)}
        />
        <ListInput
          label={state.labels.password}
          type="number"
          placeholder={state.labels.password_placeholder}
          name="password"
          value={password}
          errorMessage={passwordErrorMessage}
          errorMessageForce
          onChange={(e) => handlePasswordChange(e)}
        />
        <ListItem
          title={state.labels.location}
          smartSelect
          smartSelectParams={{openIn: 'popover', closeOnSelect: true}}
        >
          <select name="location" defaultValue="" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="" disabled></option>
            {locations}
          </select>
        </ListItem>
      </List>
      <List>
        <ListButton onClick={(e) => handleRegister(e)}>{state.labels.register}</ListButton>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default Register
