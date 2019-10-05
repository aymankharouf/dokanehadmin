import React, { useContext } from 'react';
import { Page, Navbar, Block } from 'framework7-react';
import { StoreContext } from '../data/Store';

const NotFoundPage = props => {
  const { state } = useContext(StoreContext)
  return (
    <Page>
      <Navbar title={StaticRange.labels.notFoundPageTitle} backLink={state.labels.back} />
      <Block strong>
        <p>{state.labels.notFoundPageError}</p>
      </Block>
    </Page>
  )
}

export default NotFoundPage
