import React, { Component } from 'react';
import classnames from 'classnames';
import Scroll from 'react-scroll';

import Flux from 'app/flux';
import Nulls from 'app/flux/nulls';

import Track from 'app/adaptors/server/track';
import SVG from 'app/components/svg';
import FramesUstwoLogo from 'app/components/frames-ustwo-logo';

class Navigation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      height: 0
    }
  }

  componentDidMount() {
    this.setState({
      height: this.navigation.getBoundingClientRect().height
    })
  }

  toggleMenu() {
    const { viewportDimensions, documentScrollPosition, section, modal } = this.props;

    if (documentScrollPosition < viewportDimensions.height && section === 'home') {
      Scroll.animateScroll.scrollTo(viewportDimensions.height);
      Scroll.Events.scrollEvent.register('end', () => {
        if (modal === 'menu') {
          Flux.closeModal();
        } else {
          Flux.showNavOverlay();
        }
      });
    } else {
      if (modal === 'menu') {
        Flux.closeModal();
      } else {
        Flux.showNavOverlay();
      }
    }
  }

  onClickLogo(event) {
    event.preventDefault();
    Flux.navigate('/');
  }

  render() {
    const { section, page, takeover, customClass, documentScrollPosition, venturesPosition, popup, modal, viewportDimensions, pageLoading } = this.props;

    const venturesActive = venturesPosition && (documentScrollPosition - viewportDimensions.height > venturesPosition.from - (viewportDimensions.height * .15)) && (documentScrollPosition - viewportDimensions.height < venturesPosition.to);

    const navClasses = classnames('navigation', customClass, section, page, {
      notSticky: documentScrollPosition < viewportDimensions.height && section === 'home',
      invert: venturesActive,
      overHero: documentScrollPosition < viewportDimensions.height - this.state.height, // Assuming hero is 100% height at the top of the screen,
      menuOpen: modal === 'menu',
      pageLoading: pageLoading,
      takeover
    });

    let ringColour1, ringColour2;
    switch(section) {
      case 'home':
        ringColour1 = '#16D6D9';
        ringColour2 = '#96CC29';
        break;
      case 'work':
        ringColour1 = '#6114CC';
        ringColour2 = '#FA7D78';
        break;
      case 'blog':
        ringColour1 = '#009CF3';
        ringColour2 = '#16D6D9';
        break;
      case 'events':
        ringColour1 = '#ED0082';
        ringColour2 = '#FA7D78';
        break;
      case 'join-us':
        ringColour1 = '#FFBF02';
        ringColour2 = '#FA7D78';
        break;
    }

    return (
      <nav className={navClasses} ref={(ref) => this.navigation = ref}>
        <div className="menu-no-js">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/work">Work</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="/join-us">Join us</a></li>
          </ul>
        </div>
        <button className="logo" onClick={this.toggleMenu.bind(this)}>
          <SVG title="ustwo logo" spritemapID="ustwologo" />
        </button>
        <button className="navigation-toggle" onClick={this.toggleMenu.bind(this)}>
          <div className="navigation-toggle-main"></div>
          <svg className="navigation-toggle-ring" title="menu ring" role="img" viewBox="0 0 46 46">
            <g>
              <defs>
                <linearGradient id="menu-ring-gradient">
                  <stop offset="0%" stopColor={ringColour1} />
                  <stop offset="100%" stopColor={ringColour2} />
                </linearGradient>
              </defs>
              <path fill="url(#menu-ring-gradient)" d="M34.3531775,13.2358659 C39.0854263,11.632127 42.420778,11.4208476 43.0595914,12.4119639 C44.3577086,14.4259876 37.2980891,21.9063148 26.9172469,28.1969163 C16.5074443,34.5050674 6.44365075,37.3898518 5.11324733,35.3257362 C4.54113264,34.4381026 5.96248369,31.8711717 9.17454489,28.6755235 L8.33196632,26.0139308 C3.6067824,30.4263054 1.42828424,34.2231405 3.01191042,36.6801302 C5.52391005,40.5774877 16.5049571,37.4297727 28.212878,30.3349856 C39.9497592,23.222649 47.7052141,15.0050192 45.1609283,11.0575699 C43.5494377,8.55734872 38.8172973,8.88579695 32.3529781,11.2894457 L34.3531775,13.2358659 Z" id="Oval-5"></path>
            </g>
          </svg>
        </button>
      </nav>
    );
  }
};

export default Navigation;
