import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import {
  logoAltText, transparentHeader, headerHeight, logoLink,
} from '../config';

function Header({
  className,
}) {
  return (
    <div className={`${className}`}>
      <div className="container">
        <div className="row">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              {/* left align */}
              <Link to={logoLink}>
                <img src="https://i.postimg.cc/MpthtcR9/logo-conheca-branco.png" className="logo position-relative" alt={logoAltText} />
              </Link>
            </div>
            <div>
              {/* middle align */}
            </div>
            <div>
              {/* right align */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
Header.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(Header)`
  position: relative;
  z-index: 20;
  top: 0;
  width: 100%;
  background-color: ${transparentHeader ? 'none' : '#FFFFFF'};

  &>.row {
    height: ${headerHeight};
  }
  .logo {
    margin-top: 20px;

    /* imagem do logotipo com restrição de altura */
    // height: calc(0.4 * ${headerHeight});
    // width: auto;
    height: auto;
    max-width: 30vw;

    // Medium devices (tablets, 768px and up)
    @media (min-width: 768px) {
      height: calc(0.8 * ${headerHeight});
   }
  }
`;
