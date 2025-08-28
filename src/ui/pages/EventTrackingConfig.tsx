import * as React from "react";
import { Block, HorizontalStack, Switch } from "@components";
import { Settings, setSettings } from "~/Settings";
import { BdsButton } from "blip-ds/dist/blip-ds-react";
import { createToast } from "~/Utils";

export const EventTrackingConfig = (): JSX.Element => {
  const [trackingSettings, setTrackingSettings] = React.useState(
    Settings.lastEventTracking
  );
  const [isAutoEventTrackingActive, setIsAutoEventTrackingActive] =
    React.useState(Settings.isAutoEventTrackingActive);

  React.useEffect(() => {
    chrome.storage.sync.get("settings", ({ settings }) => {
      setTrackingSettings(settings.lastEventTracking);
    });
  }, []);

  const updateIsAutoEventTrackingActive = (): void => {
    setSettings({
      isAutoEventTrackingActive: !isAutoEventTrackingActive,
    });
    setIsAutoEventTrackingActive(!isAutoEventTrackingActive);
  };

  const updateSettings = (): void => {
    setSettings({
      lastEventTracking: trackingSettings,
    });

    createToast({
      toastText: "Configurações salvas com sucesso!",
      toastTitle: "Sucesso!",
      variant: "success",
      duration: 2,
    });
  };

  return (
    <Block padding={0}>
      <Switch
        name="Ativar tracking automático"
        isChecked={isAutoEventTrackingActive}
        onChange={updateIsAutoEventTrackingActive}
      />
      <HorizontalStack marginTop={2}>
        <BdsButton type="submit" variant="primary" onClick={updateSettings}>
          Salvar
        </BdsButton>
      </HorizontalStack>
    </Block>
  );
};
