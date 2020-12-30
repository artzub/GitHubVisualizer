import styled from 'styled-components';

const Property = styled.span`
  display: flex;
  align-items: center;
  margin-left: 5px;
  padding-right: 5px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    border-right: 0;
    padding-right: 0;
  }

  color: #fff;
`;

export default Property;
