import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { resolvePasswordRequest, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { randomColors } from '../data/config'

interface Props {
  id: string
}
const RetreivePassword = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [passwordRequest] = useState(() => state.passwordRequests.find(r => r.id === props.id))
  const [userInfo] = useState(() => state.users.find((u: any) => u.mobile === passwordRequest?.mobile))
  const [password] = useState(() => {
    const password = userInfo?.colors?.map((c: any) => randomColors.find(rc => rc.name === c)?.id)
    return password?.join('')
  })
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleResolve = () => {
    try{
      resolvePasswordRequest(props.id)
      showMessage(labels.sendSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
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