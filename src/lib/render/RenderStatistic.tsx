import React from "react";
import { ConfigProvider, type Config } from "../../contexts/config-context.tsx";
import ReactDOM from "react-dom/client";
import { Theme } from "../../components/Theme";
import { Statistic } from "../../features/Statistic";

export function renderStatistic(element: HTMLElement, config: Config) {
  const StatisticTab: React.FC<Config> = (config) => {
    return (
      <ConfigProvider config={config}>
        <Theme>
          <Statistic />
        </Theme>
      </ConfigProvider>
    );
  };
  ReactDOM.createRoot(element).render(<StatisticTab {...config} />);
}
