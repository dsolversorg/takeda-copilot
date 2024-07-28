import { createGlobalStyle } from 'styled-components';

export const primaryAccent = '#169ca9';
export const seconderyAccent = '#fff';

export default createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    height: 100vh;
    overflow: hiden;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  html, body {
      height: 100%;
  }
  body {
      min-height: 100vh;
  }
  svg {
    vertical-align: -0.125em;
  }

  .btn.primary-accent {
    border: 1px solid ${primaryAccent};
    background: #169ca9;
    color: #FFF;
    text-align: center;
    width: 600px;
    height: auto;
    font-size: 15px;
  }
  @media screen and (min-width: 800px) {
    .btn.primary-accent {
      border: 1px solid ${primaryAccent};
      background: #169ca9;
      color: #FFF;
      text-align: center;
      width: 400px;
      height: auto;
      font-size: 30px;
    }
  }
  
  .form-check-input:checked {
    background-color: ${primaryAccent};
    border-color: ${primaryAccent};
  }
  .btn-unstyled {
    border: none;
    background: none;
  }

  .card{
    border: 1px solid ${primaryAccent};
    background: #169ca9;
    color: #FFF;
    text-align: center;
    font-size: 30px;
    width: auto;
    height: auto;
    font-size: 15px;      
  }
  @media screen and (min-width: 800px) {
    .card{
      border: 1px solid ${primaryAccent};
      background: #169ca9;
      color: #FFF;
      text-align: center;
      width: 400px;
      height: auto;
      font-size: 30px;
    }
  }

  .error-modal {
    position: absolute;
    top: 0;
    left: 0;
    min-width: 100vw;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    background: rgba(0,0,0,0.2);

    .error-modal-card {
      background: #FFF;
      border: 1px solid rgba(0,0,0,0.2);
      border-radius: 10px;
      max-width: 30rem;
      padding: 1rem;
    }
    .error-modal-inner {
      padding: 1rem;
    }
  }
`;
