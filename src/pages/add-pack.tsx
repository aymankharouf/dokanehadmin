import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {addPack, getMessage} from '../data/actions'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {units} from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string,
}
const AddPack = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [byWeight, setByWeight] = useState(false)
  const [specialImage, setSpecialImage] = useState(false)
  const [image, setImage] = useState<File>()
  const [product] = useState(() => state.products.find(p => p.id === params.id)!)
  const [imageUrl, setImageUrl] = useState('')
  const inputEl = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (byWeight) setUnitsCount('1')
  }, [byWeight])
  useEffect(() => {
    if (byWeight || unitsCount) setName(byWeight ? labels.byWeight : `${unitsCount} ${units.find(u => u.id === product.unit)?.name}`)
  }, [unitsCount, product, byWeight])
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
      if (state.packs.find(p => p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      const pack = {
        name,
        product,
        unitsCount: +unitsCount,
        byWeight,
        subPackId: null,
        subCount: null,
        imageUrl,
        withGift: false,
        gift: null,
        isActive: true,
        forSale: true,
        lastTrans: new Date()
      }
      addPack(pack, product, image)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.addPack} ${product.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel color="primary">{labels.byWeight}</IonLabel>
            <IonToggle slot="end" checked={byWeight} onIonChange={() => setByWeight(s => !s)}/>
          </IonItem>
          {!byWeight &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.unitsCount}
              </IonLabel>
              <IonInput 
                value={unitsCount} 
                type="number"
                clearInput
                onIonChange={e => setUnitsCount(e.detail.value!)} 
              />
            </IonItem>
          }
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
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
            <IonImg src={imageUrl} alt={labels.noImage} />
          </>}
        </IonList>
      </IonContent>
      {name && unitsCount &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddPack
