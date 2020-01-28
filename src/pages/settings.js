import React, { useState } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { randomColors } from '../data/config'


const Settings = props => {
  const [sections] = useState(() => [
    {id: '1', name: 'الدول', path: '/countries/'},
    {id: '2', name: 'الاصناف', path: '/categories/0'},
    {id: '3', name: 'العلامات التجارية', path: '/trademarks/'},
    {id: '4', name: 'المناطق', path: '/locations/'},
    {id: '5', name: 'الفئات', path: '/tags/'},
    {id: '6', name: 'الاعلانات', path: '/adverts/'}
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
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Settings
