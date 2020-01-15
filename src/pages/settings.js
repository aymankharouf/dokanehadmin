import React, { useMemo } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { randomColors } from '../data/config'


const Settings = props => {
  const sections = useMemo(() => [
    {id: '1', name: 'المحلات', path: '/stores/'},
    {id: '2', name: 'الدول', path: '/countries/'},
    {id: '3', name: 'الاصناف', path: '/categories/0'},
    {id: '4', name: 'العلامات التجارية', path: '/trademarks/'},
    {id: '5', name: 'المناطق', path: '/locations/'},
    {id: '6', name: 'الفئات', path: '/tags/'},
    {id: '7', name: 'الاعلانات', path: '/adverts/'}
  ], [])
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
