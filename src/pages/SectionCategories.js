import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const SectionCategories = props => {
  const { state } = useContext(StoreContext)
  const section = useMemo(() => state.sections.find(rec => rec.id === props.id), [state.sections])
  const categories = useMemo(() => {
    const categories = state.categories.filter(rec => rec.sectionId === props.id)
    return categories.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
  }, [state.categories])

  return (
    <Page>
      <Navbar title={`${state.labels.categories} - ${section.name}`} backLink={state.labels.back} />
      <Block>
        <List>
          {categories && categories.map(rec =>
            <ListItem 
              link={`/editCategory/${rec.id}`}
              title={rec.name} 
              key={rec.id} 
              badge={rec.isActive === false ? state.labels.inActive : ''}
              badgeColor='red' 
            />
          )}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="orange">
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
