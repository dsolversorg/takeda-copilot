import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import PropTypes from 'prop-types';

function Markdown({ data }) {
  const { text } = data;

  return (
    <div className="card">
      <div className="card-body">
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

  .h2{
    font-size: 15px;
    background: transparent;
  }  
`;
