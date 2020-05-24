import React from 'react';
import { Link } from 'react-router-dom';

export const Offline = () => {
  return (
    <div className="you-are-offline">
      You are offline, <Link to="/">back to login</Link>
    </div>
  );
};
