import * as React from "react";
import {
  Block,
  Flex,
  Paragraph,
  Stack,
  Switch,
  Title,
  HorizontalStack,
} from "@components";
import { Settings, setSettings } from "~/Settings";
import { BdsButton } from "blip-ds/dist/blip-ds-react";
import { createToast } from "~/Utils";

export const AutomateConfig = (): JSX.Element => {
  const [isAutoEventTrackingActive, setIsAutoEventTrackingActive] =
    React.useState(Settings.isAutoEventTrackingActive);
  const [isAutoScriptEnabled, setIsAutoScriptEnabled] = React.useState(
    Settings.isAutoScriptEnabled
  );

  React.useEffect(() => {
    chrome.storage.sync.get("settings", ({ settings }) => {
      if (settings) {
        setIsAutoEventTrackingActive(settings.isAutoEventTrackingActive);
        setIsAutoScriptEnabled(settings.isAutoScriptEnabled);
      }
    });
  }, []);

  const updateIsAutoEventTrackingActive = (): void => {
    const newValue = !isAutoEventTrackingActive;
    setSettings({ isAutoEventTrackingActive: newValue });
    setIsAutoEventTrackingActive(newValue);
  };

  const updateIsAutoScriptEnabled = (): void => {
    const newValue = !isAutoScriptEnabled;
    setSettings({ isAutoScriptEnabled: newValue });
    setIsAutoScriptEnabled(newValue);
  };

  const showSuccessToast = (): void => {
    createToast({
      toastText: "Configurações salvas com sucesso!",
      toastTitle: "Sucesso!",
      variant: "success",
      duration: 2,
    });
  };

  return (
    <Block padding={0}>
      <Paragraph>
        Gerencie as automações do fluxo de trabalho.
      </Paragraph>
      <Stack gap={1.5} marginTop={2}>
        {/* Auto Event Tracking */}
        <Flex alignItems="flex-start">
          <Switch
            name="auto-event-tracking"
            isChecked={isAutoEventTrackingActive}
            onChange={updateIsAutoEventTrackingActive}
          />
          <Block marginLeft={1.5}>
            <Title>Tracking de Eventos Automático</Title>
            <Paragraph>
              Adiciona automaticamente os eventos de tracking de entrada e saída
              em cada bloco do fluxo.
            </Paragraph>
          </Block>
        </Flex>

        {/* Auto Script */}
        <Flex alignItems="flex-start">
          <Switch
            name="auto-script"
            isChecked={isAutoScriptEnabled}
            onChange={updateIsAutoScriptEnabled}
          />
          <Block marginLeft={1.5}>
            <Title>Script de Entrada Automático</Title>
            <Paragraph>
              Adiciona um script de entrada em blocos com menu ou resposta
              rápida para tratar o conteúdo do input.
            </Paragraph>
          </Block>
        </Flex>
      </Stack>

      <HorizontalStack marginTop={4}>
        <BdsButton type="submit" variant="primary" onClick={showSuccessToast}>
          Salvar
        </BdsButton>
      </HorizontalStack>
    </Block>
  );
};
