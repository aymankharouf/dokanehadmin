import { useState, useContext, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { editCategory, getMessage, getCategoryName } from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditCategory = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [category] = useState(() => state.categories.find(c => c.id === params.id)!)
  const [name, setName] = useState(category?.name)
  const [ordering, setOrdering] = useState(category?.ordering.toString())
  const [parentId, setParentId] = useState(category?.parentId)
  const [isActive, setIsActive] = useState(category?.isActive)
  const [hasChanged, setHasChanged] = useState(false)
  const [categories] = useState(() => {
    let otherCategories = state.categories.filter(c => c.id !== params.id)
    let categories = otherCategories.map(c => {
      return {
        id: c.id,
        name: getCategoryName(c, state.categories)
      }
    })
    return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  })
  useEffect(() => {
    if (name !== category?.name
    || +ordering !== category?.ordering
    || parentId !== category?.parentId
    || isActive !== category?.isActive) setHasChanged(true)
    else setHasChanged(false)
  }, [category, name, ordering, parentId, isActive])
  const handleSubmit = () => {
    try{
      const newCategory = {
        ...category,
        parentId,
        name,
        ordering: +ordering,
        isActive
      }
      editCategory(newCategory, category, state.categories)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editCategory} />
      <IonContent fullscreen>
        <IonList  className="ion-padding">
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mainCategory}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={parentId}
              onIonChange={e => setParentId(e.detail.value)}
            >
              {categories.map(c => <IonSelectOption key={c.id} value={c.id}>{c.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
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
      </IonContent>
      {name && ordering && hasChanged && 
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default EditCategory
