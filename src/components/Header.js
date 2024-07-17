import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  logoAltText, transparentHeader, headerHeight, logoLink,
} from '../config';
import {
  disconnect,
} from '../store/sm/index';
import {
  Escape,
  Share,
  ThreeDotsVertical,
  X,
} from 'react-bootstrap-icons';

function Header({
  className,
}) {

  const [showContextMenu, setShowContextMenu] = useState(false);
  const iconSize = 24;

  const {
    highlightMenu,
  } = useSelector((state) => ({ ...state.sm }));

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
              <div className="context-control-parent">
                {/* menu mais opções */}
                <button
                  className="control-icon context-controls-trigger"
                  type="button"
                  aria-label="Mais opções"
                  data-tip="Mais opções"
                  id="dpChatDropdown"
                  onClick={() => setShowContextMenu(!showContextMenu)}
                >
                  {showContextMenu ? (
                    <X size={iconSize} color="#fff" />
                  ) : (
                    <ThreeDotsVertical size={iconSize} color="#fff" style={{ border: highlightMenu ? 'red 2px solid' : '' }} />
                  )}
                </button>
                {showContextMenu ? (
                  <div className="context-controls shadow">
                    <div className="d-flex justify-content-end align-items-start">
                      <ul>
                        <li>
                          <button
                            className="btn-unstyled "
                            type="button"
                            onClick={() => dispatch(disconnect())}
                          >
                            <Escape size={18} />
                            {' '}
                            Encerrar sessão
                          </button>
                        </li>
                        <li>
                          <button
                            className="btn-unstyled"
                            type="button"
                            onClick={() => shareDP()}
                          >
                            <Share size={18} />
                            {' '}
                            {shareCopy}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
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
