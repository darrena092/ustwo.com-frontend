'use strict'

import 'app/adaptors/server/svg4everybody';
import React from 'react';
import Meta from "react-helmet";
import TransitionManager from 'react-transition-manager';
import classnames from 'classnames';
import { get } from 'lodash';
import find from 'lodash/collection/find';
import includes from 'lodash/collection/includes';
import Flux from 'app/flux';

// TODO: see if there's a better way to get fonts in
import 'app/adaptors/server/localfont';

import window from 'app/adaptors/server/window';
import 'app/lib/animate';

import Store from 'app/flux/store';
import Nulls from 'app/flux/nulls';
import PageContainer from 'app/components/page-container';
import Navigation from 'app/components/navigation';
import Footer from 'app/components/footer';
import Modal from 'app/components/modal';
import EntranceTransition from 'app/components/entrance-transition';
import ContactTray from 'app/components/contact-tray';
import TakeOver from 'app/components/take-over';
import FourOhFour from 'app/components/404';
import BlogCategories from 'app/components/blog-categories';
import NavigationOverlay from 'app/components/navigation-overlay';
import Popup from 'app/components/popup';
import HomeLoader from 'app/components/home-loader';
import ScrollWrapper from 'app/components/scroll-wrapper';
import PageContent from 'app/components/page-content';

const pageMap = {
  'home': require('app/components/home'),
  'work': require('app/components/work'),
  'work/case-study': require('app/components/case-study'),
  'blog': require('app/components/blog'),
  'blog/post': require('app/components/post'),
  'blog/search-results': require('app/components/search-results'),
  'legal': require('app/components/legal'),
  'join-us': require('app/components/join-us'),
  'events': require('app/components/events'),
  'events/event': require('app/components/event')
};

const spinnerBlacklist = ['legal', 'blog/search-results'];

function getDocumentScrollPosition(component) {
  return () => {
    component.setState({
      documentScrollPosition: document.scrollingElement.scrollTop,
    });
  }
}

