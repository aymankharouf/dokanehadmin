import {useState, useContext} from 'react'
import labels from '../data/labels'
import {addCategory, getMessage} from '../data/actions'
import {StateContext} from '../data/state-provider'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'

type Props = {
  id: string
}
const AddCategory = (props: Props) => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [name, setName] = useState('')
  const [ordering, setOrdering] = useState(() => {
    const siblings = state.categories.filter(c => c.parentId === props.id)
    const siblingsOrder = siblings.map(s => s.ordering)
    const maxOrder = Math.max(...siblingsOrder) || 0
    return (maxOrder + 1).toString()
  })
  const handleSubmit = () => {
    try{
      addCategory(props.id, name, +ordering)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  
  return (
    <IonPage>
      <Header title={labels.addCategory} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.ordering}
            </IonLabel>
            <IonInput 
              value={ordering} 
              type="number" 
              clearInput
              onIonChange={e => setOrdering(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
        {name && ordering && 
          <IonButton 
            expand="block" 
            fill="clear" 
            onClick={handleSubmit}
          >
            {labels.save}
          </IonButton>
        }
      </IonContent>
    </IonPage>
  )
}
export default AddCategory
