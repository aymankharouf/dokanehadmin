import {useState} from 'react'
import labels from '../data/labels'
import {colors} from '../data/config'
import { IonButton, IonContent, IonPage } from '@ionic/react'
import Header from './header'

const Settings = () => {
  const [sections] = useState(() => [
    {id: '1', name: labels.countries, path: '/countries'},
    {id: '2', name: labels.trademarks, path: '/trademarks'},
    {id: '3', name: labels.categories, path: '/categories/0'},
    {id: '4', name: labels.regions, path: '/regions'},
    {id: '5', name: labels.adverts, path: '/adverts'},
  ])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.settings} />
      <IonContent fullscreen>
        {sections.map(s => 
          <IonButton
            routerLink={s.path} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}} 
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
