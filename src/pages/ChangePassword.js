import React, { useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { changePassword, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const ChangePassword = props => {
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
      showMessage(labels.changePasswordSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={labels.changePassword} backLink={labels.back} />
      <List form>
        <ListInput
          label={labels.oldPassword}
          type="text"
          name="oldPassword"
          clearButton
          onChange={e => setOldPassword(e.target.value)}
          onInputClear={() => setOldPassword('')}
        />
        <ListInput
          label={labels.newPassword}
          type="text"
          name="newPassword"
          clearButton
          onChange={e => setNewPassword(e.target.value)}
          onInputClear={() => setNewPassword('')}
        />
      </List>
      {!oldPassword || !newPassword || oldPassword === newPassword ? '' :
        <Button large onClick={() => handleSubmit()}>{labels.submit}</Button>
      }
    </Page>
  )
}
export default ChangePassword
