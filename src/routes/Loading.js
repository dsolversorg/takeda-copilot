import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeftCircleFill, ArrowRightCircleFill, MicFill } from 'react-bootstrap-icons';
import { createScene } from '../store/sm';
import Header from '../components/Header';
import { headerHeight, landingBackgroundColor, landingBackgroundImage } from '../config';

function Loading({ className }) {
  const {
    connected,
    loading,
    error,
    requestedMediaPerms,
    connectionState = {},
  } = useSelector(({ sm }) => (sm));

  const {
    percentageLoaded = 0,
    name = '',
    currentStep = 0,
    totalSteps = 0,
  } = connectionState;

  const dispatch = useDispatch();

  const stateNameMap = {
    SearchingForDigitalPerson: 'Searching For Digital Person',
    DownloadingAssets: 'Downloading Assets',
    ConnectingToDigitalPerson: 'Connecting To Digital Person',
  };
  const stateName = (name in stateNameMap) ? stateNameMap[name] : name;

  const createSceneIfNotStarted = () => {
    if (loading === false && connected === false && error === null) {
      dispatch(createScene());
    }
  };

  useEffect(() => {
    createSceneIfNotStarted();
  }, []);

  const iconSize = 66;
  const [page, setPage] = useState(0);
  const pages = [
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon mb-2">
          <MicFill size={iconSize} />
        </div>
      </div>
      <div className="row">
        <div className="d-flex align-items-center justify-content-between">
          <button className="btn-unstyled" type="button" style={{ opacity: 0, width: '44px' }} aria-label="Botão invisível">
            {' '}
          </button>
          <h4>
            Antes de começar
          </h4>
          <button className="btn-unstyled" type="button" onClick={() => setPage(page + 1)} aria-label="Próximo">
            <ArrowRightCircleFill size={32} />
          </button>
        </div>
        <div className="mt-0 mb-2">
          {requestedMediaPerms.mic === true && requestedMediaPerms.micDenied === false
            ? (
              <div>
                <p>
                  Sou a Katia uma Pessoa Digital, eu funciono melhor em um ambiente silencioso,
                  quando você está próximo ao microfone e a câmera ligada.
                </p>
                <p>
                  Fale claramente e em respostas curtas.
                </p>
              </div>
            )
            : (
              <div>
                <p>
                  Sou a Katia uma Pessoa Digital, eu funciono melhor com o microfone ligado.
                  Habilite seu microfone a qualquer momento durante a experiência
                  clicando no ícone do microfone e concedendo as permissões.
                </p>
                <p>
                  Fale claramente e em respostas curtas.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>,
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon mb-2">
          <div className="fs-4 fw-bold mt-2">
            &ldquo;Olá! Como você está?&rdquo;
          </div>
        </div>
      </div>
      <div className="row">
        <div className="d-flex align-items-center justify-content-between">
          <button className="btn-unstyled" type="button" onClick={() => setPage(page - 1)} aria-label="Anterior">
            <ArrowLeftCircleFill size={32} />
          </button>
          <h4>
            O que fazer?
          </h4>
          <button className="btn-unstyled" type="button" onClick={() => setPage(page + 1)} aria-label="Próximo">
            <ArrowRightCircleFill size={32} />
          </button>
        </div>
        <div className="mt-0 mb-2">
          O Digital Person ouvirá tudo o que você disser.
          Outras opções, como digitar ou escolher suas respostas, também estão disponíveis.
        </div>
      </div>
    </div>,
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon tutorial-icon-dp mb-2" />
      </div>
      <div className="row">
        <div className="d-flex align-items-center justify-content-between">
          <button className="btn-unstyled" type="button" onClick={() => setPage(page - 1)} aria-label="Anterior">
            <ArrowLeftCircleFill size={32} />
          </button>
          <h4>
            Sobre o que você pode falar?
          </h4>
          <button className="btn-unstyled" type="button" style={{ opacity: 0, width: '44px' }} aria-label="Botão invisível">
            {' '}
          </button>
        </div>
        <div className="mt-0 mb-2">
          Você pode explorar os recursos da minha UI,
          ver exemplos dos diferentes conteúdos de suporte
          que posso mostrar ou ouvir sobre as atualizações
          mais recentes do modelo de IU que estou usando.
        </div>
      </div>
    </div>,
  ];

  const [skip, setSkip] = useState(false);
  const redirectToVideoOnConnect = () => {
    setSkip(true);
  };
  const history = useHistory();
  useEffect(() => {
    if (skip === true && connected === true) history.push('/takeda-copilot');
  }, [connected, skip]);

  return (
    <div className={className}>
      <Header />
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-11 col-md-6 text-center mobile">
            <div className="row">
              {pages[page]}
            </div>
            <div className="row justify-content-center">
              <div>
                {page < pages.length - 1
                  ? (
                    <button
                      className="btn primary-accent m-2"
                      type="button"
                      onClick={() => setPage(page + 1)}
                      style={{ backgroundColor: '#3C3C3C', border: '2px solid #3C3C3C' }}
                      aria-label="Próximo"
                    >
                      Next
                    </button>
                  )
                  : null}
              </div>
            </div>
            <div className="row">
              <div>
                <button
                  className={`${connected || page >= pages.length - 1 ? 'btn btn-dark connected-button' : 'btn-unstyled unconnected-button'} m-2`}
                  type="button"
                  disabled={skip}
                  onClick={redirectToVideoOnConnect}
                  aria-label={connected || page >= pages.length - 1 ? 'Falar agora' : 'Pular'}
                >
                  {connected || page >= pages.length - 1 ? 'Falar agora' : 'Pular'}
                  {!connected && skip
                    ? (
                      <div className="ms-1 spinner-border spinner-border-sm text-secondary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                    )
                    : null}
                </button>
              </div>
            </div>
            <div className="row justify-content-center">
              <div>
                {pages.map((_, i) => (
                  <div key={`${i}-${i === page}`} className="d-inline-block p-1">
                    {i === page ? <div className="closed-dot" /> : <div className="open-dot" />}
                  </div>
                ))}
              </div>
            </div>
            {percentageLoaded < 100 && (
              <div>
                <div className="progress mt-1">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${percentageLoaded}%` }}
                    aria-label={`${stateName} (${currentStep} out of ${totalSteps - 1})`}
                    aria-valuenow={percentageLoaded}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
                {stateName && (
                  <pre>
                    {`${stateName} (${currentStep} out of ${totalSteps - 1} steps)`}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Loading.propTypes = {
  className: PropTypes.string.isRequired,
};

const StyledLoading = styled(Loading)`
  min-height: calc(100vh - ${headerHeight});
  background: ${landingBackgroundColor} url(${landingBackgroundImage});
  background-size: cover;
  background-repeat: no-repeat;

  .mobile {
    margin-top: 8vh;
  }

  .tutorial-icon {
    font-size: 72px;
    color: white;
  }

  .tutorial-icon-dp {
    background: url('/images/dp-image.png');
    background-size: cover;
    background-repeat: no-repeat;
    width: 72px;
    height: 72px;
  }

  .primary-accent {
    background-color: #3C3C3C;
    border: 2px solid #3C3C3C;
  }

  .connected-button {
    background-color: #1D8F8E;
    border: 2px solid #1D8F8E;
    color: white;
  }

  .unconnected-button {
    background-color: transparent;
    border: 2px solid #1D8F8E;
    color: #1D8F8E;
  }

  .closed-dot {
    width: 12px;
    height: 12px;
    background-color: #1D8F8E;
    border-radius: 50%;
  }

  .open-dot {
    width: 12px;
    height: 12px;
    background-color: transparent;
    border: 2px solid #1D8F8E;
    border-radius: 50%;
  }
`;

export default StyledLoading;
