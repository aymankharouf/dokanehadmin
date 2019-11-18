import React, { useContext, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { changePassword, showMessage } from '../data/Actions'

const ChangePassword = props => {
  const { state } = useContext(StoreContext)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (error) {
      showMessage(props, 'error', error)
      setError('')
    }
  }, [error, props])

  const handleSubmit = () => {
    changePassword(oldPassword, newPassword).then(() => {
      showMessage(props, 'success', state.labels.changePasswordSuccess)
      props.f7router.back()
    }).catch (err => {
      setError(state.labels[err.code.replace(/-|\//g, '_')])
    })
  }

  return (
    <Page>
      <Navbar title={state.labels.changePassword} backLink={state.labels.back} />
      <List form>
        <ListInput
          label={state.labels.oldPassword}
          type="text"
          name="oldPassword"
          clearButton
          onChange={e => setOldPassword(e.target.value)}
          onInputClear={() => setOldPassword('')}
        />
        <ListInput
          label={state.labels.newPassword}
          type="text"
          name="newPassword"
          clearButton
          onChange={e => setNewPassword(e.target.value)}
          onInputClear={() => setNewPassword('')}
        />
      </List>
      {!oldPassword || !newPassword || oldPassword === newPassword ? '' 
      : <Button large onClick={() => handleSubmit()}>{state.labels.submit}</Button>
      }
    </Page>
  )
}
export default ChangePassword
