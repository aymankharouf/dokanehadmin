import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {addPack, getMessage} from '../data/actions'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  productId: string,
  requestId: string
}
const AddGroup = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [packRequest] = useState(() => state.packRequests.find(r => r.id === params.requestId))
  const [name, setName] = useState(packRequest?.name || '')
  const [subPackId, setSubPackId] = useState(packRequest?.siblingPackId || '')
  const [subCount, setSubCount] = useState(packRequest?.subCount || '')
  const [specialImage, setSpecialImage] = useState(!!packRequest?.imageUrl || false)
  const [withGift, setWithGift] = useState(false)
  const [image, setImage] = useState<File>()
  const [gift, setGift] = useState(packRequest?.gift || '')
  const [product] = useState(() => state.products.find(p => p.id === params.productId)!)
  const [price, setPrice] = useState(packRequest?.price.toFixed(2) || '')
  const [storeId, setStoreId] = useState(packRequest?.storeId || '')
  const [forSale, setForSale] = useState(() => state.stores.find(s => s.id === storeId)?.type === 's')
  const [packs] = useState(() => state.packs.filter(p => p.product.id === params.productId && !p.byWeight && !p.subPackId))
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const inputEl = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (subCount || gift) setName(`${+subCount > 1 ? subCount + '×' : ''}${state.packs.find(p => p.id === subPackId)?.name}${withGift ? '+' + gift : ''}`)
  }, [subCount, gift, state.packs, withGift, subPackId])

  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click();
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files
      if (!files) return
      const filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        throw new Error('invalidFile')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        if (fileReader.result) setImageUrl(fileReader.result.toString())
      })
      fileReader.readAsDataURL(files[0])
      setImage(files[0])
    } catch (err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleSubmit = () => {
    try{
      const subPackInfo = state.packs.find(p => p.id === subPackId)!
      if (state.packs.find(p => p.product.id === params.productId && p.name === name)) {
        throw new Error('duplicateName')
      }
      if (+subCount === 0 || +subCount !== Math.floor(+subCount)){
        throw new Error('invalidCount')
      }
      if (!withGift && +subCount === 1) {
        throw new Error('invalidCountWithoutGift')
      }
      const stores = [{
        storeId, 
        price: +price, 
        isRetail: state.stores.find(s => s.id === storeId)!.type === 's', 
        isActive: true,
        time: new Date()
      }]
      const pack = {
        product,
        name,
        stores,
        subPackId,
        subCount: +subCount,
        unitsCount: +subCount * subPackInfo.unitsCount,
        byWeight: subPackInfo.byWeight,
        isActive: true,
        withGift,
        gift,
        forSale,
        lastTrans: new Date()
      }
      addPack(pack, product, state.users, state.packRequests, packRequest, image, subPackInfo)
      message(labels.addSuccess, 3000)
      if (packRequest) history.push('/')
      else history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.addGroup} ${product.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.name}</IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.pack}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              disabled={!!packRequest}
              onIonChange={e => setSubPackId(e.detail.value)}
            >
              {packs.map(p => <IonSelectOption key={p.id} value={p.id}>{p.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.count}
            </IonLabel>
            <IonInput 
              value={subCount} 
              type="number"
              clearInput
              onIonChange={e => setSubCount(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.forSale}</IonLabel>
            <IonToggle checked={forSale} onIonChange={() => setForSale(s => !s)}/>
          </IonItem>
          {forSale &&
            <IonItem>
              <IonLabel color="primary">{labels.withGift}</IonLabel>
              <IonToggle checked={withGift} onIonChange={() => setWithGift(s => !s)}/>
            </IonItem>
          }
          {withGift &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.gift}
              </IonLabel>
              <IonInput 
                value={gift} 
                type="text"
                clearInput
                onIonChange={e => setGift(e.detail.value!)} 
              />
            </IonItem>
          }
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.store}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              disabled={!!packRequest}
              onIonChange={e => setStoreId(e.detail.value)}
            >
              {state.stores.map(s => <IonSelectOption key={s.id} value={s.id}>{s.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.price}
            </IonLabel>
            <IonInput 
              value={price} 
              type="number" 
              clearInput
              onIonChange={e => setPrice(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.specialImage}</IonLabel>
            <IonToggle checked={specialImage} onIonChange={() => setSpecialImage(s => !s)}/>
          </IonItem>
          {specialImage && <>
            <input 
              ref={inputEl}
              type="file" 
              accept="image/*" 
              style={{display: "none"}}
              onChange={e => handleFileChange(e)}
            />
            <IonButton 
              expand="block" 
              fill="clear" 
              onClick={onUploadClick}
            >
              {labels.setImage}
            </IonButton>
            <img src={imageUrl} className="img-card" alt={labels.noImage} />
          </>}
        </IonList>
      </IonContent>
      {name && subPackId && subCount && (gift || !withGift) &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit}>
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddGroup
