import * as React from 'react';
import { Switch } from '@components/Switch';
import { Settings, setSettings } from '~/Settings';

export const EventTrackingConfig = (): JSX.Element => {
  const [isAutoEventTrackingActive, setIsAutoEventTrackingActive] =
    React.useState(false);

  React.useEffect(() => {
    setIsAutoEventTrackingActive(Settings.isAutoEventTrackingActive);
  }, []);

  const handleSwitch = (value: boolean) => {
    setIsAutoEventTrackingActive(value);
    setSettings({
      isAutoEventTrackingActive: value,
    });
  };

  return (
    <Switch
      name="Ativar evento de tracking automático"
      isChecked={isAutoEventTrackingActive}
      onChange={handleSwitch}
    />
  );
};
