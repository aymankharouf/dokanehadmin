import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const StoreBalance = props => {
  const { state } = useContext(StoreContext)
  const [store, setStore] = useState(() => state.stores.find(s => s.id === props.id))
  const [balances, setBalances] = useState([])
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === props.id))
  }, [state.stores, props.id])
  useEffect(() => {
    setBalances(() => {
      let balances = store.balances?.slice() || []
      balances = balances.map(b => {
        const monthDesc = `${Math.trunc(b.month / 100)}-${b.month % 100}`
        return {
          ...b,
          monthDesc,
        }
      })
      return balances.sort((b1, b2) => b2.month - b1.month)
    })
  }, [store])

  return(
    <Page>
      <Navbar title={`${labels.balanceTrans} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {balances.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : balances.map(b => {
              return (
                <ListItem
                  link={`/store-balance-trans/${props.id}/month/${b.month}`}
                  title={b.monthDesc}
                  after={(b.balance / 100).toFixed(2)}
                  key={b.month}
                />
              )
            })
          }
        </List>
      </Block>
      <Footer/>
    </Page>
  )
}

export default StoreBalance
