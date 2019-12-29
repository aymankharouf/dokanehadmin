import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const SectionCategories = props => {
  const { state } = useContext(StoreContext)
  const section = useMemo(() => state.sections.find(s => s.id === props.id)
  , [state.sections, props.id])
  const categories = useMemo(() => {
    const categories = state.categories.filter(c => c.sectionId === props.id)
    return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  }, [state.categories, props.id])

  return (
    <Page>
      <Navbar title={`${labels.categories} ${section.name}`} backLink={labels.back} />
      <Block>
        <List>
          {categories.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : categories.map(c =>
              <ListItem 
                link={`/editCategory/${c.id}`}
                title={c.name} 
                key={c.id} 
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="blue" onClick={() => props.f7router.navigate(`/editSection/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="green" onClick={() => props.f7router.navigate(`/addCategory/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default SectionCategories
