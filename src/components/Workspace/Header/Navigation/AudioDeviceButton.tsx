import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';

export const AudioDeviceButton = (props: any) => {
  return (
    <IconButton {...props} aria-label="audio-devices">
      <SvgIcon>
        <svg width="23" height="24">
          <g transform="translate(.226 1)" fill="#FFF" fillRule="evenodd">
            <path
              d="M18.43 19.929a2.873 2.873 0 01-1.424-.04c-1.468-.393-2.304-1.828-1.907-3.157l1.496-4.88c.19-.65.669-1.196 1.31-1.536.646-.317 1.38-.412 2.089-.21 1.468.394 2.304 1.83 1.907 3.158l-1.515 4.908c-.189.65-.668 1.196-1.309 1.536a3.3 3.3 0 01-.646.22zM3.43 10.071a2.873 2.873 0 00-1.424.04C.538 10.504-.298 11.939.1 13.268l1.496 4.88c.19.65.669 1.196 1.31 1.536.646.317 1.38.412 2.089.21 1.468-.394 2.304-1.83 1.907-3.158l-1.515-4.908c-.189-.65-.668-1.196-1.309-1.536a3.3 3.3 0 00-.646-.22z"
              fillRule="nonzero"
            />
            <path
              d="M19.6 6.077C18.459 2.014 14.167-.054 10.515.001 6.359.056 3.26 2.531 2.24 6.576c-.554 2.216-.139 4.894 1.142 7.35l.035.074.761-.462-.034-.055C2.967 11.23 2.586 8.792 3.07 6.816 3.988 3.178 6.775.98 10.514.924h.138c3.271 0 7.097 1.866 8.1 5.412.676 2.419.433 4.672-.76 7.073l-.036.074.78.443.034-.074c1.298-2.604 1.558-5.152.83-7.775z"
              stroke="#FFF"
              fillRule="nonzero"
            />
            <rect x="9" y="20" width="4" height="3" rx="1.5" />
            <path
              d="M12.578 22H7.541C5.897 22 4 20.788 4 19.23v-3.845c0-.212.19-.385.422-.385.231 0 .421.173.421.385v3.846c0 1.077 1.476 1.98 2.698 1.98h5.037c.232 0 .422.174.422.385 0 .23-.19.404-.422.404z"
              fillRule="nonzero"
            />
          </g>
        </svg>
      </SvgIcon>
    </IconButton>
  );
};
