import React, { useContext, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { StoreContext } from '../data/store'
import { changePassword, showMessage, showError, getMessage } from '../data/actions'

const ChangePassword = props => {
  const { state } = useContext(StoreContext)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      await changePassword(oldPassword, newPassword)
      showMessage(state.labels.changePasswordSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
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
      {!oldPassword || !newPassword || oldPassword === newPassword ? '' :
        <Button large onClick={() => handleSubmit()}>{state.labels.submit}</Button>
      }
    </Page>
  )
}
export default ChangePassword
