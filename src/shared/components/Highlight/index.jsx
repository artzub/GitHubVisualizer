import styled from 'styled-components';

import { makeId } from '@/shared/utils/makeId';

const Highlighted = styled.span`
  color: ${({ theme }) => theme.palette.primary.light};
`;

const Highlight = ({ search, text }) => {
  if (!search || !text) {
    return text;
  }

  const searchLowerCase = `${search}`.toLowerCase();
  // eslint-disable-next-line security/detect-non-literal-regexp
  const reg = new RegExp(`(${escape(searchLowerCase)})`, 'ugi');
  const textParts = `${text}`.split(reg);
  return textParts.map((textPart) => (textPart.toLowerCase() === searchLowerCase ? (
    <Highlighted key={makeId()}>{textPart}</Highlighted>
  ) : (
    textPart
  )));
};

export default Highlight;
