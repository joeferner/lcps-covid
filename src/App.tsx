import axios from "axios";
import { useEffect, useState } from "react";
import { CurrentTotals } from "./CurrentTotals";
import { DailyData } from "./model/DailyData";

export function App() {
  const [dailyData, setDailyData] = useState<DailyData[] | undefined>(undefined);
  const [mostRecentDailyData, setMostRecentDailyData] = useState<DailyData | undefined>(undefined);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    const response = await axios.get('/data.json');
    const responseDailyData = (response.data as DailyData[])
      .map(a => {
        a.date = new Date(a.date);
        return a;
      })
      .sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      });
    setDailyData(responseDailyData);
    setMostRecentDailyData(responseDailyData[responseDailyData.length - 1]);
  };

  return (
    <div>
      <CurrentTotals data={mostRecentDailyData} />
    </div>
  );
}
