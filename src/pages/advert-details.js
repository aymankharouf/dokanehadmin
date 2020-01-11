import React, { useContext, useMemo } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, Toolbar, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import BottomToolbar from './bottom-toolbar'

const AdvertDetails = props => {
  const { state } = useContext(StoreContext)
  const advert = useMemo(() => state.adverts.find(a => a.id === props.id)
  , [state.adverts, props.id])
  return (
    <Page>
      <Navbar title={labels.advertDetails} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/edit-advert/${props.id}`}>
        <Icon material="edit"></Icon>
      </Fab>
      <Card>
        <CardContent>
          <div className="card-title">{advert.title}</div>
          <img src={advert.imageUrl} className="img-card" alt={advert.title} />
        </CardContent>
        <CardFooter>
          <p>{advert.text}</p>
        </CardFooter>
      </Card>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default AdvertDetails