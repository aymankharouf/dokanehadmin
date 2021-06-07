import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {StateContext} from '../data/state-provider'
import {editAdvert, getMessage} from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonDatetime, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonTextarea, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import moment from 'moment'

type Params = {
  id: string
}
const EditAdvert = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [advert] = useState(() => state.adverts.find(a => a.id === params.id)!)
  const [title, setTitle] = useState(advert?.title)
  const [text, setText] = useState(advert?.text)
  const [startDate, setStartDate] = useState(moment(advert.startDate.toString(), 'YYYYMMDD').toString())
  const [endDate, setEndDate] = useState(moment(advert.endDate.toString(), 'YYYYMMDD').toString())
  const [imageUrl, setImageUrl] = useState(advert?.imageUrl)
  const [image, setImage] = useState<File>()
  const [hasChanged, setHasChanged] = useState(false)
  const inputEl = useRef<HTMLInputElement | null>(null)
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click()
  }
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
    } catch (err)  {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  useEffect(() => {
    if (title !== advert.title
    || text !== advert.text
    || startDate !== moment(advert.startDate.toString(), 'YYYYMMDD').toString()
    || endDate !== moment(advert.endDate.toString(), 'YYYYMMDD').toString()
    || imageUrl !== advert.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [advert, title, text, startDate, endDate, imageUrl])
  const handleSubmit = () => {
    try{
      const start = new Date(startDate)
      const end = new Date(endDate)
      const today = new Date()
      const startNumber = start.getFullYear() * 10000 + (start.getMonth() + 1) * 100 + start.getDate()
      const endNumber = end.getFullYear() * 10000 + (end.getMonth() + 1) * 100 + end.getDate()
      const todayNumber = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
      if (endNumber < startNumber || startNumber < todayNumber) {
        throw new Error('invalidDates')
      }
      if (state.adverts.find(a => a.id !== advert.id && ((a.startDate >= startNumber && a.startDate <= endNumber) || (startNumber >= a.startDate && startNumber <= a.endDate)))) {
        throw new Error('overlapDates')
      }
      const newAdvert = {
        ...advert,
        startDate: startNumber,
        endDate: endNumber,
        title,
        text,
      }
      editAdvert(newAdvert, image)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editAdvert} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.title}
            </IonLabel>
            <IonInput 
              value={title} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setTitle(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.startDate}
            </IonLabel>
            <IonDatetime 
              displayFormat="DD/MM/YYYY" 
              value={startDate} 
              onIonChange={e => setStartDate(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.endDate}
            </IonLabel>
            <IonDatetime 
              displayFormat="DD/MM/YYYY" 
              value={endDate} 
              onIonChange={e => setEndDate(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.text}
            </IonLabel>
            <IonTextarea 
              value={text} 
              wrap="soft"
              onIonChange={e => setText(e.detail.value!)} 
            />
          </IonItem>
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
        </IonList>
      </IonContent>
      {title && (text || imageUrl) && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default EditAdvert
