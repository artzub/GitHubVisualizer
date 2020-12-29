import React from "react";
import slice from '@/redux/modules/emojis';
import { makeId } from "@/shared/utils";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import styled from "styled-components";

const Image = styled.img`
  height: 1em;
`;

const reg = /(:[\w\d_+]+:)/g;
const GithubEmoji = ({ text }) => {
  const { items } = useSelector(slice.selectors.getState);

  if (!text) {
    return null;
  }

  if (!reg.test(text)) {
    return text;
  }

  return text.split(reg).map((part) => {
    const has = reg.test(part) && items[part.replaceAll(':', '')];

    return has ? (<Image alt={part} src={has} key={makeId()} />) : part;
  });
};

GithubEmoji.propTypes = {
  text: PropTypes.string,
};

GithubEmoji.defaultProps = {
  text: '',
};

export default GithubEmoji;
