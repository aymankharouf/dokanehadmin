import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'

const Spendings = () => {
  const { state, user } = useContext(StoreContext)
  const [spendings, setSpendings] = useState([])
  useEffect(() => {
    setSpendings(() => {
      const spendings = state.spendings.map(s => {
        const spendingTypeInfo = spendingTypes.find(t => t.id === s.type)
        return {
          ...s,
          spendingTypeInfo
        }
      })
      return spendings.sort((s1, s2) => s2.time.seconds - s1.time.seconds)
    })
  }, [state.spendings])

  if (!user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.spendings} backLink={labels.back} />
      <Block>
        <List mediaList>
          {spendings.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : spendings.map(s => {
              return (
                <ListItem
                  link={`/edit-spending/${s.id}`}
                  title={s.spendingTypeInfo.name}
                  subtitle={moment(s.time.toDate()).fromNow()}
                  after={(s.amount / 100).toFixed(2)}
                  key={s.id}
                />
              )
            })
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-spending/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Spendings
