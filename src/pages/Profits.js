import React, { useState, useContext } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const Profits = props => {
  const { state } = useContext(StoreContext)
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  return (
    <Page>
      <Navbar title={state.labels.profits} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="month" 
          label={state.labels.month} 
          floatingLabel
          clearButton
          type="number"
          value={month}
          onChange={e => setMonth(e.target.value)}
          onInputClear={() => setMonth('')}
        />
        <ListInput 
          name="year" 
          label={state.labels.year} 
          floatingLabel
          clearButton
          type="number"
          value={year}
          onChange={e => setYear(e.target.value)}
          onInputClear={() => setYear('')}
        />
      </List>
      {!month || !year ? '' : 
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" href={`/monthlyTrans/${year * 100 + Number(month)}`}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default Profits
