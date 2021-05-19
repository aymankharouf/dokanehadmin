import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {getCategoryName, getArchivedProducts, getMessage, productOfText} from '../data/actions'
import {Category, Country, Product, Trademark} from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonLoading, useIonToast } from '@ionic/react'
import { useLocation } from 'react-router'
import Header from './header'
import { randomColors } from '../data/config'
import { cloudDownloadOutline } from 'ionicons/icons'

type ExtendedProduct = Product & {
  categoryInfo: Category,
  trademarkInfo?: Trademark,
  countryInfo: Country
}
const ArchivedProducts = () => {
  const {state, dispatch} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const [loading, dismiss] = useIonLoading()
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  useEffect(() => {
    setProducts(() => {
      const archivedProducts = state.products.filter(p => !p.isActive)
      const products = archivedProducts.map(p => {
        const categoryInfo = state.categories.find(c => c.id === p.categoryId)!
        const trademarkInfo = state.trademarks.find(t => t.id === p.trademarkId)
        const countryInfo = state.countries.find(c => c.id === p.countryId)!
        return {
          ...p,
          categoryInfo,
          trademarkInfo,
          countryInfo
        }
      })
      return products.sort((p1, p2) => p1.name > p2.name ? -1 : 1)
    })
  }, [state.products, state.categories, state.countries, state.trademarks])
  const handleRetreive = async () => {
    try{
      loading()
      const products = await getArchivedProducts()
      if (products.length > 0) {
        dispatch({type: 'SET_ARCHIVED_PRODUCTS', payload: products})
      }
      dismiss()
    } catch(err) {
      dismiss()
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return(
    <IonPage>
      <Header title={labels.archivedProducts} withSearch/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {products.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : products.map(p => 
              <IonItem key={p.id} routerLink={`/product-packs/${p.id}/a`}>
                <IonThumbnail slot="start">
                  <IonImg src={p.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{p.name}</IonText>
                  <IonText color={randomColors[1].name}>{p.alias}</IonText>
                  <IonText color={randomColors[2].name}>{p.description}</IonText>
                  <IonText color={randomColors[3].name}>{getCategoryName(p.categoryInfo!, state.categories)}</IonText>
                  <IonText color={randomColors[4].name}>{productOfText(p.countryInfo.name, p.trademarkInfo?.name)}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton onClick={handleRetreive}>
          <IonIcon ios={cloudDownloadOutline}></IonIcon>
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default ArchivedProducts