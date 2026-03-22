import React, { Component } from 'react';

class BrandLogo extends Component {
  render() {
    const { size = 44 } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <polygon points="4,56 32,8 32,32"        fill="#00CED1" opacity="0.15" />
        <polygon points="60,56 32,8 32,32"        fill="#00A8AB" opacity="0.15" />
        <polygon points="4,56 32,32 18,56"        fill="#00CED1" opacity="0.5"  />
        <polygon points="60,56 32,32 46,56"       fill="#0099A8" opacity="0.55" />
        <polygon points="32,8 20,34 32,28"        fill="#00CED1" opacity="0.9"  />
        <polygon points="32,8 44,34 32,28"        fill="#00B8C4" opacity="0.75" />
        <polygon points="32,22 42,36 32,42 22,36" fill="#00CED1" opacity="1"    />
        <polygon points="32,26 38,34 32,38 26,34" fill="#ffffff" opacity="0.55" />
        <polygon points="14,56 32,42 50,56"       fill="#00CED1" opacity="0.3"  />
        <polygon points="4,56 18,56 22,36"        fill="#007f8a" opacity="0.25" />
        <polygon points="60,56 46,56 42,36"       fill="#007f8a" opacity="0.2"  />
      </svg>
    );
  }
}

export default BrandLogo;