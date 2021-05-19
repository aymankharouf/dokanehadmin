import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {productOfText, getCategoryName} from '../data/actions'
import {Category, Country, Product, Trademark} from '../data/types'
import { useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'
import { addOutline, chevronDownOutline, cloudUploadOutline, warningOutline } from 'ionicons/icons'

type Params = {
  id: string
}
type ExtendedProduct = Product & {
  categoryInfo: Category,
  trademarkInfo?: Trademark,
  countryInfo: Country
}
const Products = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [category] = useState(() => state.categories.find(c => c.id === params.id))
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  useEffect(() => {
    setProducts(() => {
      const products = state.products.filter(p => params.id === '-1' ? !state.packs.find(pa => pa.product.id === p.id) || state.packs.filter(pa => pa.product.id === p.id).length === state.packs.filter(pa => pa.product.id === p.id && pa.price === 0).length : params.id === '0' || p.categoryId === params.id)
      const results = products.map(p => {
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
      return results.sort((p1, p2) => p1.categoryId === p2.categoryId ? (p1.name > p2.name ? 1 : -1) : (p1.categoryInfo?.name! > p2.categoryInfo?.name! ? 1 : -1))
    })
  }, [state.products, state.categories, state.packs, state.countries, state.trademarks, params.id])
  
  return(
    <IonPage>
      <Header title={params.id === '-1' ? labels.notUsedProducts : (params.id === '0' ? labels.products : category?.name || '')} withSearch/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {products.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : products.map(p => 
              <IonItem key={p.id} routerLink={`/product-packs/${p.id}/n`}>
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
        <IonFabButton>
          <IonIcon ios={chevronDownOutline}></IonIcon>
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink="/add-product/0">
            <IonIcon ios={addOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton color="warning" routerLink="/archived-products">
            <IonIcon ios={cloudUploadOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton color="secondary" routerLink="/products/-1">
            <IonIcon ios={warningOutline}></IonIcon>
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}

export default Products