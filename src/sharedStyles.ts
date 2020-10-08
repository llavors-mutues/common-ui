import { css } from 'lit-element';

export const sharedStyles = css`
  .column {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    flex-direction: row;
  }

  .placeholder {
    opacity: 0.7;
  }

  .fill {
    flex: 1;
  }

  .center-content {
    justify-content: center;
    align-items: center;
  }

  .item {
    margin-bottom: 16px;
  }

  .padding {
    padding: 16px;
  }

  .title {
    font-weight: bold;
    font-size: 18px;
  }
`;
