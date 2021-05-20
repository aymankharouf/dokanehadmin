import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {deleteCategory, getMessage, categoryChildren} from '../data/actions'
import {Category} from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonBadge, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { addOutline, cartOutline, chevronDownOutline, pencilOutline, trashOutline } from 'ionicons/icons'
import {randomColors} from '../data/config'

type Params = {
  id: string
}
type ExtendedCategory = Category & {
  childrenCount: number,
  productsCount: number
}
const Categories = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [categories, setCategories] = useState<ExtendedCategory[]>([])
  const [currentCategory, setCurrentCategory] = useState<Category>()
  const [categoryChildrenCount] = useState(() => state.categories.filter(c => c.parentId === currentCategory?.id).length)
  const [categoryProductsCount] = useState(() => state.products.filter(p => p.categoryId === currentCategory?.id).length)
  useEffect(() => {
    setCurrentCategory(() => state.categories.find(c => c.id === params.id))
  }, [state.categories, params.id])
  useEffect(() => {
    setCategories(() => {
      const children = state.categories.filter(c => c.parentId === params.id)
      let categories = children.map(c => {
        const childrenCount = state.categories.filter(cc => cc.parentId === c.id).length
        const categoryChildrens = categoryChildren(c.id!, state.categories)
        const productsCount = state.products.filter(p => categoryChildrens.includes(p.categoryId)).length
        return {
          ...c,
          childrenCount,
          productsCount
        }
      })
      return categories.sort((c1, c2) => c1.ordering - c2.ordering)
    })
  }, [state.categories, state.products, params.id])
  const handleDelete = () => {
    try{
      if (!currentCategory) return
      deleteCategory(currentCategory, state.categories)
      message(labels.deleteSuccess, 3000)
      history.goBack()
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return (
    <IonPage>
      <Header title={currentCategory?.name || labels.categories} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {categories.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : categories.map(c => 
              <IonItem key={c.id} routerLink={`/categories/${c.id}`}>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{c.name}</IonText>
                  <IonText color={randomColors[1].name}>{`${labels.childrenCount}: ${c.childrenCount}`}</IonText>
                  <IonText color={randomColors[2].name}>{`${labels.attachedProducts}: ${c.productsCount}`}</IonText>
                  <IonText color={randomColors[3].name}>{`${labels.ordering}:${c.ordering}`}</IonText>
                </IonLabel>
                {!c.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton>
          <IonIcon ios={chevronDownOutline}></IonIcon>
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink={`/add-category/${params.id}`}>
            <IonIcon ios={addOutline}></IonIcon>
          </IonFabButton>
          {params.id !== '0' &&
            <IonFabButton color="warning" routerLink={`/edit-category/${params.id}`}>
              <IonIcon ios={pencilOutline}></IonIcon>
            </IonFabButton>
          }
          {params.id !== '0' && categoryChildrenCount + categoryProductsCount === 0 &&
            <IonFabButton color="danger" onClick={handleDelete}>
              <IonIcon ios={trashOutline}></IonIcon>
            </IonFabButton>
          }
          <IonFabButton color="secondary" routerLink={`/products/${params.id}`}>
            <IonIcon ios={cartOutline}></IonIcon>
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}

export default Categories
