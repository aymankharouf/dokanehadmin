import { useContext, useState, useEffect } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, Fab, Icon, Toolbar } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import Footer from './footer'

interface Props {
  id: string
}
const AdvertDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [advert, setAdvert] = useState(() => state.adverts.find(a => a.id === props.id))
  useEffect(() => {
    setAdvert(() => state.adverts.find(a => a.id === props.id))
  }, [state.adverts, props.id])
  return (
    <Page>
      <Navbar title={labels.advertDetails} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/edit-advert/${props.id}`}>
        <Icon material="edit"></Icon>
      </Fab>
      <Card>
        <CardContent>
          <div className="card-title">{advert?.title}</div>
          <img src={advert?.imageUrl} className="img-card" alt={advert?.title} />
        </CardContent>
        <CardFooter>
          <p>{advert?.text}</p>
        </CardFooter>
      </Card>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default AdvertDetails
