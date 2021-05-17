import {useContext, useState, useEffect} from 'react'
import {Page, Navbar, Card, CardContent, CardFooter, Fab, Icon} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { useParams } from 'react-router'

type Params = {
  id: string
}
const AdvertDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [advert, setAdvert] = useState(() => state.adverts.find(a => a.id === params.id))
  useEffect(() => {
    setAdvert(() => state.adverts.find(a => a.id === params.id))
  }, [state.adverts, params.id])
  return (
    <Page>
      <Navbar title={labels.advertDetails} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/edit-advert/${params.id}`}>
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
    </Page>
  )
}

export default AdvertDetails
