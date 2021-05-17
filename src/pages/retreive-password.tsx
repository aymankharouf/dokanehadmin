import {useContext, useState} from 'react'
import {f7, Page, Navbar, List, ListInput, Fab, Icon} from 'framework7-react'
import {StateContext } from '../data/state-provider'
import {resolvePasswordRequest, getMessage} from '../data/actions'
import labels from '../data/labels'
import {randomColors} from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const RetreivePassword = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [passwordRequest] = useState(() => state.passwordRequests.find(r => r.id === params.id))
  const [userInfo] = useState(() => state.users.find(u => u.mobile === passwordRequest?.mobile))
  const [password] = useState(() => {
    const password = userInfo?.colors?.map(c => randomColors.find(rc => rc.name === c)?.id)
    return password?.join('')
  })
  const handleResolve = () => {
    try{
      resolvePasswordRequest(params.id)
      message(labels.sendSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return(
    <Page>
      <Navbar title={labels.retreivePassword} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={userInfo?.name || labels.unknown}
          type="text" 
          readonly
        />
        <ListInput 
          name="mobile" 
          label={labels.mobile}
          value={passwordRequest?.mobile}
          type="number"
          readonly
        />
        <ListInput 
          name="password" 
          label={labels.password}
          value={password || ''}
          type="number"
          readonly
        />
      </List>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleResolve()}>
        <Icon material="done"></Icon>
      </Fab>
    </Page>
  )
}
export default RetreivePassword