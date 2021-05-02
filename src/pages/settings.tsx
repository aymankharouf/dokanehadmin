import {useState} from 'react'
import {Page, Block, Navbar, Button} from 'framework7-react'
import labels from '../data/labels'
import {randomColors} from '../data/config'


const Settings = () => {
  const [sections] = useState(() => [
    {id: '1', name: labels.countries, path: '/countries/'},
    {id: '2', name: labels.trademarks, path: '/trademarks/'},
    {id: '3', name: labels.categories, path: '/categories/0'},
    {id: '4', name: labels.locations, path: '/locations/'},
    {id: '5', name: labels.adverts, path: '/adverts/'},
    {id: '6', name: labels.units, path: '/units/'},
  ])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.settings} backLink={labels.back} />
      <Block>
        {sections.map(s => 
          <Button 
            text={s.name} 
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={s.path} 
            key={s.id} 
          />
        )}
      </Block>
    </Page>
  )
}

export default Settings
