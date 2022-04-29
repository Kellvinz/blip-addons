import * as React from 'react';
import { SketchPicker } from 'react-color';

import * as Constants from '../Constants';

export type ColorBlockOptionProps = {
  id: string;
  onSetColor: (id: string, color: string) => void;
  defaultColor: string;
};

const WHITE = '#ffffff';

export const ColorBlockOption = ({
  id,
  onSetColor,
  defaultColor = WHITE,
}: ColorBlockOptionProps): JSX.Element => {
  const [color, setColor] = React.useState({ hex: defaultColor });

  const handleChange = (color): void => {
    setColor(color);
    onSetColor(id, color.hex);
  };

  return (
    <div>
      <SketchPicker
        color={color}
        onChange={handleChange}
        presetColors={Constants.PRESET_COLORS}
      />
    </div>
  );
};
