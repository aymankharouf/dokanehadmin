import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Settings = props => {
  const { state } = useContext(StoreContext)
  const sections = useMemo(() => [
    {id: '1', name: 'المحلات', path: 'stores'},
    {id: '2', name: 'الدول', path: 'countries'},
    {id: '3', name: 'اﻻقسام', path: 'sections'},
    {id: '4', name: 'العلامات التجارية', path: 'trademarks'},
    {id: '5', name: 'المواقع', path: 'locations'},
    {id: '6', name: 'الفئات', path: 'tags'}
  ], [])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.settings} backLink={labels.back} />
      <Block>
        {sections.map(s => 
          <Button 
            large 
            fill 
            className="sections" 
            color={state.randomColors[i++ % 10].name} 
            href={`/${s.path}/`} 
            key={s.id}
          >
            {s.name}
          </Button>
        )}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Settings
