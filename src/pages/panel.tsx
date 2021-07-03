import { useContext, useRef } from 'react'
import { StateContext } from '../data/state-provider'
import { logout} from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle } from '@ionic/react'
import { useHistory } from 'react-router'

const Panel = () => {
  const { state, dispatch } = useContext(StateContext)
  const menuEl = useRef<HTMLIonMenuElement | null>(null);
  const history = useHistory()
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
              <IonItem href="#" onClick={handleLogout}>
                <IonLabel>{labels.logout}</IonLabel>
              </IonItem>
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
