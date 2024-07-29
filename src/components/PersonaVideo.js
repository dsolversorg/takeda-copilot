/* eslint-disable jsx-a11y/media-has-caption */
import React, { createRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as actions from '../store/sm';
import proxyVideo from '../proxyVideo';
import { headerHeight, transparentHeader } from '../config';

function PersonaVideo({
  className,
}) {
  const dispatch = useDispatch();
  const setVideoDimensions = (videoWidth, videoHeight) => dispatch(
    actions.setVideoDimensions({ videoWidth, videoHeight }),
  );
  const { isOutputMuted, loading, connected } = useSelector(({ sm }) => ({ ...sm }));
  const videoRef = createRef();
  const containerRef = createRef();
  const [videoDisplayed, setVideoDisplayed] = useState(false);
  const [height, setHeight] = useState('100vh');

  const handleResize = () => {
    if (containerRef.current) {
      const videoWidth = containerRef.current.clientWidth;
      const videoHeight = containerRef.current.clientHeight;

      // Ajusta as dimensões do vídeo para dispositivos móveis
      const isMobile = window.innerWidth <= 768;
      const adjustedHeight = isMobile ? 'auto' : `${videoHeight}px`;
      setHeight(adjustedHeight);

      setVideoDimensions(videoWidth, videoHeight);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    if (connected) {
      if (!videoDisplayed) {
        videoRef.current.srcObject = proxyVideo.srcObject;
        setVideoDisplayed(true);
      }
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [connected, videoDisplayed]);

  return (
    <div ref={containerRef} className={className} style={{ height }}>
      {
        connected
          ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="persona-video"
              id="personavideo"
              data-sm-video
              muted={isOutputMuted}
            />
          )
          : null
      }
      {
        loading
          ? (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )
          : null
      }
      {
        connected === false && loading === false ? 'disconnected' : ''
      }
    </div>
  );
}

PersonaVideo.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(PersonaVideo)`
  width: 100vw;
  height: 100vh;

  position: fixed;
  z-index: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${transparentHeader ? '' : headerHeight};

  .persona-video {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
  }    
`;
