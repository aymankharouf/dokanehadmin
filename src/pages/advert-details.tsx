import { useContext, useState } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import Footer from './footer'

const AdvertDetails = (props: any) => {
  const { state } = useContext(StoreContext)
  const [advert] = useState(() => state.adverts.find((a: any) => a.id === props.id))
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
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default AdvertDetails