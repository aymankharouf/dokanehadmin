import {useState} from 'react'
import labels from '../data/labels'
import {randomColors} from '../data/config'
import { IonButton, IonContent, IonPage } from '@ionic/react'
import Header from './header'

const Settings = () => {
  const [sections] = useState(() => [
    {id: '1', name: labels.countries, path: '/countries'},
    {id: '2', name: labels.trademarks, path: '/trademarks'},
    {id: '3', name: labels.categories, path: '/categories/0'},
    {id: '4', name: labels.locations, path: '/locations'},
    {id: '5', name: labels.adverts, path: '/adverts'},
  ])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.settings} />
      <IonContent fullscreen className="ion-padding">
        {sections.map(s => 
          <IonButton
            routerLink={s.path} 
            expand="block"
            shape="round"
            color={randomColors[i++ % 5].name}
            className="sections" 
            key={s.id}
          >
            {s.name}
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  )
}

export default Settings
