import {useState, ChangeEvent, useRef, useContext} from 'react'
import {addAdvert, getMessage} from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonDatetime, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonTextarea, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { StateContext } from '../data/state-provider'

const AddAdvert = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState<File>()
  const inputEl = useRef<HTMLInputElement | null>(null)
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click()
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
        if (fileReader.result) setImageUrl(fileReader.result?.toString())
      })
      fileReader.readAsDataURL(files[0])
      setImage(files[0])
    } catch (err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
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
      if (state.adverts.find(a => (a.startDate >= startNumber && a.startDate <= endNumber) || (startNumber >= a.startDate && startNumber <= a.endDate))) {
        throw new Error('overlapDates')
      }
      const advert = {
        title,
        text,
        startDate: startNumber,
        endDate: endNumber,
        time: new Date()
      }
      addAdvert(advert, image)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  
  return (
    <IonPage>
      <Header title={labels.addAdvert} />
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
              cancelText={labels.cancel}
              doneText={labels.ok}
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
              cancelText={labels.cancel}
              doneText={labels.ok}
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
      {title && startDate && endDate && (text || imageUrl) &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddAdvert
