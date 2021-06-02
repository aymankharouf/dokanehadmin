import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {productOfText, getCategoryName} from '../data/actions'
import {Category, Country, Product, Trademark} from '../data/types'
import { useParams } from 'react-router'
import { IonButton, IonContent, IonFooter, IonGrid, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, IonThumbnail, IonToolbar } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'

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
                  <IonText style={{color: randomColors[0].name}}>{p.name}</IonText>
                  <IonText style={{color: randomColors[1].name}}>{p.alias}</IonText>
                  <IonText style={{color: randomColors[2].name}}>{p.description}</IonText>
                  <IonText style={{color: randomColors[3].name}}>{getCategoryName(p.categoryInfo!, state.categories)}</IonText>
                  <IonText style={{color: randomColors[4].name}}>{productOfText(p.countryInfo.name, p.trademarkInfo?.name)}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFooter>
        <IonToolbar className="ion-justify-content-center">
          <IonGrid>
            <IonRow>
              <IonButton size="small" style={{width: '30vw'}} routerLink="/add-product/0">{labels.addProduct}</IonButton>
              <IonButton size="small" style={{width: '30vw', marginRight: '5px'}} color="secondary" routerLink="/archived-products">{labels.archivedProducts}</IonButton>
              <IonButton size="small" style={{width: '30vw', marginRight: '5px'}} color="danger" routerLink="/products/-1">{labels.notUsedProducts}</IonButton>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  )
}

export default Products