import {useState, useEffect} from 'react'
import {f7, Page, Navbar, List, ListInput, Button} from 'framework7-react'
import {changePassword, getMessage} from '../data/actions'
import labels from '../data/labels'
import { useIonLoading, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const handleSubmit = async () => {
    try{
      loading()
      await changePassword(oldPassword, newPassword)
      dismiss()
      message(labels.changePasswordSuccess, 3000)
      history.goBack()
    } catch(err) {
      dismiss()
			message(getMessage(location.pathname, err), 3000)
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
        <Button text={labels.submit} large onClick={() => handleSubmit()} />
      }
    </Page>
  )
}
export default ChangePassword