const App = React.createClass({

  getInitialState() {
    const state = this.props.state;
    state['documentScrollPosition'] = 0;
    state['scrolling'] = false;
    state['show'] = false;
    state['appLoading'] = false;
    state['viewportDimensions'] = {};
    state['isMobile'] = null;

    return state;
  },

  getViewportDimensions() {
    const viewportDimensions = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.setState({
      viewportDimensions,
      isMobile: window.innerWidth < 600
    });
  },

  componentWillMount() {
    const { page } = this.state;

    this.setState({
      appLoading: page.slug && page.slug === 'home'
    });
    this.getViewportDimensions();
  },

  componentDidMount() {
    const { page, currentPage, post, caseStudy, appLoading, scrolling } = this.state;

    setTimeout(() => {
      this.setState({ show: true });
    }.bind(this), 1000);

    if (appLoading) {
      document.body.style.overflow = "hidden";
      // TODO: Remove timeout and actually act as a loader (of the video)
      setTimeout(() => {
        this.setState({ appLoading: false });
      }.bind(this), 6500);
    }

    window.addEventListener('resize', () => {
      this.getViewportDimensions();
    });

    Store.on('change', this.onChangeStore);
    window.addEventListener('scroll', getDocumentScrollPosition(this));

    /* is the user scrolling? Turn off some unperformant css, e.g. box-shadow? */
    window.onscroll = () => {
      this.setState({ scrolling: true })
    };
    setInterval(() => {
      if (scrolling) {
        this.setState({ scrolling: false })
      }
    }, 200);
  },

  componentWillUnmount() {
    Store.removeListener('change', this.onChangeStore);
    window.removeEventListener('scroll', getDocumentScrollPosition(this));
    window.removeEventListener('resize', () => {
      this.getViewportDimensions();
    });
  },

  onChangeStore(state) {
    this.setState(state);
  },

  showTakeover() {
    const { currentPage, takeover } = this.state;
    return currentPage === 'home' && takeover && !takeover.seen;
  },

  renderModal() {
    const { takeover, modal: modalType } = this.state;
    let modal, className, content;
    if (this.showTakeover()) {
      modal = <TakeOver key="takeover" takeover={takeover} />;
    } else if (modalType) {
      switch(modalType) {
        case 'menu':
          className = 'menu';
          content = (
            <NavigationOverlay
              pages={this.state.navMain}
              section={this.state.currentPage.split('/')[0]}
            />
          );
          break;
        case 'contacts':
          className = 'tray';
          content = <ContactTray contacts={state.footer.contacts} />;
          break;
        case 'blogCategories':
          className = 'modal-blog-categories';
          content = <BlogCategories />;
          break;
      }
      modal = <Modal key={modalType} className={className}>{content}</Modal>;
    }
    return (
      <TransitionManager
        component="div"
        className="app__modal"
        duration={320}
      >
        {modal}
      </TransitionManager>
    );
  },

  renderPopup() {
    const { popup: popupType, documentScrollPosition, viewportDimensions, isMobile } = this.state;
    let popup;
    if (!!popupType) {
      popup = (
        <Popup
          key={popupType}
          type={popupType}
          className={popupType}
          documentScrollPosition={documentScrollPosition}
          viewportDimensions={viewportDimensions}
          isMobile={isMobile}
        />
      );
    }
    return (
      <TransitionManager
        component="div"
        className="app__popup"
        duration={320}
      >
        {popup}
      </TransitionManager>
    );
  },

  render() {
    const state = this.state;
    const { currentPage, show, appLoading, popup, showPopup, showRollover, menuHover, modal, viewportDimensions,
      page, post, caseStudy, navMain, documentScrollPosition, venturesPosition, footer, studios } =this.state;

    const appClasses = classnames('app', `page-${currentPage}`, {
      'show': show,
      'loaded': !appLoading,
      'app-404': currentPage === 'notfound',
      'overflow-hidden': popup
    });
    const contentClasses = classnames('app-content', showPopup, showRollover, menuHover, {
      'takeover': this.showTakeover(),
      'disabled': !!modal,
      'mobile-no-scroll': modal || this.showTakeover(),
    });
    if (!!modal || !!popup) {
      document.body.style.overflow = "hidden";
    } else if (modal === null && !appLoading || popup === null && !appLoading) {
      document.body.style.overflow = "auto";
    }
    let content, loader;

    const pageLoading = !includes(spinnerBlacklist, currentPage) && !page && !post && !caseStudy;

    if (state.currentPage === 'notfound') {
      content = (
        <div className={appClasses}>
          <Navigation
            pages={navMain}
            section={currentPage.split('/')[0]}
            page={currentPage.split('/')[1]}
            takeover={this.showTakeover()}
            documentScrollPosition={documentScrollPosition}
            venturesPosition={venturesPosition}
            modal={modal}
            viewportDimensions={viewportDimensions}
          />
          <FourOhFour {...this.state} />
          {this.renderModal()}
        </div>
      );
    } else {
      const loader = appLoading ? <HomeLoader loading={appLoading} /> : <div />
      content = (
        <div className={appClasses}>
          <Meta
            title={get(state, 'page.seo.title') || get(state, 'post.seo.title') || ''}
            meta={[{
              name: "description",
              content: get(state, 'page.seo.desc') || get(state, 'post.seo.desc') || ''
            }, {
              name: "keywords",
              content: get(state, 'page.seo.keywords') || get(state, 'post.seo.keywords') || ''
            }, {
              property: "og:type",
              content: 'website'
            }, {
              property: "og:title",
              content: get(state, 'page.seo.title') || get(state, 'post.seo.title') || ''
            }, {
              property: "og:description",
              content: get(state, 'page.seo.desc') || get(state, 'post.seo.desc') || ''
            }, {
              property: "og:image",
              content: get(state, 'page.seo.image') || get(state, 'post.seo.image') || ''
            }]}
          />
          <EntranceTransition className="nav-wrapper">
            <Navigation
              pages={navMain}
              section={currentPage.split('/')[0]}
              page={currentPage.split('/')[1]}
              takeover={this.showTakeover()}
              documentScrollPosition={documentScrollPosition}
              venturesPosition={venturesPosition}
              modal={modal}
              viewportDimensions={viewportDimensions}
            />
          </EntranceTransition>
          <PageContainer key={currentPage} extraClasses={contentClasses}>
            <PageContent
              pageMap={pageMap}
              pageState={this.state}
              currentPage={currentPage}
              pageLoading={pageLoading}
            />
            <Footer data={footer} studios={studios} currentPage={currentPage}/>
          </PageContainer>
          {this.renderModal()}
          {this.renderPopup()}
          {loader}
        </div>
      );
    }
    return content;
  }
});

export default App;
