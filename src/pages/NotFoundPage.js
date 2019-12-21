import React, { useContext } from 'react';
import { Page, Navbar, Block } from 'framework7-react';
import { StoreContext } from '../data/Store';

const NotFoundPage = props => {
  const { state } = useContext(StoreContext)
  return (
    <Page>
      <Navbar title={state.labels.notFoundPageTitle} backLink={state.labels.back} className="page-title" />
      <Block strong>
        <p>{state.labels.notFoundPageError}</p>
      </Block>
    </Page>
  )
}

export default NotFoundPage
