import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import PropTypes from 'prop-types';

function Markdown({ data }) {
  const { text } = data;

  return (
    <div className={className}>
      <div className="cartao">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}

Markdown.propTypes = {
  data: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
};

export default styled(Markdown)`
  background: transparent;

  .cartao{
      font-size: 4rem;
      background: transparent;
  }

`;
