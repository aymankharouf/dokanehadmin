import {useContext, useState, useEffect, useRef} from 'react'
import {StateContext} from '../data/state-provider'
import {logout} from '../data/actions'
import labels from '../data/labels'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle } from '@ionic/react'
import { useHistory } from 'react-router'

const Panel = () => {
  const {state, dispatch} = useContext(StateContext)
  const [approvalsCount, setApprovalsAcount] = useState(0)
  const menuEl = useRef<HTMLIonMenuElement | null>(null);
  const history = useHistory()
  useEffect(() => {
    const newUsers = state.users.filter(u => (u.type !== 'n' && !u.storeId) || (u.type === 'n' && !u.position.lat && !u.locationId)).length
    setApprovalsAcount(state.passwordRequests.length + state.productRequests.length + state.packRequests.length + newUsers)
  }, [state.users, state.passwordRequests, state.productRequests, state.packRequests])
  const handleLogout = () => {
    logout()
    dispatch({type: 'LOGOUT'})
    history.push('/')
    if (menuEl.current) menuEl.current.close()
  }

  return(
    <IonMenu contentId="main" type="overlay" ref={menuEl} className="dark">
      <IonContent>
        <IonList>
          <IonMenuToggle autoHide={false}>
            {state.user ?
              <>
                <IonItem href="#" onClick={handleLogout}>
                  <IonLabel>{labels.logout}</IonLabel>
                </IonItem>
                <IonItem routerLink="/settings">
                  <IonLabel>{labels.settings}</IonLabel>
                </IonItem>
                <IonItem routerLink="/approvals">
                  <IonLabel>{labels.approvals}</IonLabel>
                  {approvalsCount > 0 && <IonBadge color="danger">{approvalsCount}</IonBadge>}
                </IonItem>
                <IonItem routerLink="/logs">
                  <IonLabel>{labels.logs}</IonLabel>
                  {state.logs.length > 0 && <IonBadge color="danger">{state.logs.length}</IonBadge>}
                </IonItem>
                </>
            : <IonItem routerLink='/login'>
                <IonLabel>{labels.login}</IonLabel>
              </IonItem>
            }
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  )
}
export default Panel
