import {useContext, useState, useEffect} from 'react'
import {f7, Page, Navbar, List, ListInput, Fab, Icon} from 'framework7-react'
import {permitUser, showMessage, showError, getMessage} from '../data/actions'
import labels from '../data/labels'
import {StateContext} from '../data/state-provider'

type Props = {
  id: string
}
const PermitUser = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [user] = useState(() => state.users.find(u => u.id === props.id)!)
  const [address, setAddress] = useState('')
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
  const handlePermit = () => {
    try{
      setInprocess(true)
      permitUser(user, address)
      setInprocess(false)
      showMessage(labels.permitSuccess)
      f7.views.current.router.back()
    } catch (err){
      setInprocess(false)
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.permitUser} backLink={labels.back} />
      <List form>
        <ListInput 
          name="user" 
          label={labels.user}
          type="text" 
          value={`${user.name} - ${user.storeName}:${user.mobile}`}
          readonly
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={address}
          clearButton 
          type="textarea" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
      </List>
      {address &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={handlePermit}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default PermitUser
