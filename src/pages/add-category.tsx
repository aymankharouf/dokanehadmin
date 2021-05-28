import {useState, useContext} from 'react'
import labels from '../data/labels'
import {addCategory, getMessage} from '../data/actions'
import {StateContext} from '../data/state-provider'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import { Category } from '../data/types'

type Params = {
  id: string
}
const AddCategory = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [ordering, setOrdering] = useState(() => {
    const siblings = state.categories.filter(c => c.parentId === params.id)
    const siblingsOrders = siblings.map(s => s.ordering)
    const maxOrder = siblingsOrders.length > 0 ? Math.max(...siblingsOrders) : 0
    return (maxOrder + 1).toString()
  })
  const handleSubmit = () => {
    try{
      const parentCategory = state.categories.find(c => c.id === params.id)
      const newCategory: Category = {
        parentId: params.id,
        name,
        ordering: +ordering,
        isActive,
        isLeaf: true,
        mainId: parentCategory?.mainId || parentCategory?.id || null
      }
      addCategory(newCategory)
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
          <IonItem>
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={isActive} onIonChange={() => setIsActive(s => !s)}/>
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
